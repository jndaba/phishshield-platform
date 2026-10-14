import os
import sys
import joblib
import pandas as pd

from sklearn.metrics import confusion_matrix

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from feature_extraction import (
    extract_features,
    get_feature_names,
)


# =========================================================
# PATHS
# =========================================================

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv"
)

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "models",
    "phishing_url_model.pkl"
)


# =========================================================
# LOAD DATASET
# =========================================================

print("=" * 70)
print("PHISHSHIELD MODEL DIAGNOSTICS")
print("=" * 70)

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

df = df.drop_duplicates(
    subset=["URL"]
).copy()

df["target"] = (
    df["Label"]
    .astype(str)
    .str.lower()
    .map({
        "good": 0,
        "bad": 1
    })
)

df = df.dropna(
    subset=["target"]
)

df["target"] = df["target"].astype(int)

print(
    f"Dataset size: {len(df):,}"
)

print(
    f"Legitimate URLs: "
    f"{(df['target'] == 0).sum():,}"
)

print(
    f"Phishing URLs: "
    f"{(df['target'] == 1).sum():,}"
)


# =========================================================
# SAMPLE DATA
# =========================================================

# Use a manageable sample for diagnostics.

LEGITIMATE_SAMPLE_SIZE = 5000
PHISHING_SAMPLE_SIZE = 5000

legitimate_df = df[
    df["target"] == 0
].sample(
    n=min(
        LEGITIMATE_SAMPLE_SIZE,
        (df["target"] == 0).sum()
    ),
    random_state=42
)

phishing_df = df[
    df["target"] == 1
].sample(
    n=min(
        PHISHING_SAMPLE_SIZE,
        (df["target"] == 1).sum()
    ),
    random_state=42
)


diagnostic_df = pd.concat(
    [
        legitimate_df,
        phishing_df
    ]
)


# =========================================================
# FEATURE EXTRACTION
# =========================================================

print("\nExtracting diagnostic features...")

feature_rows = []

for index, url in enumerate(
    diagnostic_df["URL"]
):

    feature_rows.append(
        extract_features(url)
    )

    if (index + 1) % 1000 == 0:

        print(
            f"Processed "
            f"{index + 1:,} / "
            f"{len(diagnostic_df):,}"
        )


X = pd.DataFrame(
    feature_rows,
    columns=get_feature_names()
)

y = diagnostic_df["target"].values


print("\nFeature extraction complete.")


# =========================================================
# LOAD MODEL
# =========================================================

print("\nLoading Random Forest model...")

model = joblib.load(
    MODEL_PATH
)

print("Model loaded.")


# =========================================================
# MODEL PROBABILITIES
# =========================================================

print("\nCalculating model probabilities...")

probabilities = model.predict_proba(X)

classes = list(
    model.classes_
)

phishing_index = classes.index(1)

phishing_probabilities = (
    probabilities[:, phishing_index]
)


diagnostic_df = diagnostic_df.copy()

diagnostic_df[
    "phishing_probability"
] = phishing_probabilities


# =========================================================
# CLASSIFICATION AT 45%
# =========================================================

diagnostic_df[
    "prediction"
] = (
    diagnostic_df[
        "phishing_probability"
    ] >= 0.45
).astype(int)


# =========================================================
# CONFUSION MATRIX
# =========================================================

cm = confusion_matrix(
    y,
    diagnostic_df["prediction"]
)

tn, fp, fn, tp = cm.ravel()


print("\n")
print("=" * 70)
print("DIAGNOSTIC CONFUSION MATRIX")
print("=" * 70)

print(
    f"True Negatives:  {tn:,}"
)

print(
    f"False Positives: {fp:,}"
)

print(
    f"False Negatives: {fn:,}"
)

print(
    f"True Positives:  {tp:,}"
)


# =========================================================
# PROBABILITY DISTRIBUTION
# =========================================================

print("\n")
print("=" * 70)
print("PROBABILITY DISTRIBUTION")
print("=" * 70)


legitimate_probabilities = (
    diagnostic_df[
        diagnostic_df["target"] == 0
    ]["phishing_probability"]
)

phishing_probabilities_actual = (
    diagnostic_df[
        diagnostic_df["target"] == 1
    ]["phishing_probability"]
)


print("\nLEGITIMATE URLs")

print(
    "Minimum:",
    round(
        legitimate_probabilities.min(),
        4
    )
)

print(
    "25th percentile:",
    round(
        legitimate_probabilities.quantile(0.25),
        4
    )
)

print(
    "Median:",
    round(
        legitimate_probabilities.median(),
        4
    )
)

print(
    "75th percentile:",
    round(
        legitimate_probabilities.quantile(0.75),
        4
    )
)

print(
    "Maximum:",
    round(
        legitimate_probabilities.max(),
        4
    )
)


print("\nPHISHING URLs")

print(
    "Minimum:",
    round(
        phishing_probabilities_actual.min(),
        4
    )
)

print(
    "25th percentile:",
    round(
        phishing_probabilities_actual.quantile(0.25),
        4
    )
)

print(
    "Median:",
    round(
        phishing_probabilities_actual.median(),
        4
    )
)

print(
    "75th percentile:",
    round(
        phishing_probabilities_actual.quantile(0.75),
        4
    )
)

print(
    "Maximum:",
    round(
        phishing_probabilities_actual.max(),
        4
    )
)


# =========================================================
# MOST CONFIDENT LEGITIMATE URL FALSE POSITIVES
# =========================================================

print("\n")
print("=" * 70)
print("LEGITIMATE URLS WITH HIGHEST PHISHING SCORES")
print("=" * 70)


false_positive_examples = (
    diagnostic_df[
        (diagnostic_df["target"] == 0)
        &
        (diagnostic_df["prediction"] == 1)
    ]
    .sort_values(
        "phishing_probability",
        ascending=False
    )
    .head(20)
)


for index, row in (
    false_positive_examples.iterrows()
):

    print(
        f"\n{row['phishing_probability'] * 100:.1f}%"
    )

    print(
        row["URL"]
    )


# =========================================================
# PHISHING URL LOWEST SCORES
# =========================================================

print("\n")
print("=" * 70)
print("PHISHING URLS WITH LOWEST PHISHING SCORES")
print("=" * 70)


false_negative_examples = (
    diagnostic_df[
        (diagnostic_df["target"] == 1)
        &
        (diagnostic_df["prediction"] == 0)
    ]
    .sort_values(
        "phishing_probability",
        ascending=True
    )
    .head(20)
)


for index, row in (
    false_negative_examples.iterrows()
):

    print(
        f"\n{row['phishing_probability'] * 100:.1f}%"
    )

    print(
        row["URL"]
    )


# =========================================================
# FEATURE MEANS
# =========================================================

print("\n")
print("=" * 70)
print("FEATURE MEAN COMPARISON")
print("=" * 70)


feature_names = get_feature_names()

legitimate_features = X[
    y == 0
]

phishing_features = X[
    y == 1
]


comparison_rows = []


for feature in feature_names:

    legitimate_mean = (
        legitimate_features[
            feature
        ].mean()
    )

    phishing_mean = (
        phishing_features[
            feature
        ].mean()
    )

    comparison_rows.append({

        "feature": feature,

        "legitimate_mean":
            legitimate_mean,

        "phishing_mean":
            phishing_mean,

    })


comparison_df = pd.DataFrame(
    comparison_rows
)


comparison_df[
    "absolute_difference"
] = (
    comparison_df[
        "phishing_mean"
    ]
    -
    comparison_df[
        "legitimate_mean"
    ]
).abs()


comparison_df = comparison_df.sort_values(
    "absolute_difference",
    ascending=False
)


print(
    comparison_df.to_string(
        index=False
    )
)


# =========================================================
# FINISH
# =========================================================

print("\n")
print("=" * 70)
print("MODEL DIAGNOSTICS COMPLETE")
print("=" * 70)