import os
import time

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split

from feature_extraction import (
    extract_features,
    get_feature_names,
)


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv"
)

MODEL_DIR = os.path.join(
    CURRENT_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "phishing_url_model.pkl"
)


# ============================================================
# START
# ============================================================

print("=" * 70)
print("PHISHSHIELD RANDOM FOREST MODEL TRAINING")
print("=" * 70)

start_time = time.time()


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(
    DATASET_PATH
)

print("Dataset loaded successfully.")

print(
    f"Original number of rows: {len(df):,}"
)

print(
    f"Columns: {df.columns.tolist()}"
)


# ============================================================
# CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "URL",
    "Label"
]

for column in required_columns:

    if column not in df.columns:

        raise ValueError(
            f"Required column '{column}' "
            f"was not found in the dataset."
        )


# ============================================================
# CLEAN DATA
# ============================================================

print("\nCleaning dataset...")

df["URL"] = (
    df["URL"]
    .astype(str)
    .str.strip()
)

df["Label"] = (
    df["Label"]
    .astype(str)
    .str.strip()
    .str.lower()
)


# ============================================================
# REMOVE EMPTY URLs
# ============================================================

before_empty_removal = len(df)

df = df[
    df["URL"].str.len() > 0
]

removed_empty = (
    before_empty_removal - len(df)
)

print(
    f"Empty URLs removed: {removed_empty:,}"
)


# ============================================================
# KEEP ONLY EXPECTED LABELS
# ============================================================

df = df[
    df["Label"].isin(
        ["good", "bad"]
    )
]

print("\nLabels found:")

print(
    df["Label"].value_counts()
)


# ============================================================
# REMOVE DUPLICATE URLs
# ============================================================

before_duplicates = len(df)

df = df.drop_duplicates(
    subset=["URL"]
)

duplicates_removed = (
    before_duplicates - len(df)
)

print(
    f"\nDuplicate URLs removed: "
    f"{duplicates_removed:,}"
)

print(
    f"Remaining URLs: {len(df):,}"
)


# ============================================================
# CONVERT LABELS
#
# good = 0 = legitimate
# bad  = 1 = phishing
# ============================================================

df["Label"] = df["Label"].map(
    {
        "good": 0,
        "bad": 1,
    }
)


print("\nFinal label distribution:")

print(
    df["Label"]
    .value_counts()
    .sort_index()
)


# ============================================================
# EXTRACT FEATURES
# ============================================================

print("\n" + "=" * 70)
print("EXTRACTING URL FEATURES")
print("=" * 70)

feature_start_time = time.time()

feature_matrix = []

total_urls = len(df)

for index, url in enumerate(
    df["URL"],
    start=1
):

    features = extract_features(
        url
    )

    feature_matrix.append(
        features
    )

    # Show progress every 50,000 URLs
    if index % 50000 == 0:

        print(
            f"Processed "
            f"{index:,} / "
            f"{total_urls:,} URLs"
        )


feature_names = get_feature_names()


# ============================================================
# VERIFY FEATURE COUNT
# ============================================================

if len(feature_matrix) == 0:

    raise ValueError(
        "No features were extracted."
    )


actual_feature_count = len(
    feature_matrix[0]
)

expected_feature_count = len(
    feature_names
)


print(
    f"\nNumber of features extracted: "
    f"{actual_feature_count}"
)

print(
    f"Number of feature names: "
    f"{expected_feature_count}"
)


if actual_feature_count != expected_feature_count:

    raise ValueError(
        "Feature count mismatch! "
        "extract_features() and "
        "get_feature_names() must "
        "return the same number of features."
    )


# ============================================================
# CREATE FEATURE DATAFRAME
# ============================================================

X = pd.DataFrame(
    feature_matrix,
    columns=feature_names
)

y = df["Label"]


print(
    f"\nFeature matrix shape: "
    f"{X.shape}"
)

print(
    f"Target vector shape: "
    f"{y.shape}"
)


# ============================================================
# CHECK FOR MISSING VALUES
# ============================================================

missing_values = (
    X.isnull().sum().sum()
)

print(
    f"\nMissing feature values: "
    f"{missing_values}"
)


if missing_values > 0:

    raise ValueError(
        "Missing values detected "
        "in feature matrix."
    )


feature_time = (
    time.time()
    - feature_start_time
)

print(
    f"\nFeature extraction time: "
    f"{feature_time:.2f} seconds"
)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

print("\n" + "=" * 70)
print("CREATING TRAINING AND TEST SETS")
print("=" * 70)

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.20,

    random_state=42,

    stratify=y,
)


print(
    f"Training samples: "
    f"{len(X_train):,}"
)

print(
    f"Testing samples: "
    f"{len(X_test):,}"
)


# ============================================================
# RANDOM FOREST
# ============================================================

print("\n" + "=" * 70)
print("TRAINING RANDOM FOREST")
print("=" * 70)

print("\nModel configuration:")

print("Algorithm: Random Forest")

print("Number of trees: 200")

print("Class weight: None")

print("Random state: 42")

print("Parallel processing: enabled")


# ============================================================
# RANDOM FOREST MODEL
#
# NOTE:
# class_weight="balanced" has intentionally been removed.
#
# We are testing whether the previous balanced weighting
# contributed to the high false-positive rate.
# ============================================================

model = RandomForestClassifier(

    n_estimators=200,

    max_depth=None,

    random_state=42,

    n_jobs=-1,

)


# ============================================================
# TRAIN MODEL
# ============================================================

training_start_time = time.time()

print("\nTraining model...")

model.fit(
    X_train,
    y_train
)

training_time = (
    time.time()
    - training_start_time
)

print(
    f"\nTraining completed in "
    f"{training_time:.2f} seconds."
)


# ============================================================
# MAKE PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

y_pred = model.predict(
    X_test
)


# ============================================================
# MODEL METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)


# ============================================================
# DISPLAY METRICS
# ============================================================

print("\n" + "=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)

print(
    f"\nAccuracy : {accuracy:.4f}"
)

print(
    f"Precision: {precision:.4f}"
)

print(
    f"Recall   : {recall:.4f}"
)

print(
    f"F1 Score : {f1:.4f}"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(

        y_test,

        y_pred,

        target_names=[
            "Legitimate",
            "Phishing",
        ],

        zero_division=0,

    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

cm = confusion_matrix(
    y_test,
    y_pred
)

print(
    "\nRows = Actual"
)

print(
    "Columns = Predicted"
)

print()

print(
    "                 Predicted"
)

print(
    "                 Legitimate  Phishing"
)

print(
    f"Actual Legitimate   "
    f"{cm[0][0]:8d}  "
    f"{cm[0][1]:8d}"
)

print(
    f"Actual Phishing     "
    f"{cm[1][0]:8d}  "
    f"{cm[1][1]:8d}"
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

feature_importance = pd.DataFrame({

    "feature": feature_names,

    "importance":
        model.feature_importances_,

})

feature_importance = (
    feature_importance
    .sort_values(
        by="importance",
        ascending=False
    )
)


print(
    feature_importance.to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

print("\n" + "=" * 70)
print("SAVING MODEL")
print("=" * 70)

joblib.dump(
    model,
    MODEL_PATH
)

print(
    "\nModel saved successfully!"
)

print(
    f"Model location:\n{MODEL_PATH}"
)


# ============================================================
# FINAL SUMMARY
# ============================================================

total_time = (
    time.time()
    - start_time
)

print("\n" + "=" * 70)
print("TRAINING SUMMARY")
print("=" * 70)

print(
    f"\nDataset rows used: "
    f"{len(df):,}"
)

print(
    f"Number of features: "
    f"{len(feature_names)}"
)

print(
    f"Training samples: "
    f"{len(X_train):,}"
)

print(
    f"Testing samples: "
    f"{len(X_test):,}"
)

print(
    f"Accuracy: "
    f"{accuracy:.4f}"
)

print(
    f"Precision: "
    f"{precision:.4f}"
)

print(
    f"Recall: "
    f"{recall:.4f}"
)

print(
    f"F1 Score: "
    f"{f1:.4f}"
)

print(
    f"Total execution time: "
    f"{total_time:.2f} seconds"
)

print("\n" + "=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)