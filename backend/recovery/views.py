from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import RecoveryGuide
from .serializers import RecoveryGuideSerializer

DEFAULT_RECOVERY_GUIDES = [
    {
        "title": "Compromised M-Pesa / Mobile Banking",
        "category": "financial",
        "severity": "CRITICAL",
        "steps": "1. Immediately dial *234*1*6# or contact official Safaricom support to freeze mobile money accounts.\n2. Revoke active SIM card sessions.\n3. Report to the nearest banking branch to audit ongoing transactions.\n4. File an incident record with internal security.",
        "icon_name": "AlertTriangle"
    },
    {
        "title": "Compromised Microsoft 365 / Corporate Portal",
        "category": "identity",
        "severity": "HIGH",
        "steps": "1. From a secondary clean device, sign into https://myaccount.microsoft.com and terminate all active cloud sign-ins.\n2. Change your institutional master password immediately.\n3. Audit registered multi-factor authentication (MFA) devices for unfamiliar authenticators.\n4. Notify your ICT Helpdesk.",
        "icon_name": "ShieldAlert"
    },
    {
        "title": "Malicious Attachment Execution / Ransomware",
        "category": "malware",
        "severity": "CRITICAL",
        "steps": "1. Disconnect Ethernet cables and disable Wi-Fi immediately to stop lateral network spread.\n2. Do NOT power off or reboot the workstation to preserve RAM forensics.\n3. Inform ICT Security Operations with your IP address and computer hostname.",
        "icon_name": "FileWarning"
    }
]

class RecoveryGuideListCreateView(generics.ListCreateAPIView):
    serializer_class = RecoveryGuideSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Auto-seed if table is empty
        if not RecoveryGuide.objects.exists():
            for guide in DEFAULT_RECOVERY_GUIDES:
                RecoveryGuide.objects.create(**guide)
        return RecoveryGuide.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RecoveryGuideDetailView(generics.RetrieveDestroyAPIView):
    queryset = RecoveryGuide.objects.all()
    serializer_class = RecoveryGuideSerializer
    permission_classes = [permissions.AllowAny]