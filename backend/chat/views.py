from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth.models import User
from django.db.models import Q
from .models import ChatMessage

class ChatMessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin = user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)
        target_user_id = request.query_params.get('target_user')

        # 1. Provide Chat History / Thread Roster for Admins
        threads = []
        if is_admin:
            # Query all distinct learners who have interacted or exist in the system
            all_learners = User.objects.filter(is_staff=False).exclude(id=user.id)
            for learner in all_learners:
                last_msg = ChatMessage.objects.filter(
                    Q(sender=learner) | Q(receiver=learner)
                ).order_by('-timestamp').first()

                unread_count = ChatMessage.objects.filter(
                    sender=learner, receiver=user
                ).count()

                threads.append({
                    'user_id': learner.id,
                    'username': learner.username,
                    'email': learner.email,
                    'last_message': last_msg.message if last_msg else "No messages yet",
                    'last_timestamp': last_msg.timestamp.strftime('%b %d, %H:%M') if last_msg else "",
                    'has_history': last_msg is not None
                })
            # Sort threads so learners with recent messages appear first
            threads.sort(key=lambda x: x['last_timestamp'], reverse=True)

        # 2. Retrieve Conversation Messages
        if is_admin:
            if target_user_id:
                # Messages between the Admin and the selected Learner
                messages = ChatMessage.objects.filter(
                    (Q(sender_id=target_user_id) & (Q(receiver=user) | Q(receiver__isnull=True))) |
                    (Q(sender=user) & Q(receiver_id=target_user_id)) |
                    (Q(sender_id=target_user_id) & Q(is_admin_reply=False))
                ).order_by('timestamp')
            else:
                # Default to all incoming messages if no learner selected
                messages = ChatMessage.objects.all().order_by('timestamp')
        else:
            # For Learner: Retrieve full history of messages sent by or destined to this learner
            messages = ChatMessage.objects.filter(
                Q(sender=user) | Q(receiver=user)
            ).order_by('timestamp')

        serialized_messages = [{
            'id': m.id,
            'sender': m.sender.username,
            'sender_id': m.sender.id,
            'receiver': m.receiver.username if m.receiver else 'Support Desk',
            'receiver_id': m.receiver.id if m.receiver else None,
            'message': m.message,
            'is_admin_reply': m.is_admin_reply,
            'timestamp': m.timestamp.strftime('%b %d, %H:%M')
        } for m in messages]

        return Response({
            'messages': serialized_messages,
            'threads': threads
        })

    def post(self, request):
        user = request.user
        text = request.data.get('message', '').strip()
        receiver_id = request.data.get('receiver_id')
        is_admin = user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)

        if not text:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        receiver = None
        if receiver_id:
            receiver = User.objects.filter(id=receiver_id).first()
        elif not is_admin:
            # If a learner sends without receiver_id, route to primary admin
            receiver = User.objects.filter(Q(is_staff=True) | Q(profile__is_admin=True)).first()

        msg = ChatMessage.objects.create(
            sender=user,
            receiver=receiver,
            message=text,
            is_admin_reply=is_admin
        )

        return Response({
            'id': msg.id,
            'sender': user.username,
            'sender_id': user.id,
            'receiver': receiver.username if receiver else 'Support Desk',
            'receiver_id': receiver.id if receiver else None,
            'message': msg.message,
            'is_admin_reply': msg.is_admin_reply,
            'timestamp': msg.timestamp.strftime('%b %d, %H:%M')
        }, status=status.HTTP_201_CREATED)