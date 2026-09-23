"""
ChainShield - ML Prediction API
--------------------------------
Flask microservice that:
1. Loads the trained XGBoost model
2. Accepts transaction data via POST /predict
3. Returns fraud probability + SHAP explanation (why it's fraud)

Run with: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import shap
import os

app = Flask(__name__)
CORS(app)  # allow requests from Node.js backend / React dev server

MODEL_PATH = "model/xgboost_fraud_model.pkl"
FEATURES_PATH = "model/feature_columns.pkl"

model = None
feature_columns = None
explainer = None


def load_artifacts():
    global model, feature_columns, explainer
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Model not found. Run train_model.py first to train and save the model."
        )
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    explainer = shap.TreeExplainer(model)
    print("Model, feature columns, and SHAP explainer loaded successfully.")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects JSON body with all feature values matching feature_columns.
    Example:
    {
      "Time": 0, "V1": -1.35, "V2": -0.07, ..., "Amount": 149.62
    }
    """
    try:
        data = request.get_json()

        # Build feature vector in the correct column order
        input_vector = np.array([[data.get(col, 0) for col in feature_columns]])

        # Prediction
        fraud_proba = float(model.predict_proba(input_vector)[0][1])
        is_fraud = bool(fraud_proba >= 0.5)

        # SHAP explanation — top contributing features
        shap_values = explainer.shap_values(input_vector)
        contributions = list(zip(feature_columns, shap_values[0]))
        contributions.sort(key=lambda x: abs(x[1]), reverse=True)
        top_reasons = [
            {"feature": feat, "impact": round(float(val), 4)}
            for feat, val in contributions[:5]
        ]

        return jsonify({
            "fraud_score": round(fraud_proba, 4),
            "is_fraud": is_fraud,
            "top_reasons": top_reasons
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    load_artifacts()
    app.run(host="0.0.0.0", port=5000, debug=True)
