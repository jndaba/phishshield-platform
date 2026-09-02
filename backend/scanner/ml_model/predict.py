import os
import re
import math
import joblib
from urllib.parse import urlparse

# Resolve path to the serialized Random Forest model
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, 'url_classifier.pkl')

# Attempt to load model once at startup
try:
    classifier_model = joblib.load(MODEL_PATH)
except Exception:
    classifier_model = None


def calculate_entropy(text: str) -> float:
    """Calculates Shannon Entropy of a string to detect randomized/obfuscated tokens."""
    if not text:
        return 0.0
    entropy = 0.0
    for x in set(text):
        p_x = float(text.count(x)) / len(text)
        if p_x > 0:
            entropy += - p_x * math.log(p_x, 2)
    return round(entropy, 3)


def extract_features(url: str) -> list:
    """
    Extracts numerical feature vector for the ML model:
    [url_length, count_dots, count_hyphens, count_at, count_question, 
     count_equal, count_digits, has_ip, is_https, entropy]
    """
    parsed = urlparse(url if "://" in url else f"http://{url}")
    domain = parsed.netloc or parsed.path.split('/')[0]

    # Feature 1: Total length of URL
    url_len = len(url)
    # Feature 2: Dot count
    dots = url.count('.')
    # Feature 3: Hyphen count
    hyphens = url.count('-')
    # Feature 4: '@' symbol count
    at_symbol = 1 if '@' in url else 0
    # Feature 5: '?' parameter identifier
    questions = url.count('?')
    # Feature 6: '=' assignments
    equals = url.count('=')
    # Feature 7: Digits count in URL
    digits = sum(c.isdigit() for c in url)
    # Feature 8: IP Address as host
    ip_regex = r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$'
    has_ip = 1 if re.match(ip_regex, domain) else 0
    # Feature 9: Uses HTTPS protocol
    is_https = 1 if parsed.scheme.lower() == 'https' else 0
    # Feature 10: Shannon entropy of URL string
    entropy = calculate_entropy(url)

    return [url_len, dots, hyphens, at_symbol, questions, equals, digits, has_ip, is_https, entropy]


def analyze_url_heuristics(url: str) -> dict:
    """
    Executes feature extraction, machine learning classification, 
    and heuristic red-flag detection on the provided URL.
    """
    url_cleaned = url.strip()
    parsed = urlparse(url_cleaned if "://" in url_cleaned else f"http://{url_cleaned}")
    domain = parsed.netloc or parsed.path.split('/')[0]
    
    features = extract_features(url_cleaned)
    detected_clues = []
    
    # 1. Heuristic Rule Checks
    if "@" in url_cleaned:
        detected_clues.append("Contains '@' symbol: Often used to obscure true destination domain.")
    
    if re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', domain):
        detected_clues.append("Raw IPv4 Address used instead of an authenticated domain name.")
        
    if url_cleaned.count('-') >= 3:
        detected_clues.append("Excessive hyphens: High frequency in typosquatting and impersonation attacks.")
        
    if "xn--" in domain.lower():
        detected_clues.append("Punycode / IDN Homograph notation detected in domain host.")
        
    suspicious_keywords = ["verify", "secure", "login", "update", "banking", "mpesa", "portal", "confirm", "account"]
    found_keywords = [kw for kw in suspicious_keywords if kw in url_cleaned.lower()]
    if len(found_keywords) >= 2:
        detected_clues.append(f"Suspicious security keywords stacked in path: {', '.join(found_keywords)}")

    is_https = parsed.scheme.lower() == 'https'
    if not is_https:
        detected_clues.append("Missing TLS encryption (HTTP protocol).")

    # 2. Random Forest ML Model Inference
    phishing_probability = 0.0
    if classifier_model is not None:
        try:
            # Predict probabilities [[prob_safe, prob_phishing]]
            probabilities = classifier_model.predict_proba([features])[0]
            phishing_probability = round(float(probabilities[1]) * 100, 1)
        except Exception:
            # Fallback to heuristic weight if model predict fails
            phishing_probability = min(100.0, len(detected_clues) * 22.5)
    else:
        # Heuristic calculation if .pkl is not yet trained/loaded
        phishing_probability = min(100.0, len(detected_clues) * 22.5)

    prediction = "Malicious / Phishing" if phishing_probability >= 50.0 else "Legitimate / Safe"

    return {
        "url": url_cleaned,
        "domain": domain,
        "prediction": prediction,
        "phishing_probability": phishing_probability,
        "is_https": is_https,
        "detected_clues": detected_clues,
        "features_vector": {
            "length": features[0],
            "dots": features[1],
            "hyphens": features[2],
            "entropy": features[9]
        }
    }