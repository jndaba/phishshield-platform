import sys
import os

# Add the ml_model directory to Python's path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)


# Import prediction function
from predict import analyze_url_heuristics


test_urls = [

    # Legitimate examples
    "https://www.google.com",
    "https://www.microsoft.com",
    "https://www.wikipedia.org",

    # Suspicious examples
    "http://192.168.1.100/login",
    "http://secure-login-verify-account.com/update",
    "http://paypal-login-verify-account.com/login",
]


for url in test_urls:

    print("\n" + "=" * 70)

    print("URL:")
    print(url)

    try:

        result = analyze_url_heuristics(url)

        print("\nPrediction:")
        print(result["prediction"])

        print("\nPhishing Probability:")
        print(
            f'{result["phishing_probability"]}%'
        )

        print("\nHTTPS:")
        print(result["is_https"])

        print("\nDetected Clues:")

        if result["detected_clues"]:

            for clue in result["detected_clues"]:
                print(f"- {clue}")

        else:

            print("None")

        print("\nFeatures:")
        print(result["features_vector"])

    except Exception as error:

        print("\nERROR:")
        print(error)