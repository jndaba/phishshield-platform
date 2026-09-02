import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .ml_model.predict import analyze_url_heuristics
from authentication.models import ActivityAudit

class URLScanAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        start_time = time.perf_counter()
        url = request.data.get('url', '').strip()

        if not url:
            return Response(
                {'error': 'Please provide a valid URL string to scan.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Execute ML & heuristic inference logic
        result = analyze_url_heuristics(url)
        
        # 2. Compute exact execution time
        elapsed_time_sec = round(time.perf_counter() - start_time, 3)
        result['scan_duration_seconds'] = elapsed_time_sec

        # 3. Log user activity audit trail if authenticated
        if request.user and request.user.is_authenticated:
            ActivityAudit.objects.create(
                user=request.user,
                title=f"URL Scan: {url[:30]}...",
                description=f"Predicted {result.get('prediction')} ({result.get('phishing_probability')}%) in {elapsed_time_sec}s",
                activity_type="url_scan",
                risk_score=f"{result.get('phishing_probability')}%"
            )

        return Response(result, status=status.HTTP_200_OK)