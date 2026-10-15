import math
import re
import ipaddress

from urllib.parse import urlparse


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

def normalize_url_for_features(url):
    """
    Normalize a URL before extracting features.

    - Removes surrounding whitespace.
    - Removes a leading HTTP/HTTPS or other URL scheme.
    - Removes a leading //.
    - Removes www. only when it is the actual hostname prefix.

    The URL path and query are preserved.
    """

    if url is None:
        return ""

    url = str(url).strip()

    # Remove the scheme.
    url = re.sub(
        r"^[a-zA-Z][a-zA-Z0-9+.-]*://",
        "",
        url,
        count=1,
    )

    # Remove protocol-relative prefix.
    if url.startswith("//"):
        url = url[2:]

    # Parse the authority so www. is removed only from
    # the hostname, not from a path or username.
    try:
        parsed = urlparse("//" + url)
        hostname = parsed.hostname

        if hostname and hostname.lower().startswith("www."):
            prefix = parsed.netloc

            # Preserve user information if present.
            if "@" in prefix:
                userinfo, hostpart = prefix.rsplit("@", 1)
                if hostpart.lower().startswith("www."):
                    hostpart = hostpart[4:]
                prefix = userinfo + "@" + hostpart
            elif prefix.lower().startswith("www."):
                prefix = prefix[4:]

            url = prefix + url[len(parsed.netloc):]

    except (ValueError, TypeError):
        # Leave malformed input unchanged; the extractor
        # will handle an empty or invalid hostname safely.
        pass

    return url


# ============================================================
# ENTROPY CALCULATION
# ============================================================

def calculate_entropy(value):
    """
    Calculate Shannon entropy for a string.

    Higher entropy can indicate a more random-looking URL,
    but entropy alone cannot establish that a URL is malicious.
    """

    if not value:
        return 0.0

    probabilities = [
        value.count(character) / len(value)
        for character in set(value)
    ]

    return -sum(
        probability * math.log2(probability)
        for probability in probabilities
        if probability > 0
    )


# ============================================================
# SAFE URL PARSING
# ============================================================

def safe_urlparse(url):
    """
    Parse URLs whether or not the scheme is present.
    Returns a ParseResult, using an empty result if parsing fails.
    """

    if not url:
        return urlparse("")

    try:
        candidate = str(url).strip()

        # Support inputs such as example.com/login.
        if not re.match(
            r"^[a-zA-Z][a-zA-Z0-9+.-]*://",
            candidate,
        ) and not candidate.startswith("//"):
            candidate = "//" + candidate

        return urlparse(candidate)

    except (ValueError, TypeError):
        return urlparse("")


# ============================================================
# IP ADDRESS DETECTION
# ============================================================

def is_ip_address(hostname):
    """
    Return 1 for valid IPv4/IPv6 addresses, otherwise 0.
    """

    if not hostname:
        return 0

    try:
        ipaddress.ip_address(str(hostname).strip("[]"))
        return 1
    except (ValueError, TypeError):
        return 0


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(url):
    """
    Extract exactly 34 numeric features.

    IMPORTANT:
    The order of these features must match get_feature_names()
    and the order used to train the Random Forest model.
    """

    original_url = "" if url is None else str(url).strip()

    # Normalize consistently for training and prediction.
    normalized_url = normalize_url_for_features(original_url)

    url_lower = normalized_url.lower()

    parsed = safe_urlparse(normalized_url)

    hostname = (parsed.hostname or "").lower()
    path = parsed.path or ""
    query = parsed.query or ""
    scheme = parsed.scheme.lower()

    # Remove trailing dot for hostname-based calculations.
    hostname = hostname.rstrip(".")

    hostname_lower = hostname

    hostname_parts = [
        part
        for part in hostname_lower.split(".")
        if part
    ]

    path_lower = path.lower()

    try:
        tld = hostname_parts[-1] if hostname_parts else ""
    except IndexError:
        tld = ""

    # --------------------------------------------------------
    # FEATURE 1-10: GENERAL URL CHARACTERISTICS
    # --------------------------------------------------------

    url_length = len(normalized_url)

    hostname_length = len(hostname)

    path_length = len(path)

    query_length = len(query)

    dot_count = normalized_url.count(".")

    hyphen_count = normalized_url.count("-")

    underscore_count = normalized_url.count("_")

    slash_count = normalized_url.count("/")

    question_count = normalized_url.count("?")

    equal_count = normalized_url.count("=")

    # --------------------------------------------------------
    # FEATURE 11-20: CHARACTERS, PROTOCOL, AND URL ENTROPY
    # --------------------------------------------------------

    at_count = normalized_url.count("@")

    ampersand_count = normalized_url.count("&")

    percent_count = normalized_url.count("%")

    digit_count = sum(
        character.isdigit()
        for character in normalized_url
    )

    letter_count = sum(
        character.isalpha()
        for character in normalized_url
    )

    # A scheme is normally stripped during normalization.
    # Keep this feature for compatibility with the original
    # feature definition and existing model schema.
    https = 1 if scheme == "https" else 0

    has_ip = is_ip_address(hostname)

    # www has been normalized away, so subdomain count is
    # calculated from the remaining hostname labels.
    subdomain_count = max(len(hostname_parts) - 2, 0)

    suspicious_word_count = sum(
        1
        for word in SUSPICIOUS_WORDS
        if word in url_lower
    )

    entropy = calculate_entropy(normalized_url)

    # --------------------------------------------------------
    # FEATURE 21-28: DOMAIN, TLD, AND CHARACTER FEATURES
    # --------------------------------------------------------

    domain_length = len(hostname)

    tld_length = len(tld)

    hostname_digit_count = sum(
        character.isdigit()
        for character in hostname
    )

    hostname_letter_count = sum(
        character.isalpha()
        for character in hostname
    )

    hostname_hyphen_count = hostname.count("-")

    path_digit_count = sum(
        character.isdigit()
        for character in path
    )

    special_character_count = sum(
        not character.isalnum()
        for character in normalized_url
    )

    special_character_ratio = (
        special_character_count / url_length
        if url_length > 0
        else 0.0
    )

    # --------------------------------------------------------
    # FEATURE 29-34: ENTROPY, HOSTNAME STRUCTURE, QUERY
    # --------------------------------------------------------

    hostname_entropy = calculate_entropy(hostname)

    path_entropy = calculate_entropy(path_lower)

    hostname_starts_with_hyphen = (
        1 if hostname.startswith("-") else 0
    )

    hostname_ends_with_hyphen = (
        1 if hostname.endswith("-") else 0
    )

    query_parameter_count = (
        len([
            parameter
            for parameter in query.split("&")
            if parameter
        ])
        if query
        else 0
    )

    hostname_part_count = len(hostname_parts)

    # --------------------------------------------------------
    # RETURN FEATURES IN THE REQUIRED ORDER
    # --------------------------------------------------------

    features = [
        url_length,                     # 1
        hostname_length,                # 2
        path_length,                    # 3
        query_length,                   # 4
        dot_count,                      # 5
        hyphen_count,                   # 6
        underscore_count,               # 7
        slash_count,                    # 8
        question_count,                 # 9
        equal_count,                    # 10
        at_count,                       # 11
        ampersand_count,                # 12
        percent_count,                  # 13
        digit_count,                    # 14
        letter_count,                   # 15
        https,                          # 16
        has_ip,                         # 17
        subdomain_count,                # 18
        suspicious_word_count,          # 19
        entropy,                        # 20
        domain_length,                  # 21
        tld_length,                     # 22
        hostname_digit_count,           # 23
        hostname_letter_count,          # 24
        hostname_hyphen_count,          # 25
        path_digit_count,               # 26
        special_character_count,        # 27
        special_character_ratio,        # 28
        hostname_entropy,               # 29
        path_entropy,                   # 30
        hostname_starts_with_hyphen,    # 31
        hostname_ends_with_hyphen,      # 32
        query_parameter_count,          # 33
        hostname_part_count,            # 34
    ]

    if len(features) != 34:
        raise ValueError(
            f"Expected 34 features, got {len(features)}."
        )

    return features


# ============================================================
# FEATURE NAMES
# ============================================================

def get_feature_names():
    """
    Return the names in exactly the same order as extract_features.
    """

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

