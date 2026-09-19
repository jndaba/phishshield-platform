import os
import re
import random
import joblib
import numpy as np
import pandas as pd
from urllib.parse import urlparse
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Ensures url_classifier.pkl is saved directly into backend/scanner/ml_model/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_OUTPUT_PATH = os.path.join(BASE_DIR, 'url_classifier.pkl')


def extract_features(url: str) -> list:
    """
    Extract structural, lexical, and security heuristic features from a raw URL.
    Returns 12 numerical features matching the model schema.
    """
    if not isinstance(url, str) or not url.strip():
        return [0] * 12

    url = url.strip()

    # 1. Total URL length
    url_length = len(url)

    # 2. Presence of IP address in host
    ip_pattern = r'(([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\/)|' \
                 r'((0x[0-9a-fA-F]{1,2})\.(0x[0-9a-fA-F]{1,2})\.(0x[0-9a-fA-F]{1,2})\.(0x[0-9a-fA-F]{1,2})\/)'
    has_ip = 1 if re.search(ip_pattern, url) else 0

    # 3. Protocol presence (HTTPS vs HTTP)
    is_https = 1 if url.startswith('https://') else 0

    # Parse URL components
    try:
        parsed = urlparse(url if '://' in url else f'http://{url}')
        domain = parsed.netloc or parsed.path.split('/')[0]
        path = parsed.path
    except Exception:
        domain = url
        path = ""

    # 4. Domain length
    domain_length = len(domain)

    # 5. Number of subdomains / dots in host
    dot_count = domain.count('.')

    # 6. Hyphen count in hostname
    hyphen_count = domain.count('-')

    # 7. Presence of '@' symbol
    has_at_symbol = 1 if '@' in url else 0

    # 8. Double slash '//' redirection check in path
    has_double_slash = 1 if '//' in path else 0

    # 9. Sensitive financial & credential keywords
    suspicious_keywords = [
        'login', 'verify', 'update', 'banking', 'secure', 'account',
        'signin', 'support', 'mpesa', 'safaricom', 'password', 'webscr',
        'checkpoint', 'wallet', 'recovery', 'auth', 'suspended', 'portal'
    ]
    keyword_count = sum(1 for kw in suspicious_keywords if kw in url.lower())

    # 10. URL shortening services
    shortener_patterns = r'bit\.ly|goo\.gl|tinyurl|t\.co|ow\.ly|is\.gd|buff\.ly|adf\.ly'
    is_shortened = 1 if re.search(shortener_patterns, domain.lower()) else 0

    # 11. Count of query parameters and special characters
    special_char_count = sum(url.count(c) for c in ['?', '=', '&', '%', '_'])

    # 12. Ratio of digits to characters
    digit_count = sum(c.isdigit() for c in url)
    digit_ratio = round(digit_count / url_length, 4) if url_length > 0 else 0

    return [
        url_length,
        has_ip,
        is_https,
        domain_length,
        dot_count,
        hyphen_count,
        has_at_symbol,
        has_double_slash,
        keyword_count,
        is_shortened,
        special_char_count,
        digit_ratio
    ]


def generate_large_corpus(target_count=2400) -> pd.DataFrame:
    """
    Generates 2,400+ distinct, realistic URLs (50% phishing, 50% benign)
    covering enterprise, banking, cloud, university, and telecom vectors.
    """
    random.seed(42)
    np.random.seed(42)

    # --- Target Brands & Entities for Phishing ---
    brands = [
        "paypal", "safaricom-mpesa", "netflix", "appleid", "microsoft-office",
        "chase-online", "wellsfargo", "google-drive", "amazon-security",
        "equity-bank", "kcb-online", "co-opbank", "binance-verify", "meta-security",
        "university-portal", "dhl-tracking", "posta-kenya", "kra-portal"
    ]
    tlds_phish = [".xyz", ".top", ".info", ".club", ".vip", ".cc", ".link", ".tk", ".cf", ".work", ".online"]
    actions = [
        "login", "signin", "verify-account", "update-passcode", "billing-resolve",
        "security-checkpoint", "reversal-claim", "confirm-identity", "unlock", "webscr"
    ]
    ip_prefixes = ["192.168.1.", "10.0.0.", "172.16.254.", "104.21.55.", "185.199.110."]

    # --- Genuine Domain Patterns for Benign ---
    benign_domains = [
        "google.com", "github.com", "wikipedia.org", "stackoverflow.com", "amazon.com",
        "djangoproject.com", "react.dev", "safaricom.co.ke", "dkut.ac.ke", "tailwindcss.com",
        "pypi.org", "microsoft.com", "developer.mozilla.org", "linkedin.com", "ycombinator.com",
        "nytimes.com", "bbc.com", "kaggle.com", "medium.com", "cloudflare.com", "docker.com",
        "digitalocean.com", "gitlab.com", "scikit-learn.org", "postgresql.org", "apple.com"
    ]
    benign_subpaths = [
        "docs/en/latest", "questions/tagged/python", "profile/settings", "reference/hooks",
        "articles/archive/2026", "explore/topics", "api/v1/resource", "download/release",
        "dashboard/overview", "search?q=cybersecurity", "community/forum"
    ]

    urls = set()
    labels = []

    half_target = target_count // 2

    # 1. Synthesize 1200+ Phishing URLs
    phish_count = 0
    while phish_count < half_target:
        brand = random.choice(brands)
        action = random.choice(actions)
        proto = "http://" if random.random() < 0.85 else "https://"

        variant = random.randint(1, 5)
        if variant == 1:
            tld = random.choice(tlds_phish)
            u = f"{proto}{brand}-{action}{tld}/auth?user_id={random.randint(10000, 99999)}"
        elif variant == 2:
            ip = f"{random.choice(ip_prefixes)}{random.randint(2, 254)}"
            u = f"{proto}{ip}/{brand}/login.php?ref=security_alert"
        elif variant == 3:
            tld = random.choice(tlds_phish)
            u = f"{proto}secure.{brand}.account-update.service{tld}/index.html"
        elif variant == 4:
            shortener = random.choice(["bit.ly", "tinyurl.com", "is.gd", "t.co"])
            u = f"http://{shortener}/{brand}-{action[:4]}-{random.randint(100, 999)}"
        else:
            tld = random.choice(tlds_phish)
            token = f"{random.randint(1000, 9999)}x{random.randint(10000, 99999)}"
            u = f"{proto}{brand}.portal{tld}/{action}?session_token={token}&client=auth"

        if u not in urls:
            urls.add(u)
            labels.append(1)
            phish_count += 1

    # 2. Synthesize 1200+ Legitimate URLs
    legit_count = 0
    while legit_count < half_target:
        domain = random.choice(benign_domains)
        proto = "https://" if random.random() < 0.96 else "http://"
        path = random.choice(benign_subpaths)

        var_choice = random.randint(1, 3)
        if var_choice == 1:
            u = f"{proto}{domain}/{path}"
        elif var_choice == 2:
            u = f"{proto}{domain}/{path}?page={random.randint(1, 20)}&sort=recent"
        else:
            u = f"{proto}www.{domain}/{path.split('/')[0]}"

        if u not in urls:
            urls.add(u)
            labels.append(0)
            legit_count += 1

    url_list = list(urls)
    return pd.DataFrame({"url": url_list, "label": labels})


def load_data() -> pd.DataFrame:
    """
    Attempts to read an external phishing CSV if available in scanner/ml_model.
    Otherwise builds a verified corpus of 2,400+ URLs.
    """
    csv_candidates = ['dataset.csv', 'phishing_urls.csv', 'phishtank.csv']
    for candidate in csv_candidates:
        candidate_path = os.path.join(BASE_DIR, candidate)
        if os.path.exists(candidate_path):
            print(f"[*] Found external dataset at {candidate_path}. Loading...")
            try:
                df = pd.read_csv(candidate_path)
                df.columns = [col.strip().lower() for col in df.columns]
                url_col = next((c for c in df.columns if 'url' in c), None)
                label_col = next((c for c in df.columns if 'label' in c or 'target' in c or 'class' in c), None)

                if url_col and label_col:
                    df = df[[url_col, label_col]].dropna()
                    df.rename(columns={url_col: 'url', label_col: 'label'}, inplace=True)
                    if df['label'].dtype == object:
                        df['label'] = df['label'].apply(lambda x: 1 if str(x).lower() in ['bad', 'phishing', '1', 'yes'] else 0)
                    print(f"[*] Successfully loaded {len(df)} records from CSV.")
                    return df
            except Exception as e:
                print(f"[!] Warning reading CSV ({e}). Falling back to generator.")

    print("[*] Generating synthetic corpus with 2,400+ URLs (balanced)...")
    return generate_large_corpus(target_count=2400)


def train():
    print("=" * 64)
    print("  PhishShield Threat URL Scanner - Random Forest Trainer  ")
    print("=" * 64)

    df = load_data()
    print(f"[*] Total dataset size: {len(df)} URLs")
    print(f"[*] Class breakdown: {df['label'].value_counts().to_dict()} (0=Benign, 1=Phishing)")

    print("[*] Extracting 12 structural, lexical, and heuristic features...")
    X = [extract_features(u) for u in df['url']]
    y = df['label'].values

    feature_names = [
        "url_length", "has_ip", "is_https", "domain_length", "dot_count",
        "hyphen_count", "has_at_symbol", "has_double_slash", "keyword_count",
        "is_shortened", "special_char_count", "digit_ratio"
    ]

    X = np.array(X)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"[*] Training Random Forest Classifier on {len(X_train)} samples...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=16,
        min_samples_split=4,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[+] Model Evaluation on {len(X_test)} Test Samples:")
    print(f"    Accuracy: {accuracy * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

    # Package model bundle with extractor metadata
    bundle = {
        'model': clf,
        'features': feature_names,
        'extract_fn': extract_features
    }

    joblib.dump(bundle, MODEL_OUTPUT_PATH)
    print(f"[+] Successfully exported model artifact to:\n    {MODEL_OUTPUT_PATH}\n")


if __name__ == '__main__':
    train()