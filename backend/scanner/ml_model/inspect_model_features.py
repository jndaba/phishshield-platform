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

TEST_URLS = [
    "https://www.google.com",
    "http://paypal-login-verify-account.example.com",
]


def main():
    print("=" * 90)
    print("PHISHSHIELD MODEL FEATURE INSPECTION")
    print("=" * 90)

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Saved model not found: {MODEL_PATH}"
        )

    # Load the existing model without modifying it.
    model = joblib.load(MODEL_PATH)
    current_feature_names = get_feature_names()

    print("\n1. MODEL INFORMATION")
    print("-" * 90)
    print(f"Model type: {type(model).__name__}")
    print(f"Model feature count: {model.n_features_in_}")
    print(f"Current feature count: {len(current_feature_names)}")
    print(f"Model classes: {list(model.classes_)}")

    # Check whether the saved model remembers training feature names.
    saved_feature_names = getattr(
        model,
        "feature_names_in_",
        None,
    )

    if saved_feature_names is not None:
        saved_feature_names = list(saved_feature_names)

        if saved_feature_names == current_feature_names:
            print("Feature-name check: MATCH")
        else:
            print("Feature-name check: MISMATCH")
            print("\nNames or positions that differ:")

            max_length = max(
                len(saved_feature_names),
                len(current_feature_names),
            )

            for index in range(max_length):
                saved_name = (
                    saved_feature_names[index]
                    if index < len(saved_feature_names)
                    else "<missing>"
                )

                current_name = (
                    current_feature_names[index]
                    if index < len(current_feature_names)
                    else "<missing>"
                )

                if saved_name != current_name:
                    print(
                        f"Position {index + 1}: "
                        f"model={saved_name!r}, "
                        f"current={current_name!r}"
                    )
    else:
        print(
            "Feature-name check: The saved model does not "
            "store feature names. Position matching must be "
            "verified against the training code."
        )

    if model.n_features_in_ != len(current_feature_names):
        raise ValueError(
            "Feature-count mismatch. Stop here and investigate "
            "before using the current extractor with this model."
        )

    # Show the model's most important features.
    print("\n2. TOP 15 MODEL FEATURES")
    print("-" * 90)

    if not hasattr(model, "feature_importances_"):
        print("This model does not expose feature_importances_.")
    else:
        importances = model.feature_importances_

        importance_df = pd.DataFrame({
            "Feature": current_feature_names,
            "Importance": importances,
        })

        importance_df = importance_df.sort_values(
            "Importance",
            ascending=False,
        )

        print(
            importance_df.head(15).to_string(
                index=False,
                formatters={
                    "Importance": lambda value: f"{value:.6f}"
                },
            )
        )

    # Inspect the extracted features and score for each test URL.
    print("\n3. URL FEATURE VALUES AND PREDICTIONS")
    print("-" * 90)

    if 1 not in list(model.classes_):
        raise ValueError(
            "The saved model does not contain phishing class 1."
        )

    phishing_index = list(model.classes_).index(1)

    for url in TEST_URLS:
        features = extract_features(url)

        feature_df = pd.DataFrame(
            [features],
            columns=current_feature_names,
        )

        probabilities = model.predict_proba(feature_df)[0]
        score = float(probabilities[phishing_index])

        print(f"\nURL: {url}")
        print(f"Phishing score: {score * 100:.2f}%")

        print(
            pd.DataFrame({
                "Feature": current_feature_names,
                "Value": features,
            }).to_string(index=False)
        )

    print("\n" + "=" * 90)
    print("INSPECTION COMPLETE — THE SAVED MODEL WAS NOT MODIFIED")
    print("=" * 90)


if __name__ == "__main__":
    main()

