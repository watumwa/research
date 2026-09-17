from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import EmailTokenObtainPairView


def health_check(request):
    return JsonResponse({'service': 'research-blueprint-api', 'status': 'ok'})


urlpatterns = [
    path('', health_check, name='health-check'),
    path('api/health/', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('learning.urls')),
    path('api/store/', include('store.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
