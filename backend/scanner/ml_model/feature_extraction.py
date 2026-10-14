import math
import re
from urllib.parse import urlparse


# ============================================================
# SUSPICIOUS WORDS
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
# ENTROPY
# ============================================================

def calculate_entropy(text):

    if not text:
        return 0.0

    entropy = 0.0

    for character in set(text):

        probability = text.count(character) / len(text)

        if probability > 0:

            entropy -= (
                probability * math.log2(probability)
            )

    return entropy


# ============================================================
# SAFE URL PARSER
# Handles malformed URLs in the dataset
# ============================================================

def safe_urlparse(url):

    try:

        return urlparse(
            url if "://" in url else f"http://{url}"
        )

    except ValueError:

        try:

            cleaned_url = (
                url
                .replace("[", "")
                .replace("]", "")
            )

            return urlparse(
                f"http://{cleaned_url}"
            )

        except ValueError:

            return urlparse(
                "http://invalid-url"
            )


# ============================================================
# IP ADDRESS DETECTION
# ============================================================

def is_ip_address(hostname):

    if not hostname:

        return 0

    ip_pattern = (
        r"^(?:[0-9]{1,3}\.){3}"
        r"[0-9]{1,3}$"
    )

    return (
        1
        if re.match(ip_pattern, hostname)
        else 0
    )


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(url):

    url = str(url).strip()

    parsed = safe_urlparse(url)

    # --------------------------------------------------------
    # Basic components
    # --------------------------------------------------------

    try:

        hostname = parsed.hostname or ""

    except ValueError:

        hostname = ""

    path = parsed.path or ""

    query = parsed.query or ""

    scheme = parsed.scheme.lower()

    url_lower = url.lower()

    hostname_lower = hostname.lower()


    # --------------------------------------------------------
    # Domain information
    # --------------------------------------------------------

    hostname_parts = hostname.split(".")

    if len(hostname_parts) > 2:

        subdomain_count = len(
            hostname_parts
        ) - 2

    else:

        subdomain_count = 0


    # --------------------------------------------------------
    # TLD
    # --------------------------------------------------------

    if "." in hostname:

        tld = hostname.rsplit(
            ".",
            1
        )[1]

    else:

        tld = ""


    # --------------------------------------------------------
    # Character counts
    # --------------------------------------------------------

    digit_count = sum(
        character.isdigit()
        for character in url
    )

    letter_count = sum(
        character.isalpha()
        for character in url
    )

    hostname_digit_count = sum(
        character.isdigit()
        for character in hostname
    )

    hostname_letter_count = sum(
        character.isalpha()
        for character in hostname
    )

    hostname_hyphen_count = hostname.count(
        "-"
    )

    path_digit_count = sum(
        character.isdigit()
        for character in path
    )


    # --------------------------------------------------------
    # Suspicious words
    # --------------------------------------------------------

    suspicious_word_count = sum(
        1
        for word in SUSPICIOUS_WORDS
        if word in url_lower
    )


    # --------------------------------------------------------
    # Special characters
    # --------------------------------------------------------

    special_character_count = sum(
        1
        for character in url
        if not character.isalnum()
    )


    if len(url) > 0:

        special_character_ratio = (
            special_character_count
            / len(url)
        )

    else:

        special_character_ratio = 0.0


    # --------------------------------------------------------
    # Hostname entropy
    # --------------------------------------------------------

    hostname_entropy = calculate_entropy(
        hostname
    )


    # --------------------------------------------------------
    # Path entropy
    # --------------------------------------------------------

    path_entropy = calculate_entropy(
        path
    )


    # --------------------------------------------------------
    # Suspicious hostname structure
    # --------------------------------------------------------

    hostname_starts_with_hyphen = (
        1
        if hostname.startswith("-")
        else 0
    )

    hostname_ends_with_hyphen = (
        1
        if hostname.endswith("-")
        else 0
    )


    # --------------------------------------------------------
    # Query information
    # --------------------------------------------------------

    query_parameter_count = (
        query.count("&") + 1
        if query
        else 0
    )


    # ========================================================
    # FINAL FEATURE VECTOR
    # ========================================================

    features = [

        # 1
        len(url),

        # 2
        len(hostname),

        # 3
        len(path),

        # 4
        len(query),

        # 5
        url.count("."),

        # 6
        url.count("-"),

        # 7
        url.count("_"),

        # 8
        url.count("/"),

        # 9
        url.count("?"),

        # 10
        url.count("="),

        # 11
        url.count("@"),

        # 12
        url.count("&"),

        # 13
        url.count("%"),

        # 14
        digit_count,

        # 15
        letter_count,

        # 16
        1 if scheme == "https" else 0,

        # 17
        is_ip_address(hostname),

        # 18
        subdomain_count,

        # 19
        suspicious_word_count,

        # 20
        calculate_entropy(url),

        # ----------------------------------------------------
        # NEW FEATURES
        # ----------------------------------------------------

        # 21
        len(hostname),

        # 22
        len(tld),

        # 23
        hostname_digit_count,

        # 24
        hostname_letter_count,

        # 25
        hostname_hyphen_count,

        # 26
        path_digit_count,

        # 27
        special_character_count,

        # 28
        special_character_ratio,

        # 29
        hostname_entropy,

        # 30
        path_entropy,

        # 31
        hostname_starts_with_hyphen,

        # 32
        hostname_ends_with_hyphen,

        # 33
        query_parameter_count,

        # 34
        len(hostname_parts),

    ]

    return features


# ============================================================
# FEATURE NAMES
# MUST MATCH extract_features()
# ============================================================

def get_feature_names():

    return [

        "url_length",

        "hostname_length",

        "path_length",

        "query_length",

        "dot_count",

        "hyphen_count",

        "underscore_count",

        "slash_count",

        "question_count",

        "equal_count",

        "at_count",

        "ampersand_count",

        "percent_count",

        "digit_count",

        "letter_count",

        "https",

        "has_ip",

        "subdomain_count",

        "suspicious_word_count",

        "entropy",

        # ----------------------------------------------------
        # NEW FEATURES
        # ----------------------------------------------------

        "domain_length",

        "tld_length",

        "hostname_digit_count",

        "hostname_letter_count",

        "hostname_hyphen_count",

        "path_digit_count",

        "special_character_count",

        "special_character_ratio",

        "hostname_entropy",

        "path_entropy",

        "hostname_starts_with_hyphen",

        "hostname_ends_with_hyphen",

        "query_parameter_count",

        "hostname_part_count",

    ]