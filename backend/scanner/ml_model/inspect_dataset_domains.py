import os
import sys
from urllib.parse import urlparse

import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset",
    "phishing_site_urls.csv",
)

DOMAINS_TO_CHECK = [
    "google.com",
    "microsoft.com",
    "github.com",
    "apple.com",
    "wikipedia.org",
    "python.org",
    "mozilla.org",
]


def get_hostname(url):
    """Extract a hostname safely from a dataset URL."""
    try:
        value = str(url).strip()

        if not value or value.lower() == "nan":
            return ""

        if "://" not in value:
            value = "http://" + value

        return (urlparse(value).hostname or "").lower().rstrip(".")
    except (ValueError, TypeError):
        return ""


def domain_matches(hostname, domain):
    """Match the domain itself or a genuine subdomain."""
    return hostname == domain or hostname.endswith("." + domain)


def main():
    print("=" * 90)
    print("PHISHSHIELD DATASET DOMAIN INSPECTION")
    print("=" * 90)

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    required_columns = {"URL", "Label"}
    if not required_columns.issubset(df.columns):
        raise ValueError(
            f"Expected columns {required_columns}; "
            f"found {list(df.columns)}"
        )

    df = df.dropna(subset=["URL", "Label"]).copy()
    df["URL"] = df["URL"].astype(str).str.strip()
    df["Label"] = df["Label"].astype(str).str.strip().str.lower()
    df = df[df["URL"] != ""].copy()

    # Match the label convention used by the training script.
    df = df[df["Label"].isin(["good", "bad"])].copy()
    df = df.drop_duplicates(subset=["URL"]).copy()

    df["hostname"] = df["URL"].apply(get_hostname)

    print(f"\nUnique URLs inspected: {len(df):,}")
    print("\nOverall label counts:")
    print(df["Label"].value_counts().to_string())

    print("\n" + "=" * 90)
    print("LABEL COUNTS FOR WELL-KNOWN DOMAINS")
    print("=" * 90)

    for domain in DOMAINS_TO_CHECK:
        matches = df[
            df["hostname"].apply(
                lambda host: domain_matches(host, domain)
            )
        ]

        print(f"\nDomain: {domain}")
        print(f"Matching URLs: {len(matches):,}")

        if matches.empty:
            print("No matching URLs found in the dataset.")
            continue

        counts = matches["Label"].value_counts()
        print(f"Labels: {counts.to_dict()}")

        # Show examples that the dataset labels as phishing.
        bad_examples = matches[matches["Label"] == "bad"]

        if not bad_examples.empty:
            print("Examples labeled BAD:")
            for url in bad_examples["URL"].head(5):
                print(f"  {url}")

        # Show examples that the dataset labels as legitimate.
        good_examples = matches[matches["Label"] == "good"]

        if not good_examples.empty:
            print("Examples labeled GOOD:")
            for url in good_examples["URL"].head(3):
                print(f"  {url}")

    print("\n" + "=" * 90)
    print("INSPECTION COMPLETE — DATASET WAS NOT MODIFIED")
    print("=" * 90)


if __name__ == "__main__":
    main()

