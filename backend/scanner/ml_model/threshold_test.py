
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

# =========================================================
# PATHS
# =========================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv",
)

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "models",
    "phishing_url_model.pkl",
)

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from feature_extraction import extract_features, get_feature_names


# =========================================================
# SETTINGS
# =========================================================

CURRENT_THRESHOLD = 0.45

THRESHOLDS = [
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


# =========================================================
# LOAD AND CLEAN DATASET
# Match train_model.py preprocessing exactly.
# =========================================================

print("=" * 85)
print("PHISHSHIELD: HELD-OUT TEST SET THRESHOLD EVALUATION")
print("=" * 85)

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Original rows: {len(df):,}")

required_columns = ["URL", "Label"]

for column in required_columns:
    if column not in df.columns:
        raise ValueError(
            f"Required dataset column missing: {column}"
        )

df["URL"] = df["URL"].astype(str).str.strip()

df["Label"] = (
    df["Label"]
    .astype(str)
    .str.strip()
    .str.lower()
)

df = df[df["URL"].str.len() > 0].copy()

df = df[df["Label"].isin(["good", "bad"])].copy()

df = df.drop_duplicates(subset=["URL"]).copy()

df["Label"] = df["Label"].map({
    "good": 0,
    "bad": 1,
})

df = df.reset_index(drop=True)

print(f"Cleaned unique URLs: {len(df):,}")
print("\nClass distribution:")
print(df["Label"].value_counts().sort_index())

if df.empty:
    raise ValueError("No valid dataset rows remain after cleaning.")


# =========================================================
# EXTRACT FEATURES
# =========================================================

print("\nExtracting features...")

feature_names = get_feature_names()
feature_rows = []

total = len(df)

for index, url in enumerate(df["URL"], start=1):
    row = extract_features(url)

    if len(row) != len(feature_names):
        raise ValueError(
            f"Feature mismatch at row {index}: "
            f"expected {len(feature_names)}, got {len(row)}."
        )

    feature_rows.append(row)

    if index % 50000 == 0:
        print(f"Processed {index:,} / {total:,} URLs")

X = pd.DataFrame(
    feature_rows,
    columns=feature_names,
)

y = df["Label"].astype(int)

print(f"\nFeature matrix: {X.shape}")


# =========================================================
# RECREATE ORIGINAL TRAIN / TEST SPLIT
# Must match train_model.py.
# =========================================================

print("\nRecreating the original 80/20 split...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print(f"Training rows: {len(X_train):,}")
print(f"Test rows:     {len(X_test):,}")


# =========================================================
# LOAD EXISTING MODEL
# This script does NOT train or overwrite the model.
# =========================================================

print("\nLoading existing model...")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)

if not hasattr(model, "predict_proba"):
    raise TypeError(
        "The saved model does not support predict_proba()."
    )

if hasattr(model, "n_features_in_"):
    if model.n_features_in_ != X_test.shape[1]:
        raise ValueError(
            f"Model expects {model.n_features_in_} features, "
            f"but the current pipeline produces {X_test.shape[1]}. "
            "Check the model and feature-extraction version."
        )

if hasattr(model, "feature_names_in_"):
    if list(model.feature_names_in_) != list(X_test.columns):
        raise ValueError(
            "Feature names or ordering differ from the "
            "features used to train the saved model."
        )

classes = list(model.classes_)

if 1 not in classes:
    raise ValueError(
        "The saved model does not contain phishing class 1."
    )

phishing_index = classes.index(1)

print("Existing model loaded.")
print("No training or model replacement will occur.")


# =========================================================
# GET TEST-SET PROBABILITIES ONCE
# =========================================================

print("\nCalculating test-set probabilities...")

probabilities = model.predict_proba(X_test)

phishing_probabilities = probabilities[:, phishing_index]


# =========================================================
# EVALUATE THRESHOLDS
# =========================================================

results = []

print("\n" + "=" * 110)
print("THRESHOLD COMPARISON")
print("=" * 110)

header = (
    f"{'Threshold':<10}"
    f"{'Accuracy':<11}"
    f"{'Precision':<11}"
    f"{'Recall':<11}"
    f"{'F1':<11}"
    f"{'FPR':<11}"
    f"{'FP':<10}"
    f"{'FN':<10}"
)

print(header)
print("-" * 110)

for threshold in THRESHOLDS:
    predictions = (
        phishing_probabilities >= threshold
    ).astype(int)

    accuracy = accuracy_score(y_test, predictions)

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0,
    )

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
        labels=[0, 1],
    ).ravel()

    fpr = fp / (fp + tn) if (fp + tn) else 0.0

    result = {
        "threshold": threshold,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "fpr": fpr,
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
    }

    results.append(result)

    print(
        f"{threshold:<10.2f}"
        f"{accuracy:<11.4f}"
        f"{precision:<11.4f}"
        f"{recall:<11.4f}"
        f"{f1:<11.4f}"
        f"{fpr:<11.4f}"
        f"{fp:<10,}"
        f"{fn:<10,}"
    )


# =========================================================
# CURRENT THRESHOLD DETAILS
# =========================================================

current_result = next(
    (
        result for result in results
        if result["threshold"] == CURRENT_THRESHOLD
    ),
    None,
)

if current_result is not None:
    print("\n" + "=" * 85)
    print(f"CURRENT THRESHOLD: {CURRENT_THRESHOLD:.2f}")
    print("=" * 85)

    print(f"Accuracy:         {current_result['accuracy']:.4f}")
    print(f"Precision:        {current_result['precision']:.4f}")
    print(f"Recall:           {current_result['recall']:.4f}")
    print(f"F1-score:         {current_result['f1']:.4f}")
    print(f"False-positive rate: {current_result['fpr']:.4f}")
    print(f"True negatives:   {current_result['tn']:,}")
    print(f"False positives:  {current_result['fp']:,}")
    print(f"False negatives:  {current_result['fn']:,}")
    print(f"True positives:   {current_result['tp']:,}")


# =========================================================
# BEST F1 THRESHOLD
# =========================================================

best_f1 = max(results, key=lambda item: item["f1"])

print("\n" + "=" * 85)
print("BEST F1-SCORE AMONG TESTED THRESHOLDS")
print("=" * 85)

print(f"Threshold:          {best_f1['threshold']:.2f}")
print(f"Accuracy:            {best_f1['accuracy']:.4f}")
print(f"Precision:           {best_f1['precision']:.4f}")
print(f"Recall:              {best_f1['recall']:.4f}")
print(f"F1-score:            {best_f1['f1']:.4f}")
print(f"False-positive rate: {best_f1['fpr']:.4f}")
print(f"False positives:     {best_f1['fp']:,}")
print(f"False negatives:     {best_f1['fn']:,}")


# =========================================================
# LOWEST FPR WITH RECALL AT LEAST 80%
# This is a comparison candidate, not an automatic choice.
# =========================================================

minimum_recall = 0.80

eligible = [
    result for result in results
    if result["recall"] >= minimum_recall
]

print("\n" + "=" * 85)
print(f"LOWEST FALSE-POSITIVE RATE WITH RECALL >= {minimum_recall:.0%}")
print("=" * 85)

if eligible:
    best_balance = min(
        eligible,
        key=lambda item: (
            item["fpr"],
            -item["precision"],
        ),
    )

    print(f"Threshold:          {best_balance['threshold']:.2f}")
    print(f"Accuracy:            {best_balance['accuracy']:.4f}")
    print(f"Precision:           {best_balance['precision']:.4f}")
    print(f"Recall:              {best_balance['recall']:.4f}")
    print(f"F1-score:            {best_balance['f1']:.4f}")
    print(f"False-positive rate: {best_balance['fpr']:.4f}")
    print(f"False positives:     {best_balance['fp']:,}")
    print(f"False negatives:     {best_balance['fn']:,}")
else:
    print(
        "No tested threshold met the minimum recall requirement. "
        "Consider testing additional thresholds."
    )


# =========================================================
# FINISH
# =========================================================

print("\n" + "=" * 85)
print("EVALUATION COMPLETE")
print("The saved model was not modified.")
print("=" * 85)