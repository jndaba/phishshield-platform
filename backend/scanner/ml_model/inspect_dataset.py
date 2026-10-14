import pandas as pd
import os

DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "dataset",
    "phishing_site_urls.csv"
)

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print("\nDataset loaded successfully!")

print("\nShape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())

print("\nData types:")
print(df.dtypes)

print("\nMissing values:")
print(df.isnull().sum())

print("\nLabel distribution:")
print(df.iloc[:, -1].value_counts())