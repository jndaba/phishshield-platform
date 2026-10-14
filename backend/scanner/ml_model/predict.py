import os
import re
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


# =========================================================
# PATHS
# =========================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "models",
    "phishing_url_model.pkl"
)


# =========================================================
# LOAD RANDOM FOREST MODEL
# =========================================================

try:
    classifier_model = joblib.load(
        MODEL_PATH
    )

    print(
        "PhishShield ML model loaded successfully "
        f"from: {MODEL_PATH}"
    )

except Exception as error:

    classifier_model = None

    print(
        "ERROR: Could not load PhishShield ML model: "
        f"{error}"
    )


# =========================================================
# FEATURE NAMES
# =========================================================

FEATURE_NAMES = get_feature_names()


# =========================================================
# PHISHING DECISION THRESHOLD
# =========================================================
#
# The threshold was evaluated using the validation dataset.
#
# 0.45 produced the highest F1-score among the tested
# thresholds:
#
# Accuracy  = 93.98%
# Precision = 88.00%
# Recall    = 84.87%
# F1-score  = 86.41%
#
# =========================================================

PHISHING_THRESHOLD = 0.45


# =========================================================
# IP ADDRESS DETECTION
# =========================================================

def is_ip_address(hostname):

    if not hostname:
        return False

    ip_pattern = (
        r"^(?:[0-9]{1,3}\.){3}"
        r"[0-9]{1,3}$"
    )

    return bool(
        re.match(
            ip_pattern,
            hostname
        )
    )


# =========================================================
# MAIN URL ANALYSIS FUNCTION
# =========================================================

def analyze_url_heuristics(url):

    # -----------------------------------------------------
    # CHECK MODEL
    # -----------------------------------------------------

    if classifier_model is None:

        raise RuntimeError(
            "PhishShield ML model is not available. "
            "Please train the model first."
        )


    # -----------------------------------------------------
    # CLEAN URL
    # -----------------------------------------------------

    url_cleaned = str(url).strip()

    if not url_cleaned:

        raise ValueError(
            "URL cannot be empty."
        )


    # -----------------------------------------------------
    # PARSE URL
    # -----------------------------------------------------

    try:

        parsed = urlparse(
            url_cleaned
            if "://" in url_cleaned
            else f"http://{url_cleaned}"
        )

        hostname = parsed.hostname or ""

    except ValueError:

        hostname = ""

        parsed = urlparse(
            "http://invalid-url"
        )


    # -----------------------------------------------------
    # BASIC URL INFORMATION
    # -----------------------------------------------------

    domain = hostname

    is_https = (
        parsed.scheme.lower() == "https"
    )


    # -----------------------------------------------------
    # DETECTED SECURITY CLUES
    # -----------------------------------------------------

    detected_clues = []


    # -----------------------------------------------------
    # CHECK FOR IP ADDRESS
    # -----------------------------------------------------

    hostname_is_ip = is_ip_address(
        hostname
    )

    if hostname_is_ip:

        detected_clues.append(
            "URL uses a raw IPv4 address "
            "instead of a domain name"
        )


    # -----------------------------------------------------
    # CHECK HTTPS
    # -----------------------------------------------------

    if not is_https:

        detected_clues.append(
            "Connection does not use HTTPS/TLS"
        )


    # -----------------------------------------------------
    # CHECK HYPHENS
    # -----------------------------------------------------

    hyphen_count = url_cleaned.count("-")

    if hyphen_count >= 3:

        detected_clues.append(
            "URL contains an unusually high "
            "number of hyphens"
        )


    # -----------------------------------------------------
    # SUSPICIOUS KEYWORDS
    # -----------------------------------------------------

    suspicious_words = [

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


    url_lower = url_cleaned.lower()


    matched_words = [

        word

        for word in suspicious_words

        if word in url_lower

    ]


    if len(matched_words) >= 2:

        detected_clues.append(
            "URL contains multiple "
            "security-related or account-related keywords"
        )


    # -----------------------------------------------------
    # CHECK @ SYMBOL
    # -----------------------------------------------------

    if "@" in url_cleaned:

        detected_clues.append(
            "URL contains an @ symbol"
        )


    # -----------------------------------------------------
    # CHECK SUBDOMAINS
    # -----------------------------------------------------

    if not hostname_is_ip:

        hostname_parts = [

            part

            for part in hostname.split(".")

            if part

        ]

        if len(hostname_parts) >= 4:

            detected_clues.append(
                "URL contains multiple "
                "subdomain levels"
            )


    # =====================================================
    # EXTRACT MACHINE LEARNING FEATURES
    # =====================================================

    features = extract_features(
        url_cleaned
    )


    # -----------------------------------------------------
    # CHECK FEATURE COUNT
    # -----------------------------------------------------

    if len(features) != len(FEATURE_NAMES):

        raise RuntimeError(

            "Feature count mismatch. "

            f"Model expects the feature pipeline "
            f"to produce {len(FEATURE_NAMES)} features, "

            f"but {len(features)} were produced."

        )


    # -----------------------------------------------------
    # CREATE DATAFRAME
    # -----------------------------------------------------

    feature_dataframe = pd.DataFrame(

        [features],

        columns=FEATURE_NAMES

    )


    # =====================================================
    # RANDOM FOREST PREDICTION
    # =====================================================

    probabilities = classifier_model.predict_proba(
        feature_dataframe
    )[0]


    # -----------------------------------------------------
    # FIND PHISHING CLASS
    # -----------------------------------------------------

    phishing_probability = 0.0


    if hasattr(
        classifier_model,
        "classes_"
    ):

        classes = classifier_model.classes_

        if 1 in classes:

            phishing_index = list(
                classes
            ).index(1)

            phishing_probability = float(
                probabilities[
                    phishing_index
                ]
            )

    else:

        if len(probabilities) > 1:

            phishing_probability = float(
                probabilities[1]
            )


    # =====================================================
    # APPLY CLASSIFICATION THRESHOLD
    # =====================================================

    if (
        phishing_probability
        >= PHISHING_THRESHOLD
    ):

        prediction_value = 1

    else:

        prediction_value = 0


    # -----------------------------------------------------
    # CONVERT PROBABILITY TO PERCENTAGE
    # -----------------------------------------------------

    phishing_probability_percentage = round(

        phishing_probability * 100,

        1

    )


    # =====================================================
    # FINAL PREDICTION LABEL
    # =====================================================

    if prediction_value == 1:

        prediction = (
            "Malicious / Phishing"
        )

    else:

        prediction = (
            "Legitimate / Safe"
        )


    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {

        "url": url_cleaned,

        "domain": domain,

        "prediction": prediction,

        "phishing_probability":
            phishing_probability_percentage,

        "is_https": is_https,

        "detected_clues":
            detected_clues,

        "features_vector": {

            "length": features[0],

            "dots": features[4],

            "hyphens": features[5],

            "entropy": round(
                features[19],
                3
            ),

        },

    }