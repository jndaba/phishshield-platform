import os
import pandas as pd


# ============================================================
# DATASET PATH
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv"
)


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print("\nDataset loaded successfully!")
print(f"Total rows: {len(df)}")
print(f"Columns: {df.columns.tolist()}")


# ============================================================
# NORMALIZE URL COLUMN
# ============================================================

df["URL"] = df["URL"].astype(str).str.strip().str.lower()

df["Label"] = df["Label"].astype(str).str.strip().str.lower()


# ============================================================
# URLS WE WANT TO INVESTIGATE
# ============================================================

test_urls = [
    "https://www.google.com",
    "https://www.microsoft.com",
    "https://www.wikipedia.org",
]


# ============================================================
# CHECK EXACT URL MATCHES
# ============================================================

print("\n" + "=" * 70)
print("EXACT URL MATCHES")
print("=" * 70)

for url in test_urls:

    matches = df[df["URL"] == url.lower()]

    print(f"\nURL: {url}")

    if matches.empty:

        print("NOT FOUND in dataset")

    else:

        print("FOUND")

        print(
            matches[["URL", "Label"]]
            .to_string(index=False)
        )


# ============================================================
# CHECK DOMAIN CONTAINMENT
# ============================================================

print("\n" + "=" * 70)
print("DOMAIN-RELATED DATASET ENTRIES")
print("=" * 70)

domains = [
    "google.com",
    "microsoft.com",
    "wikipedia.org",
]


for domain in domains:

    print(f"\n--- {domain} ---")

    matches = df[
        df["URL"].str.contains(
            domain,
            case=False,
            na=False,
            regex=False
        )
    ]

    if matches.empty:

        print("No entries found")

    else:

        print(
            f"Found {len(matches)} related entries"
        )

        print("\nLabel distribution:")

        print(
            matches["Label"]
            .value_counts()
        )

        print("\nSample URLs:")

        print(
            matches[["URL", "Label"]]
            .head(10)
            .to_string(index=False)
        )


# ============================================================
# OVERALL LABEL DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("OVERALL LABEL DISTRIBUTION")
print("=" * 70)

print(
    df["Label"].value_counts()
)


print("\nDiagnostic complete.")