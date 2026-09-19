import uuid
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status, permissions, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, ActivityAudit, PlatformContact
from lms_content.models import LearningModule, UserProgress
from simulation.models import SimulationResult, QuizSubmission


# ====================================================
# 1. Authentication & Lifecycle Endpoints
# ====================================================

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'learner')
        admin_key = request.data.get('admin_key', '')

        if not username or not email or not password:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        is_admin_user = False
        if role == 'admin':
            if admin_key != getattr(settings, 'ADMIN_SIGNUP_KEY', 'PHISH_ADMIN_2026'):
                return Response({'error': 'Invalid Admin Verification Key.'}, status=status.HTTP_403_FORBIDDEN)
            is_admin_user = True

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = is_admin_user
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.is_admin = is_admin_user
        profile.readiness_score = 0
        profile.save()

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

        is_staff_or_admin = user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)
        if is_staff_or_admin:
            expected_key = getattr(settings, 'ADMIN_SIGNUP_KEY', 'PHISH_ADMIN_2026')
            if admin_key != expected_key:
                return Response({'error': 'Valid Admin Key required for administrative console access.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        user_profile = getattr(user, 'profile', None)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user_profile.is_admin if user_profile else user.is_staff,
                'readiness_score': user_profile.readiness_score if user_profile else 0
            }
        })


class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'message': 'If this email exists, a recovery link has been dispatched.'}, status=200)

        token = str(uuid.uuid4())
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.reset_password_token = token
        profile.save()

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={token}"
        send_mail(
            subject="PhishShield Security - Password Reset Request",
            message=f"Hello {user.username},\n\nClick the link below to reset your password:\n\n{reset_link}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'security@phishshield.local'),
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({'message': 'If this email exists, a recovery link has been dispatched.'}, status=200)


class ResetPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        profile = UserProfile.objects.filter(reset_password_token=token).first()
        if not profile:
            return Response({'error': 'Invalid or expired password reset link.'}, status=400)

        user = profile.user
        user.set_password(new_password)
        user.save()

        profile.reset_password_token = None
        profile.save()

        return Response({'message': 'Password has been successfully updated.'}, status=200)


# ====================================================
# 2. Performance Metrics & Dashboard Aggregation
# ====================================================

class CurrentUserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        total_modules = LearningModule.objects.count()
        completed_modules = UserProgress.objects.filter(user=user, completed=True).count()
        progress_percentage = round((completed_modules / total_modules * 100), 1) if total_modules > 0 else 0

        sim_results = SimulationResult.objects.filter(user=user)
        total_sims = sim_results.count()
        correct_sims = sim_results.filter(is_correct=True).count()
        sim_accuracy = round((correct_sims / total_sims * 100), 1) if total_sims > 0 else 0

        url_scans_count = ActivityAudit.objects.filter(user=user, activity_type="url_scan").count()
        activities = ActivityAudit.objects.filter(user=user).order_by('-timestamp')[:5]

        passed_quiz = QuizSubmission.objects.filter(user=user, passed=True).exists()

        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
                'is_admin': profile.is_admin,
                'readiness_score': profile.readiness_score,
                'streak_days': profile.streak_days,
            },
            'stats': {
                'total_modules': total_modules,
                'completed_modules': completed_modules,
                'progress_percentage': progress_percentage,
                'total_simulations': total_sims,
                'sim_accuracy': sim_accuracy,
                'urls_scanned': url_scans_count,
                'is_certified': passed_quiz and (completed_modules >= total_modules and total_modules > 0)
            },
            'recent_activity': [{
                'title': a.title,
                'desc': a.description,
                'type': a.activity_type,
                'risk': a.risk_score,
                'date': a.timestamp.strftime('%b %d')
            } for a in activities]
        })


class AdminMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin = user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)
        
        if not is_admin:
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        learners = User.objects.filter(is_staff=False).exclude(id=user.id)
        if hasattr(User, 'profile'):
            learners = learners.filter(Q(profile__is_admin=False) | Q(profile__isnull=True))

        total_learners = learners.count()
        total_modules = LearningModule.objects.count()

        learner_data = []
        for l in learners:
            c_mods = UserProgress.objects.filter(user=l, completed=True).count()
            sims = SimulationResult.objects.filter(user=l).count()
            last_act = ActivityAudit.objects.filter(user=l).first()
            is_cert = QuizSubmission.objects.filter(user=l, passed=True).exists() and (c_mods >= total_modules and total_modules > 0)
            readiness = getattr(getattr(l, 'profile', None), 'readiness_score', 0)

            learner_data.append({
                'id': l.id,
                'username': l.username,
                'email': l.email,
                'completed_modules': c_mods,
                'total_modules': total_modules,
                'simulations_completed': sims,
                'readiness_score': readiness,
                'is_certified': is_cert,
                'last_active': last_act.timestamp.strftime('%b %d, %H:%M') if last_act else 'Never'
            })

        recent_audits = ActivityAudit.objects.all().order_by('-timestamp')[:8]

        return Response({
            'total_learners': total_learners,
            'total_modules': total_modules,
            'learners': learner_data,
            'audit_trail': [{
                'user': a.user.username,
                'title': a.title,
                'desc': a.description,
                'type': a.activity_type,
                'risk': a.risk_score,
                'date': a.timestamp.strftime('%b %d, %H:%M')
            } for a in recent_audits]
        })


# ====================================================
# 3. Support Helpdesk Active Admin Selector
# ====================================================

class ActiveAdminListView(APIView):
    """Returns active platform administrators available for learner triage chats."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        admins = User.objects.filter(is_staff=True) | User.objects.filter(profile__is_admin=True)
        admins = admins.distinct().order_by('username')

        data = [{
            'id': a.id,
            'username': a.username,
            'email': a.email,
            'full_name': a.get_full_name() or a.username,
            'role': 'Lead Cybersecurity Coordinator' if a.is_superuser else 'Security Support Admin',
            'is_online': True
        } for a in admins]

        return Response(data)


# ====================================================
# 4. Support Contact Directory Management
# ====================================================

class PlatformContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformContact
        fields = '__all__'


class PlatformContactView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Guarantee initial baseline contact (Joel Ndaba) exists
        if not PlatformContact.objects.exists():
            PlatformContact.objects.create(
                name="Joel Ndaba",
                role="Lead Cybersecurity Coordinator",
                phone="+25421952909",
                email="joelndaba24@gmail.com",
                institution="Icons Computer School and Cyber",
                office_location="Icons Cyber Lab, Block B, Room 204"
            )
        contacts = PlatformContact.objects.all().order_by('id')
        serializer = PlatformContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Admin permissions required.'}, status=status.HTTP_403_FORBIDDEN)

        payload = {
            'name': request.data.get('name', '').strip(),
            'role': request.data.get('role', 'Support Officer').strip(),
            'phone': request.data.get('phone', '').strip(),
            'email': request.data.get('email', '').strip(),
            'office_location': request.data.get('office_location') or request.data.get('office', 'Main Campus'),
            'institution': request.data.get('institution', 'Icons Computer School and Cyber')
        }

        serializer = PlatformContactSerializer(data=payload)
        if serializer.is_valid():
            contact = serializer.save()
            ActivityAudit.objects.create(
                user=request.user,
                title="Support Contact Added",
                description=f"Added contact {contact.name} ({contact.role})",
                activity_type="governance"
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlatformContactDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _check_admin(self, user):
        return user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)

    def put(self, request, contact_id):
        if not self._check_admin(request.user):
            return Response({'error': 'Admin permissions required.'}, status=status.HTTP_403_FORBIDDEN)

        contact = get_object_or_404(PlatformContact, id=contact_id)
        payload = request.data.copy()
        if 'office' in payload:
            payload['office_location'] = payload['office']

        serializer = PlatformContactSerializer(contact, data=payload, partial=True)
        if serializer.is_valid():
            serializer.save()
            ActivityAudit.objects.create(
                user=request.user,
                title="Support Contact Updated",
                description=f"Updated contact #{contact.id}: {contact.name}",
                activity_type="governance"
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, contact_id):
        if not self._check_admin(request.user):
            return Response({'error': 'Admin permissions required.'}, status=status.HTTP_403_FORBIDDEN)

        contact = get_object_or_404(PlatformContact, id=contact_id)
        contact_name = contact.name
        contact.delete()

        ActivityAudit.objects.create(
            user=request.user,
            title="Support Contact Deleted",
            description=f"Deleted directory contact: {contact_name}",
            activity_type="governance"
        )
        return Response({'message': f'Contact "{contact_name}" removed successfully.'}, status=status.HTTP_200_OK)


# ====================================================
# 5. User Account & Role Administration
# ====================================================

class AdminAllUsersListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().order_by('-date_joined')
        data = [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_admin': u.is_staff or getattr(getattr(u, 'profile', None), 'is_admin', False),
            'readiness_score': getattr(getattr(u, 'profile', None), 'readiness_score', 0),
            'date_joined': u.date_joined.strftime('%b %d, %Y'),
            'is_self': u.id == request.user.id
        } for u in users]

        return Response(data)


class AdminUserDetailManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _check_admin(self, user):
        return user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)

    def delete(self, request, user_id):
        if not self._check_admin(request.user):
            return Response({'error': 'Forbidden: Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        if request.user.id == user_id:
            return Response({'error': 'Safety restriction: You cannot delete your own active admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        target_user = User.objects.filter(id=user_id).first()
        if not target_user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        username = target_user.username
        target_user.delete()

        ActivityAudit.objects.create(
            user=request.user,
            title=f"Deleted Account: {username}",
            description=f"Admin {request.user.username} permanently deleted user ID {user_id}",
            activity_type="account",
            risk_score="CRITICAL"
        )
        return Response({'message': f'Account {username} permanently deleted.'}, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        if not self._check_admin(request.user):
            return Response({'error': 'Forbidden: Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        target_user = User.objects.filter(id=user_id).first()
        if not target_user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_admin = request.data.get('is_admin')
        reset_score = request.data.get('reset_score')

        profile, _ = UserProfile.objects.get_or_create(user=target_user)

        if is_admin is not None:
            if target_user.id == request.user.id and not is_admin:
                return Response({'error': 'Safety restriction: You cannot demote your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)
            target_user.is_staff = bool(is_admin)
            target_user.save()
            profile.is_admin = bool(is_admin)
            profile.save()

        if reset_score:
            profile.readiness_score = 0
            profile.simulations_completed = 0
            profile.save()

        return Response({
            'message': f'Updated {target_user.username} permissions successfully.',
            'is_admin': profile.is_admin,
            'readiness_score': profile.readiness_score
        }, status=status.HTTP_200_OK)


# ====================================================
# 6. User Profile & Credential Management
# ====================================================

class UserProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if username and username != user.username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({'error': 'Username is already taken by another user.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username

        if email and email != user.email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'error': 'Email is already registered with another account.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        if new_password:
            if not current_password:
                return Response({'error': 'Current password is required to set a new password.'}, status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(current_password):
                return Response({'error': 'Current password does not match.'}, status=status.HTTP_400_BAD_REQUEST)
            if len(new_password) < 6:
                return Response({'error': 'New password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()

        ActivityAudit.objects.create(
            user=user,
            title="Profile Credentials Updated",
            description="User modified account credentials or passphrase",
            activity_type="account"
        )

        return Response({
            'message': 'Profile updated successfully.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False),
                'readiness_score': getattr(getattr(user, 'profile', None), 'readiness_score', 0)
            }
        }, status=status.HTTP_200_OK)