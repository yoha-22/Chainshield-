"""
ChainShield - Model Training Script
------------------------------------
Trains an XGBoost classifier on the credit card fraud dataset
and saves the trained model to disk for use by app.py

Dataset: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
Place 'creditcard.csv' inside the data/ folder before running this.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import os

DATA_PATH = "data/creditcard.csv"
MODEL_OUTPUT_PATH = "model/xgboost_fraud_model.pkl"


def load_data(path):
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Dataset not found at {path}. "
            "Download it from Kaggle and place it in ml-service/data/"
        )
    df = pd.read_csv(path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def train_model(df):
    # 'Class' column: 0 = normal, 1 = fraud (standard for this dataset)
    X = df.drop("Class", axis=1)
    y = df["Class"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # scale_pos_weight handles class imbalance (fraud cases are rare)
    fraud_ratio = (y_train == 0).sum() / (y_train == 1).sum()

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=fraud_ratio,
        eval_metric="logloss",
        use_label_encoder=False,
        random_state=42,
    )

    print("Training XGBoost model...")
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n--- Evaluation ---")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
    print("ROC-AUC Score:", roc_auc_score(y_test, y_proba))

    return model, X_train


def save_model(model, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(model, path)
    print(f"\nModel saved to {path}")


if __name__ == "__main__":
    df = load_data(DATA_PATH)
    model, X_train = train_model(df)
    save_model(model, MODEL_OUTPUT_PATH)

    # Save feature column order — needed later for consistent prediction input
    joblib.dump(list(X_train.columns), "model/feature_columns.pkl")
    print("Feature columns saved.")
