
import os
import sys
import joblib
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from feature_extraction import extract_features, get_feature_names

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "models",
    "phishing_url_model.pkl",
)

URLS_TO_TEST = [
    "https://www.google.com",
    "https://www.microsoft.com",
    "https://github.com",
    "https://www.apple.com",
    "https://www.wikipedia.org",
    "https://www.python.org",
    "https://www.mozilla.org",
    "http://paypal-login-verify-account.example.com",
    "http://192.0.2.1/login/verify",
]

THRESHOLDS = [0.45, 0.50, 0.55, 0.60, 0.65, 0.70]


def main():
    print("=" * 100)
    print("PHISHSHIELD URL THRESHOLD COMPARISON")
    print("=" * 100)

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    model = joblib.load(MODEL_PATH)
    feature_names = get_feature_names()

    if 1 not in list(model.classes_):
        raise ValueError(
            "The saved model does not contain phishing class 1."
        )

    phishing_index = list(model.classes_).index(1)

    rows = []

    for url in URLS_TO_TEST:
        features = extract_features(url)

        if len(features) != len(feature_names):
            raise ValueError(
                f"Feature mismatch for URL: {url}"
            )

        feature_df = pd.DataFrame(
            [features],
            columns=feature_names,
        )

        probabilities = model.predict_proba(feature_df)[0]
        score = float(probabilities[phishing_index])

        row = {
            "URL": url,
            "Phishing score (%)": round(score * 100, 1),
        }

        for threshold in THRESHOLDS:
            row[f"Verdict @ {threshold:.2f}"] = (
                "Phishing" if score >= threshold else "Legitimate"
            )

        rows.append(row)

    results = pd.DataFrame(rows)

    with pd.option_context(
        "display.max_colwidth", 55,
        "display.width", 220,
        "display.max_columns", None,
    ):
        print(results.to_string(index=False))

    print("\n" + "=" * 100)
    print("TEST COMPLETE — THE MODEL WAS NOT MODIFIED")
    print("Example URLs are test inputs, not verified threat intelligence.")
    print("=" * 100)


if __name__ == "__main__":
    main()