from feature_extraction import extract_features, get_feature_names


test_urls = [
    "https://www.google.com",
    "https://www.paypal.com/login",
    "http://192.168.1.100/login",
    "http://secure-login-verify-account.com/update",
]


feature_names = get_feature_names()


for url in test_urls:

    features = extract_features(url)

    print("\nURL:")
    print(url)

    print("\nFeatures:")

    for name, value in zip(feature_names, features):
        print(f"{name}: {value}")

    print("-" * 60)