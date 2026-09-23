"""
ChainShield - Model Training Script (v2)
------------------------------------------
Matches the Kartik Shenoy "Credit Card Transactions Fraud Detection Dataset"
(fraudTrain.csv + fraudTest.csv), which already comes pre-split.

Target column: is_fraud (0 = normal, 1 = fraud)
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import os

TRAIN_PATH = "data/fraudTrain.csv"
TEST_PATH = "data/fraudTest.csv"
MODEL_OUTPUT_PATH = "model/xgboost_fraud_model.pkl"

FEATURE_COLUMNS = [
    "category", "amt", "gender", "city_pop",
    "job", "unix_time", "merch_lat", "merch_long", "lat", "long"
]
TARGET_COLUMN = "is_fraud"


def load_data():
    for path in (TRAIN_PATH, TEST_PATH):
        if not os.path.exists(path):
            raise FileNotFoundError(f"Dataset not found at {path}")
    train_df = pd.read_csv(TRAIN_PATH)
    test_df = pd.read_csv(TEST_PATH)
    print(f"Train set: {train_df.shape[0]} rows | Test set: {test_df.shape[0]} rows")
    return train_df, test_df


def preprocess(train_df, test_df):
    encoders = {}
    for col in ["category", "gender", "job"]:
        le = LabelEncoder()
        combined = pd.concat([train_df[col], test_df[col]], axis=0).astype(str)
        le.fit(combined)
        train_df[col] = le.transform(train_df[col].astype(str))
        test_df[col] = le.transform(test_df[col].astype(str))
        encoders[col] = le

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]

    return X_train, y_train, X_test, y_test, encoders


def train_model(X_train, y_train):
    fraud_ratio = (y_train == 0).sum() / (y_train == 1).sum()

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=fraud_ratio,
        eval_metric="logloss",
        random_state=42,
    )
    print("Training XGBoost model...")
    model.fit(X_train, y_train)
    return model


def evaluate(model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n--- Evaluation ---")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
    print("ROC-AUC Score:", roc_auc_score(y_test, y_proba))


def save_artifacts(model, encoders):
    os.makedirs("model", exist_ok=True)
    joblib.dump(model, MODEL_OUTPUT_PATH)
    joblib.dump(FEATURE_COLUMNS, "model/feature_columns.pkl")
    joblib.dump(encoders, "model/label_encoders.pkl")
    print(f"\nModel saved to {MODEL_OUTPUT_PATH}")
    print("Feature columns and label encoders saved.")


if __name__ == "__main__":
    train_df, test_df = load_data()
    X_train, y_train, X_test, y_test, encoders = preprocess(train_df, test_df)
    model = train_model(X_train, y_train)
    evaluate(model, X_test, y_test)
    save_artifacts(model, encoders)