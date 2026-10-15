import os
import re
import ipaddress
import joblib
import pandas as pd
from urllib.parse import urlparse

try:
    from .feature_extraction import (
        extract_features,
        get_feature_names,
    )
except ImportError:
    from feature_extraction import (
        extract_features,
        get_feature_names,
    )


# ============================================================
# MODEL CONFIGURATION
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "models",
    "phishing_url_model.pkl",
)

DEFAULT_PHISHING_THRESHOLD = 0.50


# ============================================================
# TRUSTED HOMEPAGE SAFEGUARD
# ============================================================

TRUSTED_HOMEPAGE_DOMAINS = {
    "google.com",
    "www.google.com",
    "microsoft.com",
    "www.microsoft.com",
    "github.com",
    "wikipedia.org",
    "www.wikipedia.org",
    "apple.com",
    "www.apple.com",
    "python.org",
    "www.python.org",
}


# ============================================================
# FEATURE CONFIGURATION
# ============================================================

FEATURE_NAMES = get_feature_names()


# ============================================================
# LAZY MODEL LOADER (Avoids running on migrate / manage.py commands)
# ============================================================

_CLASSIFIER_MODEL = None
_MODEL_METADATA = {}
_PHISHING_THRESHOLD = DEFAULT_PHISHING_THRESHOLD


def get_model_and_metadata():
    """Lazily loads and caches the model on the first scan request."""
    global _CLASSIFIER_MODEL, _MODEL_METADATA, _PHISHING_THRESHOLD

    if _CLASSIFIER_MODEL is not None:
        return _CLASSIFIER_MODEL, _PHISHING_THRESHOLD

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"PhishShield model not found at: {MODEL_PATH}")

    loaded_object = joblib.load(MODEL_PATH)

    # Support dictionary format: {"model": classifier, "metadata": {...}}
    if isinstance(loaded_object, dict) and "model" in loaded_object:
        _CLASSIFIER_MODEL = loaded_object["model"]
        _MODEL_METADATA = loaded_object.get("metadata", {}) or {}
    else:
        _CLASSIFIER_MODEL = loaded_object
        _MODEL_METADATA = {}

    _PHISHING_THRESHOLD = float(
        _MODEL_METADATA.get("threshold", DEFAULT_PHISHING_THRESHOLD)
    )

    if not 0.0 <= _PHISHING_THRESHOLD <= 1.0:
        raise ValueError("Model threshold must be between 0 and 1.")

    saved_feature_names = _MODEL_METADATA.get("feature_names")
    if saved_feature_names is not None:
        if list(saved_feature_names) != FEATURE_NAMES:
            raise RuntimeError(
                "Feature names in the saved model metadata do not "
                "match feature_extraction.py. Retrain the model "
                "using the current feature extractor."
            )

    return _CLASSIFIER_MODEL, _PHISHING_THRESHOLD


# ============================================================
# SUSPICIOUS KEYWORDS
# ============================================================

SUSPICIOUS_WORDS = [
    "login",
    "signin",
    "verify",
    "verification",
    "secure",
    "security",
    "account",
    "update",
    "confirm",
    "confirmation",
    "password",
    "credential",
    "banking",
    "bank",
    "paypal",
    "payment",
    "wallet",
    "billing",
    "invoice",
    "recover",
    "recovery",
    "unlock",
    "suspended",
    "alert",
    "bonus",
    "free",
    "claim",
]


# ============================================================
# URL NORMALIZATION
# ============================================================

def normalize_url_for_features(value):
    """
    Match the URL representation used during training.
    The scheme is removed because the feature extractor
    was trained using normalized URLs without http:// or https://.
    """
    normalized = str(value).strip()

    normalized = re.sub(
        r"^[a-zA-Z][a-zA-Z0-9+.-]*://",
        "",
        normalized,
        count=1,
    )

    if normalized.startswith("//"):
        normalized = normalized[2:]

    return normalized


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_hostname(url):
    """Parse a URL safely, including URLs without a scheme."""
    candidate = url if "://" in url else f"http://{url}"

    try:
        return urlparse(candidate).hostname or ""
    except ValueError:
        return ""


def is_ip_address(hostname):
    """Return True if the hostname is an IPv4 or IPv6 address."""
    if not hostname:
        return False

    try:
        ipaddress.ip_address(hostname.strip("[]"))
        return True
    except ValueError:
        return False


# ============================================================
# MAIN URL ANALYSIS FUNCTION
# ============================================================

def analyze_url_heuristics(url):
    """
    Analyze a URL using the trained model and supplementary heuristics.
    """
    classifier_model, phishing_threshold = get_model_and_metadata()

    url_cleaned = str(url).strip()

    if not url_cleaned:
        raise ValueError("URL cannot be empty.")

    parsed_input = (
        url_cleaned
        if "://" in url_cleaned
        else f"http://{url_cleaned}"
    )

    try:
        parsed = urlparse(parsed_input)
        hostname = parsed.hostname or ""
        username = parsed.username
        password = parsed.password
    except ValueError:
        raise ValueError("The supplied URL is malformed.")

    if not hostname:
        raise ValueError("The supplied URL has no valid hostname.")

    is_https = parsed.scheme.lower() == "https"
    detected_clues = []

    # --------------------------------------------------------
    # CHECK 1: IP ADDRESS
    # --------------------------------------------------------
    hostname_is_ip = is_ip_address(hostname)
    if hostname_is_ip:
        detected_clues.append("URL uses an IP address instead of a domain name")

    # --------------------------------------------------------
    # CHECK 2: HTTPS
    # --------------------------------------------------------
    if not is_https:
        detected_clues.append("Connection does not use HTTPS/TLS")

    # --------------------------------------------------------
    # CHECK 3: UNUSUALLY MANY HYPHENS
    # --------------------------------------------------------
    if url_cleaned.count("-") >= 3:
        detected_clues.append("URL contains an unusually high number of hyphens")

    # --------------------------------------------------------
    # CHECK 4: SUSPICIOUS KEYWORDS
    # --------------------------------------------------------
    url_lower = url_cleaned.lower()
    matched_words = [word for word in SUSPICIOUS_WORDS if word in url_lower]
    if len(matched_words) >= 2:
        detected_clues.append(
            "URL contains multiple security-related or account-related keywords"
        )

    # --------------------------------------------------------
    # CHECK 5: @ SYMBOL
    # --------------------------------------------------------
    if "@" in url_cleaned:
        detected_clues.append("URL contains an @ symbol")

    # --------------------------------------------------------
    # CHECK 6: MULTIPLE SUBDOMAIN LEVELS
    # --------------------------------------------------------
    if not hostname_is_ip:
        hostname_parts = [part for part in hostname.split(".") if part]
        if len(hostname_parts) >= 4:
            detected_clues.append("URL contains multiple subdomain levels")

    # --------------------------------------------------------
    # CHECK 7: FEATURE EXTRACTION
    # --------------------------------------------------------
    feature_url = normalize_url_for_features(url_cleaned)
    features = extract_features(feature_url)

    if len(features) != len(FEATURE_NAMES):
        raise RuntimeError(
            f"Feature mismatch: expected {len(FEATURE_NAMES)}, received {len(features)}."
        )

    feature_dataframe = pd.DataFrame([features], columns=FEATURE_NAMES)

    # --------------------------------------------------------
    # CHECK 8: MODEL PREDICTION
    # --------------------------------------------------------
    probabilities = classifier_model.predict_proba(feature_dataframe)[0]
    classes = list(classifier_model.classes_)

    if 1 not in classes:
        raise RuntimeError("The loaded model does not contain phishing class 1.")

    phishing_index = classes.index(1)
    phishing_probability = float(probabilities[phishing_index])
    model_phishing_probability = round(phishing_probability * 100, 1)

    # --------------------------------------------------------
    # CHECK 9: TRUSTED HOMEPAGE SAFEGUARD
    # --------------------------------------------------------
    normalized_hostname = hostname.lower().rstrip(".")
    is_trusted_homepage = (
        normalized_hostname in TRUSTED_HOMEPAGE_DOMAINS
        and parsed.path in ("", "/")
        and not parsed.query
        and not parsed.fragment
        and username is None
        and password is None
    )

    if is_trusted_homepage:
        prediction = "Legitimate / Safe"
        phishing_probability_for_display = 0.0
        detected_clues.append(
            "Exact known homepage matched the trusted-domain safeguard; the ML prediction was overridden"
        )
    else:
        prediction = (
            "Malicious / Phishing"
            if phishing_probability >= phishing_threshold
            else "Legitimate / Safe"
        )
        phishing_probability_for_display = model_phishing_probability

    # --------------------------------------------------------
    # CHECK 10: RETURN RESULTS
    # --------------------------------------------------------
    return {
        "url": url_cleaned,
        "domain": hostname,
        "prediction": prediction,
        "phishing_probability": phishing_probability_for_display,
        "model_phishing_probability": model_phishing_probability,
        "is_https": is_https,
        "detected_clues": detected_clues,
        "features_vector": {
            "length": features[0],
            "dots": features[4] if len(features) > 4 else 0,
            "hyphens": features[5] if len(features) > 5 else 0,
            "entropy": round(features[19], 3) if len(features) > 19 else 0.0,
        },
    }