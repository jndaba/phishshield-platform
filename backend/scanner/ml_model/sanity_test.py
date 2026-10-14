import os
import sys

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

if CURRENT_DIR not in sys.path:
    sys.path.insert(
        0,
        CURRENT_DIR
    )

from predict import analyze_url_heuristics


# ============================================================
# LEGITIMATE TEST URLS
# ============================================================

legitimate_urls = [

    "https://www.google.com",

    "https://www.microsoft.com",

    "https://www.wikipedia.org",

    "https://www.github.com",

    "https://www.python.org",

    "https://www.djangoproject.com",

    "https://www.mozilla.org",

    "https://www.apple.com",

]


# ============================================================
# SUSPICIOUS TEST URLS
# ============================================================

suspicious_urls = [

    "http://secure-login-verify-account.com/update",

    "http://paypal-login-verify-account.com/login",

    "http://192.168.1.100/login",

    "http://account-verify-security-update.com/login",

    "http://banking-login-confirm-password.com",

]


# ============================================================
# TEST FUNCTION
# ============================================================

def test_group(
    title,
    urls
):

    print("\n" + "=" * 70)

    print(title)

    print("=" * 70)


    for url in urls:

        print("\nURL:")

        print(url)


        try:

            result = (
                analyze_url_heuristics(
                    url
                )
            )


            print(
                "Prediction:",
                result["prediction"]
            )


            print(
                "Phishing Probability:",
                f'{result["phishing_probability"]}%'
            )


            print(
                "HTTPS:",
                result["is_https"]
            )


            if result[
                "detected_clues"
            ]:

                print(
                    "Detected clues:"
                )

                for clue in result[
                    "detected_clues"
                ]:

                    print(
                        f"  - {clue}"
                    )

            else:

                print(
                    "Detected clues: None"
                )


        except Exception as error:

            print(
                "ERROR:",
                error
            )


# ============================================================
# RUN TESTS
# ============================================================

print("\n")

print("=" * 70)

print(
    "PHISHSHIELD MODEL SANITY TEST"
)

print("=" * 70)


test_group(
    "LEGITIMATE URL TESTS",
    legitimate_urls
)


test_group(
    "SUSPICIOUS URL TESTS",
    suspicious_urls
)


print("\n")

print("=" * 70)

print(
    "SANITY TEST COMPLETE"
)

print("=" * 70)