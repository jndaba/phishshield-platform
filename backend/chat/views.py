from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SupportTicketMessage
from authentication.models import ActivityAudit


class ChatThreadView(APIView):
    """
    Handles bidirectional messaging threads between learners and administrators.
    Learners can specify which admin to message via `target_user_id`.
    Admins can specify which learner to reply to via `target_user_id`.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Background sidebar badge polling query
        if request.query_params.get('unread_summary') == 'true':
            unread_count = SupportTicketMessage.objects.filter(
                recipient=user, 
                is_read=False
            ).count()
            return Response({'total_unread': unread_count}, status=status.HTTP_200_OK)

        target_user_id = request.query_params.get('target_user_id')

        # If no counterparty selected, auto-select the first available participant
        if not target_user_id:
            is_admin = user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)
            if is_admin:
                # Find the most recent learner who sent a message
                latest = SupportTicketMessage.objects.filter(
                    Q(recipient=user) | Q(sender=user)
                ).order_by('-created_at').first()
                if latest:
                    target_user = latest.sender if latest.sender != user else latest.recipient
                else:
                    target_user = User.objects.filter(is_staff=False).exclude(id=user.id).first()
            else:
                # Learner auto-targets the first active admin
                target_user = User.objects.filter(
                    Q(is_staff=True) | Q(profile__is_admin=True)
                ).exclude(id=user.id).first()

            if not target_user:
                return Response({'messages': [], 'active_counterparty': None}, status=status.HTTP_200_OK)
        else:
            target_user = get_object_or_404(User, id=target_user_id)

        # Retrieve bidirectional thread
        messages = SupportTicketMessage.objects.filter(
            (Q(sender=user) & Q(recipient=target_user)) |
            (Q(sender=target_user) & Q(recipient=user))
        ).order_by('created_at')

        # Mark all incoming messages from this target user as read
        unread_messages = messages.filter(recipient=user, is_read=False)
        if unread_messages.exists():
            unread_messages.update(is_read=True)

        data = [{
            'id': m.id,
            'sender_id': m.sender.id,
            'sender_name': m.sender.username,
            'recipient_id': m.recipient.id,
            'recipient_name': m.recipient.username,
            'is_self': m.sender.id == user.id,
            'category': m.category,
            'subject': m.subject,
            'message': m.message,
            'is_read': m.is_read,
            'timestamp': m.created_at.strftime('%b %d, %H:%M'),
        } for m in messages]

        counterparty_data = {
            'id': target_user.id,
            'username': target_user.username,
            'email': target_user.email,
            'is_admin': target_user.is_staff or getattr(getattr(target_user, 'profile', None), 'is_admin', False)
        }

        return Response({
            'messages': data,
            'active_counterparty': counterparty_data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        recipient_id = request.data.get('recipient_id')
        message_text = request.data.get('message', '').strip()
        category = request.data.get('category', 'PHISHING_URL')
        subject = request.data.get('subject', 'Security Incident Inquiry')

        if not message_text:
            return Response({'error': 'Message content cannot be blank.'}, status=status.HTTP_400_BAD_REQUEST)

        if not recipient_id:
            # Fallback if no specific admin chosen: route to the primary admin
            admin_target = User.objects.filter(
                Q(is_staff=True) | Q(profile__is_admin=True)
            ).exclude(id=user.id).first()
            if not admin_target:
                return Response({'error': 'No available administrator found to receive the message.'}, status=status.HTTP_404_NOT_FOUND)
            recipient = admin_target
        else:
            recipient = get_object_or_404(User, id=recipient_id)

        msg = SupportTicketMessage.objects.create(
            sender=user,
            recipient=recipient,
            category=category,
            subject=subject,
            message=message_text,
            is_read=False
        )

        ActivityAudit.objects.create(
            user=user,
            title="Support Helpdesk Dispatch",
            description=f"Sent message to {recipient.username} regarding {category}",
            activity_type="support"
        )

        return Response({
            'id': msg.id,
            'sender_id': msg.sender.id,
            'sender_name': msg.sender.username,
            'recipient_id': msg.recipient.id,
            'recipient_name': msg.recipient.username,
            'is_self': True,
            'category': msg.category,
            'subject': msg.subject,
            'message': msg.message,
            'is_read': False,
            'timestamp': msg.created_at.strftime('%b %d, %H:%M'),
        }, status=status.HTTP_201_CREATED)
    
# Alias for backwards compatibility with legacy imports
ChatMessageListCreateView = ChatThreadView