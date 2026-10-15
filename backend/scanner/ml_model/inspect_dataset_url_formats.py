import os
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv",
)


def classify_format(url):
    url = str(url).strip().lower()

    if url.startswith("https://"):
        return "HTTPS"
    if url.startswith("http://"):
        return "HTTP"
    return "No scheme"


def main():
    print("=" * 90)
    print("PHISHSHIELD DATASET URL FORMAT INSPECTION")
    print("=" * 90)

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    required = {"URL", "Label"}
    if not required.issubset(df.columns):
        raise ValueError(
            f"Expected columns {required}; found {list(df.columns)}"
        )

    df = df.dropna(subset=["URL", "Label"]).copy()
    df["URL"] = df["URL"].astype(str).str.strip()
    df["Label"] = df["Label"].astype(str).str.strip().str.lower()

    df = df[
        (df["URL"] != "")
        & (df["Label"].isin(["good", "bad"]))
    ].copy()

    # Match the duplicate-removal approach used in training.
    df = df.drop_duplicates(subset=["URL"]).copy()
    df["Format"] = df["URL"].apply(classify_format)

    print(f"\nUnique cleaned URLs: {len(df):,}")

    print("\n1. URL FORMAT COUNTS")
    print("-" * 90)

    format_counts = (
        df["Format"]
        .value_counts()
        .reindex(["No scheme", "HTTP", "HTTPS"], fill_value=0)
    )

    format_table = pd.DataFrame({
        "Count": format_counts,
        "Percentage": (
            format_counts / len(df) * 100
        ).round(2),
    })

    print(format_table.to_string())

    print("\n2. URL FORMAT COUNTS BY LABEL")
    print("-" * 90)

    label_table = pd.crosstab(
        df["Label"],
        df["Format"],
    ).reindex(
        columns=["No scheme", "HTTP", "HTTPS"],
        fill_value=0,
    )

    print(label_table.to_string())

    print("\n3. PERCENTAGE OF EACH LABEL BY FORMAT")
    print("-" * 90)

    label_percentages = (
        pd.crosstab(
            df["Label"],
            df["Format"],
            normalize="index",
        ) * 100
    ).round(2)

    print(label_percentages.to_string())

    print("\n4. SAMPLE URLS BY FORMAT AND LABEL")
    print("-" * 90)

    for label in ["good", "bad"]:
        for fmt in ["No scheme", "HTTP", "HTTPS"]:
            subset = df[
                (df["Label"] == label)
                & (df["Format"] == fmt)
            ]

            print(f"\nLabel={label.upper()}, Format={fmt}")
            if subset.empty:
                print("  No examples found.")
                continue

            for url in subset["URL"].head(5):
                print(f"  {url}")

    print("\n" + "=" * 90)
    print("INSPECTION COMPLETE — DATASET WAS NOT MODIFIED")
    print("=" * 90)


if __name__ == "__main__":
    main()

