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

BASE_URLS = [
    "www.google.com",
    "www.microsoft.com",
    "github.com",
    "www.apple.com",
    "www.wikipedia.org",
    "www.python.org",
    "www.mozilla.org",
]


def main():
    print("=" * 100)
    print("PHISHSHIELD URL SCHEME EFFECT TEST")
    print("=" * 100)

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    model = joblib.load(MODEL_PATH)
    feature_names = get_feature_names()

    if model.n_features_in_ != len(feature_names):
        raise ValueError(
            "Feature count mismatch. Stop and investigate."
        )

    if 1 not in list(model.classes_):
        raise ValueError(
            "The model does not contain phishing class 1."
        )

    phishing_index = list(model.classes_).index(1)
    results = []

    for base_url in BASE_URLS:
        variants = [
            ("No scheme", base_url),
            ("HTTP", "http://" + base_url),
            ("HTTPS", "https://" + base_url),
        ]

        for variant_name, url in variants:
            features = extract_features(url)

            feature_df = pd.DataFrame(
                [features],
                columns=feature_names,
            )

            probabilities = model.predict_proba(feature_df)[0]
            score = float(probabilities[phishing_index])

            results.append({
                "Domain": base_url,
                "Format": variant_name,
                "Phishing score (%)": round(score * 100, 2),
                "URL length": features[0],
                "Slash count": features[7],
                "Special characters": features[26],
                "Entropy": round(features[19], 3),
                "HTTPS feature": features[15],
            })

    results_df = pd.DataFrame(results)

    with pd.option_context(
        "display.max_columns", None,
        "display.width", 220,
        "display.max_colwidth", 25,
    ):
        print(results_df.to_string(index=False))

    print("\n" + "=" * 100)
    print("TEST COMPLETE — MODEL AND DATASET WERE NOT MODIFIED")
    print("=" * 100)


if __name__ == "__main__":
    main()

