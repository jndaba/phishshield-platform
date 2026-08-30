import uuid
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, ActivityAudit

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'learner')  # 'admin' or 'learner'
        admin_key = request.data.get('admin_key', '')

        if not username or not email or not password:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        is_admin_user = False
        if role == 'admin':
            if admin_key != settings.ADMIN_SIGNUP_KEY:
                return Response({'error': 'Invalid Admin Verification Key.'}, status=status.HTTP_403_FORBIDDEN)
            is_admin_user = True

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = is_admin_user
        user.save()

        profile = user.profile
        profile.is_admin = is_admin_user
        profile.save()

        # Seed initial audit trail
        ActivityAudit.objects.create(
            user=user,
            title="Account Created",
            description="Initialized PhishShield security profile",
            activity_type="account"
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': profile.is_admin,
                'readiness_score': profile.readiness_score
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        admin_key = request.data.get('admin_key', '').strip()

        user = User.objects.filter(username=username).first()
        if not user or not user.check_password(password):
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Enforce Admin Key validation if account is Admin
        if user.is_staff or user.profile.is_admin:
            if admin_key != settings.ADMIN_SIGNUP_KEY:
                return Response({'error': 'Valid Admin Key required for administrative console access.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.profile.is_admin,
                'readiness_score': user.profile.readiness_score
            }
        })

class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'message': 'If this email exists in our records, a recovery link has been dispatched.'}, status=200)

        token = str(uuid.uuid4())
        user.profile.reset_password_token = token
        user.profile.save()

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_mail(
            subject="PhishShield Security - Password Reset Request",
            message=f"Hello {user.username},\n\nA request was made to reset your password. Click the link below:\n\n{reset_link}\n\nIf you did not request this, please disregard.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({'message': 'If this email exists in our records, a recovery link has been dispatched.'}, status=200)

class ResetPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not token or not new_password:
            return Response({'error': 'Token and new password are required.'}, status=400)

        profile = UserProfile.objects.filter(reset_password_token=token).first()
        if not profile:
            return Response({'error': 'Invalid or expired password reset link.'}, status=400)

        user = profile.user
        user.set_password(new_password)
        user.save()

        profile.reset_password_token = None
        profile.save()

        return Response({'message': 'Password has been successfully updated. You can now login.'}, status=200)

class CurrentUserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        activities = ActivityAudit.objects.filter(user=user).order_by('-timestamp')[:5]

        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
                'is_admin': profile.is_admin,
                'readiness_score': profile.readiness_score,
                'streak_days': profile.streak_days,
            },
            'recent_activity': [{
                'title': a.title,
                'desc': a.description,
                'type': a.activity_type,
                'risk': a.risk_score,
                'date': a.timestamp.strftime('%b %d')
            } for a in activities]
        })