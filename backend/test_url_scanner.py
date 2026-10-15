
from scanner.ml_model.predict import analyze_url_heuristics

test_urls = [
    "https://github.com/",
    "https://www.wikipedia.org/",
    "https://www.python.org/",
    "http://example.com/",
    "https://paypal-login-verify-account.example/",
    "http://192.0.2.1/login/",
    "https://account-security-verify.example/login",
]

print("\nPHISHSHIELD URL SCANNER TEST")
print("=" * 65)

for url in test_urls:
    try:
        result = analyze_url_heuristics(url)

        print("\nURL:", result["url"])
        print("Result:", result["prediction"])
        print(
            "Raw model risk:",
            str(result["model_phishing_probability"]) + "%"
        )
        print(
            "Displayed risk:",
            str(result["phishing_probability"]) + "%"
        )
        print("Clues:", result["detected_clues"])
        print("-" * 65)

    except Exception as error:
        print("\nURL:", url)
        print("ERROR:", error)
        print("-" * 65)