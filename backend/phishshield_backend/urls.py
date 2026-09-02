from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from scanner.views import URLScanAPIView
from chat.views import ChatMessageListCreateView

def api_root(request):
    return JsonResponse({
        "status": "online",
        "platform": "PhishShield Cybersecurity API Gateway",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/",
            "scanner": "/api/scanner/scan/",
            "simulation": "/api/simulation/",
            "lms": "/api/lms/",
            "chat": "/api/chat/",
            "recovery": "/api/recovery/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/scanner/scan/', URLScanAPIView.as_view(), name='url_scan'),
    path('api/chat/', ChatMessageListCreateView.as_view(), name='chat_api'),
    path('api/lms/', include('lms_content.urls')),
    path('api/simulation/', include('simulation.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/recovery/', include('recovery.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)