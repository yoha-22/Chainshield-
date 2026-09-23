"""
ChainShield - ML Prediction API (v2)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import shap
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model/xgboost_fraud_model.pkl"
FEATURES_PATH = "model/feature_columns.pkl"
ENCODERS_PATH = "model/label_encoders.pkl"

model = None
feature_columns = None
encoders = None
explainer = None


def load_artifacts():
    global model, feature_columns, encoders, explainer
    for p in (MODEL_PATH, FEATURES_PATH, ENCODERS_PATH):
        if not os.path.exists(p):
            raise FileNotFoundError(f"{p} not found. Run train_model_v2.py first.")
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    encoders = joblib.load(ENCODERS_PATH)
    explainer = shap.TreeExplainer(model)
    print("Model, feature columns, encoders, and SHAP explainer loaded.")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        row = []
        for col in feature_columns:
            val = data.get(col, 0)
            if col in encoders:
                classes = list(encoders[col].classes_)
                val = encoders[col].transform([str(val)])[0] if str(val) in classes else 0
            row.append(val)

        input_vector = np.array([row], dtype=float)

        fraud_proba = float(model.predict_proba(input_vector)[0][1])
        is_fraud = bool(fraud_proba >= 0.5)

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