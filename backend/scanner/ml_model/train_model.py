import io
import re
import os
import gzip
import joblib
import urllib.request
import urllib.error
import pandas as pd
from urllib.parse import urlparse
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report


def extract_features(url: str):
    """Extract heuristic and structural features from a URL string."""
    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        hostname = parsed.hostname or ""
        path = parsed.path or ""
    except Exception:
        hostname = ""
        path = ""

    features = {
        'url_length': len(str(url)),
        'having_ip': 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname) else 0,
        'count_at': str(url).count('@'),
        'count_hyphen': hostname.count('-'),
        'count_dot': str(url).count('.'),
        'count_slash': str(url).count('/'),
        'count_question': str(url).count('?'),
        'count_equal': str(url).count('='),
        'uses_https': 1 if str(url).startswith('https://') else 0,
        'suspicious_keyword': 1 if any(k in str(url).lower() for k in [
            'login', 'verify', 'update', 'banking', 'secure', 'password',
            'free', 'account', 'signin', 'confirm', 'payment', 'webscr', 'ebayisapi'
        ]) else 0
    }
    return list(features.values())


def fetch_phishtank_feed(sample_size: int = 2000) -> pd.DataFrame:
    """
    Downloads verified online phishing URLs from PhishTank developer feed.
    """
    print("Fetching live phishing URLs from PhishTank...")
    url = "http://data.phishtank.com/data/online-valid.csv.gz"
    headers = {"User-Agent": "phishshield-classifier-training"}

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()

        with gzip.GzipFile(fileobj=io.BytesIO(content)) as gz:
            df_phish = pd.read_csv(gz)
            
        urls = df_phish['url'].dropna().drop_duplicates().sample(n=min(sample_size, len(df_phish)), random_state=42).tolist()
        print(f"Successfully retrieved {len(urls)} live phishing samples from PhishTank.")
        return pd.DataFrame({'url': urls, 'label': 1})
    except Exception as e:
        print(f"Warning: Could not fetch live PhishTank feed ({e}).")
        return pd.DataFrame(columns=['url', 'label'])


def generate_benign_urls(sample_size: int = 2000) -> pd.DataFrame:
    """
    Generates structured benign URLs from trusted domains to balance the dataset.
    """
    legit_domains = [
        "www.google.com", "www.microsoft.com", "www.apple.com", "www.amazon.com",
        "www.wikipedia.org", "www.mozilla.org", "www.python.org", "www.github.com",
        "www.kaggle.com", "www.linkedin.com", "www.ibm.com", "www.oracle.com",
        "www.adobe.com", "www.cisco.com", "www.intel.com", "www.nvidia.com",
        "www.samsung.com", "www.sony.com", "www.netflix.com", "www.spotify.com",
        "www.reddit.com", "www.stackoverflow.com", "www.bbc.com", "www.cnn.com",
        "www.nasa.gov", "www.nih.gov", "www.who.int", "www.un.org",
        "www.gov.uk", "www.usa.gov", "www.canada.ca", "www.australia.gov.au",
        "www.kenya.go.ke", "www.jumia.co.ke", "www.safaricom.co.ke",
        "www.kcbgroup.com", "www.co-opbank.co.ke", "dekut.ac.ke"
    ]
    legit_paths = ["about", "products", "services", "news", "support", "docs", "learn", "search", "api", "blog"]

    urls = []
    for i in range(1, sample_size + 1):
        domain = legit_domains[(i - 1) % len(legit_domains)]
        path = legit_paths[(i - 1) % len(legit_paths)]
        page_num = ((i - 1) // len(legit_paths)) + 1
        urls.append(f"https://{domain}/{path}/item-{page_num}?ref=verified_{i}")

    return pd.DataFrame({'url': urls, 'label': 0})


def load_dataset(csv_filepath: str = "url_dataset_4000.csv", target_total: int = 4000) -> pd.DataFrame:
    """
    Loads data from local CSV or combines live PhishTank feeds with generated benign data.
    """
    if os.path.exists(csv_filepath):
        print(f"Loading local dataset from {csv_filepath}...")
        df = pd.read_csv(csv_filepath)
        df = df[['url', 'label']].dropna().drop_duplicates()
        
        target_per_class = target_total // 2
        df_benign = df[df['label'] == 0].sample(n=min(target_per_class, sum(df['label'] == 0)), random_state=42)
        df_phish = df[df['label'] == 1].sample(n=min(target_per_class, sum(df['label'] == 1)), random_state=42)
        
        return pd.concat([df_benign, df_phish]).sample(frac=1, random_state=42).reset_index(drop=True)

    print(f"Local file '{csv_filepath}' not found. Creating balanced dataset using PhishTank + Benign domains...")
    df_phish = fetch_phishtank_feed(sample_size=target_total // 2)
    df_benign = generate_benign_urls(sample_size=len(df_phish) if not df_phish.empty else target_total // 2)

    df_combined = pd.concat([df_phish, df_benign], ignore_index=True)
    return df_combined.sample(frac=1, random_state=42).reset_index(drop=True)


def train():
    csv_name = "url_dataset_4000.csv"
    df = load_dataset(csv_filepath=csv_name, target_total=4000)

    print(f"\nTotal dataset shape: {df.shape} (Benign: {sum(df['label'] == 0)}, Malicious: {sum(df['label'] == 1)})")

    print("Extracting heuristic features across all URLs...")
    X = [extract_features(u) for u in df['url']]
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training Random Forest Classifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("\n--- Model Evaluation Report ---")
    print(classification_report(y_test, y_pred, target_names=['Legitimate (0)', 'Malicious (1)']))

    model_filename = 'url_classifier.pkl'
    joblib.dump(clf, model_filename)
    print(f"Model trained and saved successfully as '{model_filename}'.")


if __name__ == '__main__':
    train()