import os
import re
import time
import json
from datetime import datetime

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
# PATHS AND CONFIGURATION
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv",
)

MODEL_DIR = os.path.join(
    CURRENT_DIR,
    "models",
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "phishing_url_model.pkl",
)

TEMP_MODEL_PATH = os.path.join(
    MODEL_DIR,
    "phishing_url_model_temp.pkl",
)

REPORT_PATH = os.path.join(
    MODEL_DIR,
    "training_report.json",
)

TEST_SIZE = 0.20
RANDOM_STATE = 42
NUMBER_OF_TREES = 200

# Must match PHISHING_THRESHOLD in predict.py.
PHISHING_THRESHOLD = 0.50

EXPECTED_FEATURE_COUNT = 34

THRESHOLDS_TO_COMPARE = [
    0.30,
    0.35,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
]


# ============================================================
# URL NORMALIZATION
# ============================================================

def normalize_url_for_features(value):
    """
    Remove the URL scheme and leading // when present.

    The feature extractor performs its own normalization,
    including canonicalizing a leading www. hostname prefix.
    """

    url = str(value).strip()

    url = re.sub(
        r"^[a-zA-Z][a-zA-Z0-9+.-]*://",
        "",
        url,
        count=1,
    )

    if url.startswith("//"):
        url = url[2:]

    return url


# ============================================================
# DATA VALIDATION
# ============================================================

def is_usable_url(value):
    """Reject empty, excessively long, or corrupted URL rows."""

    if not isinstance(value, str):
        return False

    url = value.strip()

    if not url or len(url) > 2048:
        return False

    if any(
        ord(character) < 32 or ord(character) == 127
        for character in url
    ):
        return False

    non_ascii_count = sum(
        ord(character) > 126
        for character in url
    )

    if non_ascii_count / max(len(url), 1) > 0.10:
        return False

    return bool(normalize_url_for_features(url))


# ============================================================
# LOAD AND CLEAN DATASET
# ============================================================

def load_and_clean_dataset():

    print("\nLoading dataset...")

    if not os.path.isfile(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found:\n{DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    print(f"Original rows: {len(df):,}")
    print(f"Dataset columns: {df.columns.tolist()}")

    required_columns = {"URL", "Label"}

    if not required_columns.issubset(df.columns):
        raise ValueError(
            "The dataset must contain URL and Label columns."
        )

    df = df[["URL", "Label"]].copy()

    original_count = len(df)

    df = df.dropna(
        subset=["URL", "Label"]
    ).copy()

    print(
        "Rows removed due to missing values: "
        f"{original_count - len(df):,}"
    )

    df["URL"] = df["URL"].astype(str).str.strip()

    df["Label"] = (
        df["Label"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # good = legitimate; bad = phishing.
    df = df[df["Label"].isin(["good", "bad"])].copy()

    before_url_cleaning = len(df)

    df = df[df["URL"].apply(is_usable_url)].copy()

    print(
        "Unusable URLs removed: "
        f"{before_url_cleaning - len(df):,}"
    )

    if df.empty:
        raise ValueError(
            "No usable URLs remain after cleaning."
        )

    # Remove URLs whose exact string has conflicting labels.
    label_counts = df.groupby("URL")["Label"].nunique()

    conflicting_urls = label_counts[
        label_counts > 1
    ].index

    print(
        "URLs with conflicting labels: "
        f"{len(conflicting_urls):,}"
    )

    if len(conflicting_urls) > 0:
        df = df[
            ~df["URL"].isin(conflicting_urls)
        ].copy()

    before_deduplication = len(df)

    df = df.drop_duplicates(subset=["URL"]).copy()

    print(
        "Duplicate rows removed: "
        f"{before_deduplication - len(df):,}"
    )

    df["target"] = df["Label"].map({
        "good": 0,
        "bad": 1,
    })

    df["feature_url"] = df["URL"].apply(
        normalize_url_for_features
    )

    if df["target"].nunique() != 2:
        raise ValueError(
            "Both legitimate and phishing examples are required."
        )

    print(f"\nCleaned dataset rows: {len(df):,}")

    print("\nLabel distribution:")

    print(
        df["target"]
        .value_counts()
        .sort_index()
        .rename(index={
            0: "Legitimate (0)",
            1: "Phishing (1)",
        })
        .to_string()
    )

    return df.reset_index(drop=True)


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def build_feature_matrix(df, feature_names):

    print("\n" + "=" * 70)
    print("EXTRACTING URL FEATURES")
    print("=" * 70)

    start_time = time.time()

    feature_matrix = []
    total_urls = len(df)

    for index, url in enumerate(
        df["feature_url"],
        start=1,
    ):

        features = extract_features(url)

        if len(features) != len(feature_names):
            raise ValueError(
                f"Feature mismatch at row {index}: "
                f"expected {len(feature_names)}, "
                f"received {len(features)}."
            )

        feature_matrix.append(features)

        if index % 50000 == 0:
            print(
                f"Processed {index:,} / "
                f"{total_urls:,} URLs"
            )

    X = pd.DataFrame(
        feature_matrix,
        columns=feature_names,
    )

    y = df["target"].reset_index(drop=True)

    if X.empty:
        raise ValueError(
            "Feature extraction returned no data."
        )

    if X.isnull().any().any():
        raise ValueError(
            "Missing values detected in the feature matrix."
        )

    if not all(
        pd.api.types.is_numeric_dtype(dtype)
        for dtype in X.dtypes
    ):
        raise ValueError(
            "All extracted features must be numeric."
        )

    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Target vector shape: {y.shape}")
    print(f"Number of features: {len(feature_names)}")

    print(
        f"Feature extraction time: "
        f"{time.time() - start_time:.2f} seconds"
    )

    return X, y


# ============================================================
# MODEL EVALUATION
# ============================================================

def evaluate_model(model, X_test, y_test):

    print("\nGenerating phishing probabilities...")

    probabilities = model.predict_proba(X_test)

    classes = list(model.classes_)

    if 1 not in classes:
        raise ValueError(
            "The trained model does not contain phishing class 1."
        )

    phishing_index = classes.index(1)

    phishing_probabilities = probabilities[:, phishing_index]

    # Main metrics use the same threshold as predict.py.
    y_pred = (
        phishing_probabilities >= PHISHING_THRESHOLD
    ).astype(int)

    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        y_pred,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        y_pred,
        zero_division=0,
    )

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=[0, 1],
    )

    tn, fp, fn, tp = cm.ravel()

    false_positive_rate = (
        fp / (tn + fp)
        if (tn + fp) > 0
        else 0.0
    )

    print("\n" + "=" * 70)
    print(
        f"MODEL PERFORMANCE "
        f"(THRESHOLD = {PHISHING_THRESHOLD:.2f})"
    )
    print("=" * 70)

    print(f"\nAccuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nConfusion matrix")
    print("Rows = Actual; Columns = Predicted")
    print("                 Legitimate  Phishing")
    print(f"Actual Legitimate {tn:11,d} {fp:9,d}")
    print(f"Actual Phishing   {fn:11,d} {tp:9,d}")

    print("\nClassification report:")

    print(
        classification_report(
            y_test,
            y_pred,
            labels=[0, 1],
            target_names=["Legitimate", "Phishing"],
            zero_division=0,
        )
    )

    print(
        f"False positive rate: {false_positive_rate:.4f}"
    )

    # Compare thresholds on the same held-out test set.
    print("\nThreshold comparison:")

    print(
        f"{'Threshold':<12}"
        f"{'Precision':<12}"
        f"{'Recall':<12}"
        f"{'F1 Score':<12}"
        f"{'False Pos.':<12}"
        f"{'False Neg.':<12}"
    )

    threshold_results = {}

    for threshold in THRESHOLDS_TO_COMPARE:

        threshold_pred = (
            phishing_probabilities >= threshold
        ).astype(int)

        threshold_cm = confusion_matrix(
            y_test,
            threshold_pred,
            labels=[0, 1],
        )

        threshold_tn, threshold_fp, threshold_fn, threshold_tp = (
            threshold_cm.ravel()
        )

        threshold_precision = precision_score(
            y_test,
            threshold_pred,
            zero_division=0,
        )

        threshold_recall = recall_score(
            y_test,
            threshold_pred,
            zero_division=0,
        )

        threshold_f1 = f1_score(
            y_test,
            threshold_pred,
            zero_division=0,
        )

        print(
            f"{threshold:<12.2f}"
            f"{threshold_precision:<12.4f}"
            f"{threshold_recall:<12.4f}"
            f"{threshold_f1:<12.4f}"
            f"{threshold_fp:<12,d}"
            f"{threshold_fn:<12,d}"
        )

        threshold_results[str(threshold)] = {
            "precision": float(threshold_precision),
            "recall": float(threshold_recall),
            "f1": float(threshold_f1),
            "true_negatives": int(threshold_tn),
            "false_positives": int(threshold_fp),
            "false_negatives": int(threshold_fn),
            "true_positives": int(threshold_tp),
        }

    return {
        "threshold": PHISHING_THRESHOLD,
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
        "false_positive_rate": float(false_positive_rate),
        "threshold_comparison": threshold_results,
    }


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

def display_feature_importance(model, feature_names):

    print("\n" + "=" * 70)
    print("FEATURE IMPORTANCE")
    print("=" * 70)

    importance_df = pd.DataFrame({
        "feature": feature_names,
        "importance": model.feature_importances_,
    }).sort_values(
        by="importance",
        ascending=False,
    )

    print(
        importance_df.to_string(
            index=False,
            formatters={
                "importance": "{:.6f}".format,
            },
        )
    )

    return importance_df


# ============================================================
# MAIN TRAINING PIPELINE
# ============================================================

def main():

    start_time = time.time()

    print("=" * 70)
    print("PHISHSHIELD RANDOM FOREST MODEL TRAINING")
    print("=" * 70)

    os.makedirs(MODEL_DIR, exist_ok=True)

    # Step 1: Load and clean the dataset.
    df = load_and_clean_dataset()

    # Step 2: Verify feature definitions.
    feature_names = get_feature_names()

    if len(feature_names) != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_FEATURE_COUNT} features, "
            f"but found {len(feature_names)}."
        )

    if len(set(feature_names)) != len(feature_names):
        raise ValueError(
            "Duplicate feature names detected."
        )

    # Step 3: Extract features.
    X, y = build_feature_matrix(df, feature_names)

    # Step 4: Split into training and test sets.
    print("\n" + "=" * 70)
    print("CREATING TRAINING AND TEST SETS")
    print("=" * 70)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    print(f"Training samples: {len(X_train):,}")
    print(f"Testing samples : {len(X_test):,}")

    # Step 5: Configure the Random Forest.
    print("\n" + "=" * 70)
    print("TRAINING RANDOM FOREST")
    print("=" * 70)

    print("Algorithm: Random Forest")
    print(f"Number of trees: {NUMBER_OF_TREES}")
    print("Class weight: None")
    print(f"Random state: {RANDOM_STATE}")
    print("Parallel processing: enabled")

    model = RandomForestClassifier(
        n_estimators=NUMBER_OF_TREES,
        max_depth=None,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight=None,
    )

    # Step 6: Train the model.
    training_start = time.time()

    print("\nTraining model...")

    model.fit(X_train, y_train)

    print(
        f"\nTraining completed in "
        f"{time.time() - training_start:.2f} seconds."
    )

    # Step 7: Evaluate on held-out test data.
    metrics = evaluate_model(
        model,
        X_test,
        y_test,
    )

    # Step 8: Display feature importance.
    importance_df = display_feature_importance(
        model,
        feature_names,
    )

    # Step 9: Save to a temporary file first.
    # Do not replace the current model until training succeeds.
    print("\n" + "=" * 70)
    print("SAVING MODEL")
    print("=" * 70)

    model_metadata = {
        "feature_names": feature_names,
        "threshold": PHISHING_THRESHOLD,
        "algorithm": "RandomForestClassifier",
        "n_estimators": NUMBER_OF_TREES,
        "random_state": RANDOM_STATE,
        "training_date": datetime.now().isoformat(timespec="seconds"),
    }

    try:
        joblib.dump(
            {
                "model": model,
                "metadata": model_metadata,
            },
            TEMP_MODEL_PATH,
        )

        # Verify that the temporary model can be loaded.
        saved_object = joblib.load(TEMP_MODEL_PATH)

        if (
            not isinstance(saved_object, dict)
            or "model" not in saved_object
            or "metadata" not in saved_object
        ):
            raise ValueError(
                "Saved model validation failed."
            )

        loaded_model = saved_object["model"]

        if len(loaded_model.feature_names_in_) != EXPECTED_FEATURE_COUNT:
            raise ValueError(
                "Saved model feature count is incorrect."
            )

        # Replace the current model only after validation.
        os.replace(TEMP_MODEL_PATH, MODEL_PATH)

        print(f"\nModel saved successfully:\n{MODEL_PATH}")

    except Exception:
        if os.path.exists(TEMP_MODEL_PATH):
            os.remove(TEMP_MODEL_PATH)
        raise

    # Step 10: Save a JSON training report.
    report = {
        "training_date": datetime.now().isoformat(timespec="seconds"),
        "dataset_path": DATASET_PATH,
        "dataset_rows_used": int(len(df)),
        "training_samples": int(len(X_train)),
        "testing_samples": int(len(X_test)),
        "feature_count": int(len(feature_names)),
        "feature_names": feature_names,
        "model": model_metadata,
        "metrics": metrics,
        "top_features": [
            {
                "feature": str(row["feature"]),
                "importance": float(row["importance"]),
            }
            for _, row in importance_df.head(15).iterrows()
        ],
        "execution_time_seconds": round(
            time.time() - start_time,
            2,
        ),
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as report_file:
        json.dump(report, report_file, indent=4)

    # Step 11: Print summary.
    print("\n" + "=" * 70)
    print("TRAINING SUMMARY")
    print("=" * 70)

    print(f"Dataset rows used: {len(df):,}")
    print(f"Number of features: {len(feature_names)}")
    print(f"Training samples: {len(X_train):,}")
    print(f"Testing samples: {len(X_test):,}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"F1 Score: {metrics['f1']:.4f}")
    print(
        f"False positive rate: "
        f"{metrics['false_positive_rate']:.4f}"
    )

    print(
        f"Total execution time: "
        f"{time.time() - start_time:.2f} seconds"
    )

    print(f"\nTraining report saved to:\n{REPORT_PATH}")

    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()

