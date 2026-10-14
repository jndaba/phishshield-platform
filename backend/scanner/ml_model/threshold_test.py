import os
import sys
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

# ---------------------------------------------------------
# IMPORT FEATURE EXTRACTION
# ---------------------------------------------------------

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from feature_extraction import extract_features, get_feature_names


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# LOAD DATASET
# ---------------------------------------------------------

print("=" * 70)
print("PHISHSHIELD THRESHOLD EVALUATION")
print("=" * 70)

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Dataset rows: {len(df):,}")


# ---------------------------------------------------------
# CLEAN DATA
# ---------------------------------------------------------

df = df.drop_duplicates(subset=["URL"]).copy()

print(f"After removing duplicate URLs: {len(df):,}")


# Convert labels:
# good = 0
# bad  = 1

df["target"] = (
    df["Label"]
    .astype(str)
    .str.lower()
    .map({
        "good": 0,
        "bad": 1
    })
)

df = df.dropna(subset=["target"])

df["target"] = df["target"].astype(int)


# ---------------------------------------------------------
# EXTRACT FEATURES
# ---------------------------------------------------------

print("\nExtracting URL features...")

feature_rows = []

total = len(df)

for index, url in enumerate(df["URL"]):

    feature_rows.append(
        extract_features(url)
    )

    if (index + 1) % 50000 == 0:
        print(
            f"Processed {index + 1:,} / {total:,} URLs"
        )


X = pd.DataFrame(
    feature_rows,
    columns=get_feature_names()
)

y = df["target"]


print("\nFeature extraction complete.")
print(f"Feature matrix shape: {X.shape}")


# ---------------------------------------------------------
# CREATE VALIDATION SET
# ---------------------------------------------------------

print("\nCreating validation set...")

X_train, X_validation, y_train, y_validation = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"Training rows:   {len(X_train):,}")
print(f"Validation rows: {len(X_validation):,}")


# ---------------------------------------------------------
# LOAD CURRENT MODEL
# ---------------------------------------------------------

print("\nLoading current Random Forest model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully.")


# ---------------------------------------------------------
# GET PHISHING PROBABILITIES
# ---------------------------------------------------------

print("\nCalculating phishing probabilities...")

probabilities = model.predict_proba(X_validation)

classes = list(model.classes_)

if 1 not in classes:
    raise RuntimeError(
        "The trained model does not contain class 1 "
        "for phishing."
    )

phishing_index = classes.index(1)

phishing_probabilities = probabilities[:, phishing_index]


# ---------------------------------------------------------
# TEST DIFFERENT THRESHOLDS
# ---------------------------------------------------------

thresholds = [
    0.30,
    0.35,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
]

print("\n")
print("=" * 70)
print("THRESHOLD RESULTS")
print("=" * 70)

print(
    f"{'Threshold':<12}"
    f"{'Accuracy':<12}"
    f"{'Precision':<12}"
    f"{'Recall':<12}"
    f"{'F1':<12}"
)

print("-" * 70)


results = []

for threshold in thresholds:

    predictions = (
        phishing_probabilities >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        y_validation,
        predictions
    )

    precision = precision_score(
        y_validation,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_validation,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_validation,
        predictions,
        zero_division=0
    )

    cm = confusion_matrix(
        y_validation,
        predictions
    )

    tn, fp, fn, tp = cm.ravel()

    results.append({
        "threshold": threshold,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "tn": tn,
        "fp": fp,
        "fn": fn,
        "tp": tp,
    })

    print(
        f"{threshold:<12.2f}"
        f"{accuracy:<12.4f}"
        f"{precision:<12.4f}"
        f"{recall:<12.4f}"
        f"{f1:<12.4f}"
    )


# ---------------------------------------------------------
# BEST F1 THRESHOLD
# ---------------------------------------------------------

best_result = max(
    results,
    key=lambda item: item["f1"]
)


print("\n")
print("=" * 70)
print("BEST F1 THRESHOLD")
print("=" * 70)

print(
    f"Threshold:  {best_result['threshold']:.2f}"
)

print(
    f"Accuracy:   {best_result['accuracy']:.4f}"
)

print(
    f"Precision:  {best_result['precision']:.4f}"
)

print(
    f"Recall:     {best_result['recall']:.4f}"
)

print(
    f"F1-score:   {best_result['f1']:.4f}"
)

print(
    f"True Negatives:  {best_result['tn']:,}"
)

print(
    f"False Positives: {best_result['fp']:,}"
)

print(
    f"False Negatives: {best_result['fn']:,}"
)

print(
    f"True Positives:  {best_result['tp']:,}"
)


# ---------------------------------------------------------
# FINISH
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("THRESHOLD EVALUATION COMPLETE")
print("=" * 70)