from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage
from django.contrib.auth.models import User

class ChatMessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Admins see messages from a requested user_id query param; normal users see their own thread
        user = request.user
        target_user_id = request.query_params.get('user_id')

        if user.is_staff and target_user_id:
            messages = ChatMessage.objects.filter(
                sender_id=target_user_id
            ) | ChatMessage.objects.filter(receiver_id=target_user_id)
        else:
            messages = ChatMessage.objects.filter(
                sender=user
            ) | ChatMessage.objects.filter(receiver=user)

        data = [{
            'id': m.id,
            'sender': m.sender.username,
            'is_admin': m.sender.is_staff,
            'message': m.message,
            'timestamp': m.timestamp.strftime('%Y-%m-%d %H:%M')
        } for m in messages.order_by('timestamp')]

        return Response(data)

    def post(self, request):
        sender = request.user
        message_text = request.data.get('message', '').strip()
        receiver_id = request.data.get('receiver_id')

        if not message_text:
            return Response({'error': 'Message cannot be empty'}, status=400)

        receiver = None
        if sender.is_staff and receiver_id:
            receiver = User.objects.filter(id=receiver_id).first()

        chat = ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            message=message_text,
            is_admin_reply=sender.is_staff
        )

        return Response({
            'id': chat.id,
            'sender': sender.username,
            'is_admin': sender.is_staff,
            'message': chat.message,
            'timestamp': chat.timestamp.strftime('%Y-%m-%d %H:%M')
        }, status=201)