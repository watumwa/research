import re
import uuid
from decimal import Decimal, InvalidOperation

import requests
from django.conf import settings


class FlutterwaveError(Exception):
    pass


def normalize_ugandan_phone(value):
    digits = re.sub(r'\D+', '', str(value or ''))
    if digits.startswith('256') and len(digits) == 12:
        return digits
    if digits.startswith('0') and len(digits) == 10:
        return '256' + digits[1:]
    if len(digits) == 9 and digits[0] in {'7', '3'}:
        return '256' + digits
    raise ValueError('Enter a valid Ugandan mobile-money number, e.g. 0772123456 or 256772123456.')


def generate_tx_ref():
    return f'RS-{uuid.uuid4().hex[:20].upper()}'


def _headers():
    secret = settings.FLW_SECRET_KEY.strip()
    if not secret:
        raise FlutterwaveError('Flutterwave is not configured. Set FLW_SECRET_KEY on the backend.')
    return {
        'Authorization': f'Bearer {secret}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }


def initiate_uganda_mobile_money(payment):
    redirect_url = f"{settings.FRONTEND_URL}/?payment={payment.id}"
    payload = {
        'phone_number': payment.customer_phone,
        'network': payment.network,
        'amount': int(payment.amount) if payment.amount == int(payment.amount) else float(payment.amount),
        'currency': payment.currency,
        'email': payment.customer_email,
        'tx_ref': payment.tx_ref,
        'fullname': payment.customer_name,
        'redirect_url': redirect_url,
        'meta': {
            'store_payment_id': str(payment.id),
            'material_slug': payment.material.slug,
        },
    }
    try:
        response = requests.post(
            f'{settings.FLW_BASE_URL}/charges?type=mobile_money_uganda',
            json=payload,
            headers=_headers(),
            timeout=settings.FLW_HTTP_TIMEOUT,
        )
        body = response.json()
    except requests.RequestException as exc:
        raise FlutterwaveError(f'Could not reach Flutterwave: {exc}') from exc
    except ValueError as exc:
        raise FlutterwaveError('Flutterwave returned an unreadable response.') from exc

    if response.status_code >= 400 or body.get('status') != 'success':
        message = body.get('message') or 'Flutterwave could not start the payment.'
        raise FlutterwaveError(message)
    return body


def verify_by_reference(tx_ref):
    try:
        response = requests.get(
            f'{settings.FLW_BASE_URL}/transactions/verify_by_reference',
            params={'tx_ref': tx_ref},
            headers=_headers(),
            timeout=settings.FLW_HTTP_TIMEOUT,
        )
        body = response.json()
    except requests.RequestException as exc:
        raise FlutterwaveError(f'Could not verify payment with Flutterwave: {exc}') from exc
    except ValueError as exc:
        raise FlutterwaveError('Flutterwave returned an unreadable verification response.') from exc
    if response.status_code >= 400:
        raise FlutterwaveError(body.get('message') or 'Flutterwave could not verify the payment.')
    return body


def transaction_matches(payment, data):
    try:
        amount = Decimal(str(data.get('amount')))
    except (InvalidOperation, TypeError):
        return False
    return (
        str(data.get('status', '')).lower() == 'successful'
        and str(data.get('tx_ref', '')) == payment.tx_ref
        and str(data.get('currency', '')).upper() == payment.currency.upper()
        and amount >= payment.amount
    )


def initiate_mobile_money_payout(payout):
    """Send a payout from the merchant Flutterwave balance to the configured Uganda MoMo destination."""
    payload = {
        'account_bank': payout.destination_bank_code,
        'account_number': payout.destination_number,
        'amount': int(payout.amount) if payout.amount == int(payout.amount) else float(payout.amount),
        'currency': payout.currency,
        'beneficiary_name': payout.beneficiary_name,
        'reference': payout.reference,
        'narration': f'Payout for {payout.payment.tx_ref}',
    }
    try:
        response = requests.post(
            f'{settings.FLW_BASE_URL}/transfers',
            json=payload,
            headers=_headers(),
            timeout=settings.FLW_HTTP_TIMEOUT,
        )
        body = response.json()
    except requests.RequestException as exc:
        raise FlutterwaveError(f'Could not reach Flutterwave for payout: {exc}') from exc
    except ValueError as exc:
        raise FlutterwaveError('Flutterwave returned an unreadable payout response.') from exc

    if response.status_code >= 400 or body.get('status') != 'success':
        raise FlutterwaveError(body.get('message') or 'Flutterwave could not create the payout.')
    return body


def get_transfer(transfer_id):
    try:
        response = requests.get(
            f'{settings.FLW_BASE_URL}/transfers/{transfer_id}',
            headers=_headers(),
            timeout=settings.FLW_HTTP_TIMEOUT,
        )
        body = response.json()
    except requests.RequestException as exc:
        raise FlutterwaveError(f'Could not check Flutterwave payout: {exc}') from exc
    except ValueError as exc:
        raise FlutterwaveError('Flutterwave returned an unreadable payout-status response.') from exc
    if response.status_code >= 400:
        raise FlutterwaveError(body.get('message') or 'Flutterwave could not check the payout.')
    return body
