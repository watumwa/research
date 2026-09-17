from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'development-only-secret-key-change-me')
IS_VERCEL = bool(os.getenv('VERCEL'))
DEBUG = os.getenv('DJANGO_DEBUG', 'False' if IS_VERCEL else 'True').lower() == 'true'
default_hosts = 'localhost,127.0.0.1,.vercel.app' if IS_VERCEL else 'localhost,127.0.0.1'
ALLOWED_HOSTS = [x.strip() for x in os.getenv('DJANGO_ALLOWED_HOSTS', default_hosts).split(',') if x.strip()]
for vercel_host_var in ('VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL'):
    host = os.getenv(vercel_host_var, '').strip().replace('https://', '').replace('http://', '').strip('/')
    if host and host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)

INSTALLED_APPS = [
    'unfold',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'accounts',
    'learning',
    'store',
]

UNFOLD = {
    'SITE_TITLE': 'Research Blueprint Admin',
    'SITE_HEADER': 'Research Blueprint',
    'SITE_SYMBOL': 'school',
    'SHOW_HISTORY': True,
    'SHOW_VIEW_ON_SITE': True,
    'THEME': 'light',
    'SIDEBAR': {
        'show_search': True,
        'show_all_applications': False,
        'navigation': [
            {
                'title': 'Workspace',
                'items': [
                    {
                        'title': 'Users',
                        'icon': 'group',
                        'link': '/admin/accounts/user/',
                    },
                    {
                        'title': 'Payments',
                        'icon': 'payments',
                        'link': '/admin/learning/payment/',
                    },
                    {
                        'title': 'Notifications',
                        'icon': 'notifications',
                        'link': '/admin/learning/notification/',
                    },
                ],
            },
            {
                'title': 'Learning library',
                'items': [
                    {
                        'title': 'Courses',
                        'icon': 'school',
                        'link': '/admin/learning/course/',
                    },
                    {
                        'title': 'Modules',
                        'icon': 'view_quilt',
                        'link': '/admin/learning/module/',
                    },
                    {
                        'title': 'Lessons',
                        'icon': 'menu_book',
                        'link': '/admin/learning/lesson/',
                    },
                    {
                        'title': 'Resources',
                        'icon': 'library_books',
                        'link': '/admin/learning/resource/',
                    },
                ],
            },
            {
                'title': 'Learner activity',
                'items': [
                    {
                        'title': 'Progress',
                        'icon': 'trending_up',
                        'link': '/admin/learning/lessonprogress/',
                    },
                    {
                        'title': 'Quiz attempts',
                        'icon': 'fact_check',
                        'link': '/admin/learning/quizattempt/',
                    },
                    {
                        'title': 'Builder drafts',
                        'icon': 'edit_note',
                        'link': '/admin/learning/builderdraft/',
                    },
                    {
                        'title': 'Entitlements',
                        'icon': 'verified',
                        'link': '/admin/learning/entitlement/',
                    },
                ],
            },
            {
                'title': 'Support',
                'items': [
                    {
                        'title': 'Contact messages',
                        'icon': 'mail',
                        'link': '/admin/learning/contactmessage/',
                    },
                ],
            },
        ],
    },
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASE_URL = os.getenv('DATABASE_URL', '').strip()
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
AUTH_USER_MODEL = 'accounts.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Kampala'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Local development uses the filesystem. Production can switch to Amazon S3 or
# any S3-compatible service (for example Cloudflare R2) by setting
# AWS_STORAGE_BUCKET_NAME and the related environment variables below.
if os.getenv('AWS_STORAGE_BUCKET_NAME', '').strip():
    STORAGES = {
        'default': {'BACKEND': 'storages.backends.s3.S3Storage'},
        'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
    }
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', '')
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', '') or None
    AWS_S3_ENDPOINT_URL = os.getenv('AWS_S3_ENDPOINT_URL', '') or None
    AWS_S3_CUSTOM_DOMAIN = os.getenv('AWS_S3_CUSTOM_DOMAIN', '') or None
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = True
    AWS_S3_FILE_OVERWRITE = False
else:
    STORAGES = {
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
    }
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

def csv_env(name, default=''):
    return [x.strip().rstrip('/') for x in os.getenv(name, default).split(',') if x.strip()]

CORS_ALLOWED_ORIGINS = csv_env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')
CORS_ALLOWED_ORIGIN_REGEXES = csv_env('CORS_ALLOWED_ORIGIN_REGEXES')
CSRF_TRUSTED_ORIGINS = csv_env('CSRF_TRUSTED_ORIGINS') or CORS_ALLOWED_ORIGINS.copy()

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticatedOrReadOnly',),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'no-reply@localhost')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
GOOGLE_OAUTH_CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID', '')
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

# Flutterwave Uganda Mobile Money
FLW_SECRET_KEY = os.getenv('FLW_SECRET_KEY', '')
FLW_SECRET_HASH = os.getenv('FLW_SECRET_HASH', '')
FLW_BASE_URL = os.getenv('FLW_BASE_URL', 'https://api.flutterwave.com/v3').rstrip('/')
FLW_HTTP_TIMEOUT = int(os.getenv('FLW_HTTP_TIMEOUT', '25'))

# Explicit merchant payout destination. Keep the phone in international format.
FLW_PAYOUT_MOBILE_NUMBER = os.getenv('FLW_PAYOUT_MOBILE_NUMBER', '256762640590').strip()
FLW_PAYOUT_BANK_CODE = os.getenv('FLW_PAYOUT_BANK_CODE', 'MPS').strip() or 'MPS'
FLW_PAYOUT_BENEFICIARY_NAME = os.getenv('FLW_PAYOUT_BENEFICIARY_NAME', 'Research Skills Payout').strip()
FLW_AUTO_PAYOUT = os.getenv('FLW_AUTO_PAYOUT', 'False').lower() == 'true'
