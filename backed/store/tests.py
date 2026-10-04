from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from .models import Material, StorePayment
from .serializers import AdminMaterialSerializer


class VideoContentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.free_video = Material.objects.create(
            title='Research questions in five minutes',
            slug='research-questions-video',
            category='Research',
            description='A short video lesson.',
            content_type=Material.ContentType.VIDEO,
            file_type='VIDEO',
            video_url='https://www.youtube.com/watch?v=example123',
            access=Material.Access.FREE,
        )

    def test_free_video_is_playable_from_public_catalogue(self):
        response = self.client.get('/api/store/materials/')

        self.assertEqual(response.status_code, 200)
        item = next(row for row in response.json() if row['slug'] == self.free_video.slug)
        self.assertEqual(item['content_type'], 'video')
        self.assertEqual(item['playback_url'], self.free_video.video_url)

    def test_public_catalogue_includes_the_cover_image(self):
        self.free_video.cover_image.name = 'materials/covers/test-cover.jpg'
        self.free_video.save(update_fields=['cover_image'])

        response = self.client.get('/api/store/materials/')
        item = next(row for row in response.json() if row['slug'] == self.free_video.slug)

        self.assertTrue(item['cover_image'].endswith('/media/materials/covers/test-cover.jpg'))

    def test_paid_video_link_is_not_exposed_before_payment(self):
        paid_video = Material.objects.create(
            title='Premium methods workshop',
            slug='premium-methods-workshop',
            category='Research',
            description='A premium workshop.',
            content_type=Material.ContentType.VIDEO,
            file_type='VIDEO',
            video_url='https://vimeo.com/123456',
            access=Material.Access.PAID,
            price=15000,
        )

        response = self.client.get('/api/store/materials/')
        item = next(row for row in response.json() if row['slug'] == paid_video.slug)

        self.assertEqual(item['playback_url'], '')

    def test_paid_video_is_returned_after_confirmed_payment(self):
        paid_video = Material.objects.create(
            title='Premium methods workshop',
            slug='premium-methods-workshop',
            category='Research',
            description='A premium workshop.',
            content_type=Material.ContentType.VIDEO,
            file_type='VIDEO',
            video_url='https://vimeo.com/123456',
            access=Material.Access.PAID,
            price=15000,
        )
        payment = StorePayment.objects.create(
            material=paid_video,
            customer_name='Learner One',
            customer_email='learner@example.com',
            customer_phone='256700000000',
            network='MTN',
            amount=paid_video.price,
            currency='UGX',
            tx_ref='TEST-VIDEO-PAID',
            status=StorePayment.Status.PAID,
        )

        response = self.client.get(f'/api/store/payments/{payment.id}/status/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['delivery_type'], 'video')
        self.assertEqual(response.json()['delivery_url'], paid_video.video_url)

    def test_published_video_requires_an_upload_or_link(self):
        serializer = AdminMaterialSerializer(data={
            'title': 'Incomplete video',
            'category': 'Research',
            'description': 'Missing its source.',
            'content_type': 'video',
            'type': 'VIDEO',
            'access': 'free',
            'published': True,
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('file', serializer.errors)

    def test_cover_upload_rejects_non_image_extensions(self):
        serializer = AdminMaterialSerializer(data={
            'title': 'Video with bad cover',
            'category': 'Research',
            'description': 'The cover is not an image.',
            'content_type': 'video',
            'type': 'VIDEO',
            'video_url': 'https://www.youtube.com/watch?v=example123',
            'cover_image': SimpleUploadedFile('cover.txt', b'not an image', content_type='text/plain'),
            'access': 'free',
            'published': True,
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('cover_image', serializer.errors)
