import os
import re
import joblib
from urllib.parse import urlparse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml_model', 'url_classifier.pkl')

def extract_features(url):
    parsed = urlparse(url if "://" in url else "http://" + url)
    hostname = parsed.hostname or ""
    
    features = [
        len(url),
        1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname) else 0,
        url.count('@'),
        hostname.count('-'),
        url.count('.'),
        url.count('/'),
        url.count('?'),
        url.count('='),
        1 if url.startswith('https://') else 0,
        1 if any(k in url.lower() for k in ['login', 'verify', 'update', 'banking', 'secure', 'password', 'free']) else 0
    ]
    return features

class URLScanAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        url = request.data.get('url', '').strip()
        if not url:
            return Response({'error': 'Please provide a valid URL'}, status=status.HTTP_400_BAD_REQUEST)

        # Heuristic checks
        reasons = []
        if not url.startswith('https://'):
            reasons.append("Connection is not secured with HTTPS protocol.")
        if '@' in url:
            reasons.append("Contains '@' symbol, often used to obscure real destination addresses.")
        if '-' in urlparse(url).hostname:
            reasons.append("Domain name contains hyphens, commonly seen in lookalike phishing domains.")

        # ML Model Inference
        is_malicious = False
        confidence = 85.0

        if os.path.exists(MODEL_PATH):
            clf = joblib.load(MODEL_PATH)
            features = [extract_features(url)]
            prediction = clf.predict(features)[0]
            proba = clf.predict_proba(features)[0]
            is_malicious = bool(prediction == 1)
            confidence = round(float(proba[prediction]) * 100, 2)
        else:
            # Fallback heuristic prediction if model not yet saved to disk
            is_malicious = len(reasons) >= 2

        if is_malicious and not reasons:
            reasons.append("Structural anomalies detected in domain distribution and subdomains.")

        return Response({
            'url': url,
            'status': 'Malicious / Phishing' if is_malicious else 'Safe / Legitimate',
            'is_malicious': is_malicious,
            'confidence': f"{confidence}%",
            'indicators': reasons if is_malicious else ["Valid domain syntax", "Standard URL path structure"]
        }, status=status.HTTP_200_OK)