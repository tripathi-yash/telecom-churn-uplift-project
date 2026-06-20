'''
    Churn prediction identifies customers at risk.

    Uplift modeling identifies customers whose behavior can be changed through intervention.

    A customer can have moderate churn risk but be highly responsive to an offer.

    Targeting those customers maximizes retention ROI.
'''

print(__doc__)

import pandas as pd
from xgboost import XGBClassifier
import numpy as np
from flask import Flask, render_template, redirect, url_for, request, flash, jsonify, session
import joblib
import shap
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
    
# SQLite database file
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///reviews.db"

# Disable warning
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

preprocessor = joblib.load("./models/preprocessor.pkl")
churn_model = joblib.load("./models/churn_model.pkl")
treatment_model = joblib.load("./models/treatment_model.pkl")
control_model = joblib.load("./models/control_model.pkl")

# SHAP Explainer for churn model
churn_explainer = shap.TreeExplainer(churn_model)

class Review(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    review_text = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=['POST'])
def predict():
    data = request.get_json()
    print(data)
    gender = data['gender']
    senior_citizen = data['seniorCitizen']
    partner = data['partner']
    dependents = data['dependents']
    tenure_Months = int(data['tenureMonths'])
    phone_Service = data['phoneService']
    multiple_Lines = data['multipleLines']
    internet_Service = data['internetService']
    online_Security = data['onlineSecurity']
    online_Backup = data['onlineBackup']
    device_Protection = data['deviceProtection']
    tech_Support = data['techSupport']
    streaming_TV = data['streamingTV']
    streaming_Movies = data['streamingMovies']
    contract = data['contract']
    paperless_Billing = data['paperlessBilling']
    payment_Method	 = data['paymentMethod']
    monthly_Charges = float(data['monthlyCharges'])
    cltv = float(data['CLTV']) 	

    df = pd.DataFrame(
        {
        "Gender" : [gender],
        'Senior Citizen' : [senior_citizen],
        'Partner' : [partner],
        'Dependents' : [dependents],
        'Tenure Months' : [tenure_Months],
        'Phone Service' : [phone_Service],
        'Multiple Lines' : [multiple_Lines],
        'Internet Service' : [internet_Service],
        'Online Security' : [online_Security],
        'Online Backup' : [online_Backup],
        'Device Protection' : [device_Protection],
        'Tech Support' : [tech_Support],
        'Streaming TV' : [streaming_TV],
        'Streaming Movies' : [streaming_Movies],
        'Contract' : [contract],
        'Paperless Billing' : [paperless_Billing],
        'Payment Method' : [payment_Method],
        'Monthly Charges' : [monthly_Charges],
        'CLTV' : [cltv]
    })

    print(df.head())

    X_preprocessed = preprocessor.transform(df)

    print(df.head())
    print("Preprocessed shape:", X_preprocessed.shape)

    threshold = 0.7
    churn_prob = churn_model.predict_proba(X_preprocessed)[:,1]

    y_pred = (churn_prob>=threshold).astype(int)

    churn_label = "Likely to Leave" if y_pred[0] == 1 else "Likely to Stay"

    # =====================================================
    # SHAP EXPLANATION
    # =====================================================
    # Explains which features contributed most to churn
    # prediction for the current customer.

    # SHAP values for current customer
    shap_values = churn_explainer.shap_values(X_preprocessed)

    # Feature names from preprocessing pipeline
    feature_names = preprocessor.get_feature_names_out()
    

    # Create feature -> shap value mapping
    feature_importance = []

    for feature, value in zip(feature_names, shap_values[0]):
        feature_name = feature.replace("num__", "")
        feature_name = feature_name.replace("cat__", "")
        feature_name = feature_name.replace("_", " ")
        feature_importance.append({
            "feature": feature_name,
            "impact": float(value)
        })

    # Sort by strongest absolute contribution
    feature_importance = sorted(
        feature_importance,
        key=lambda x: abs(x["impact"]),
        reverse=True
    )

    # Keep top 5 most influential features
    top_features = feature_importance[:5]

    # =====================================================

    if(y_pred[0] == 1):
        print("Likely to Leave 🚨")
    else:
        print("Likely to Stay 😊")
        

    X_uplift = np.hstack(
        [
            X_preprocessed,
            churn_prob.reshape(-1,1)
        ]
    )

    print("Uplift shape:", X_uplift.shape)
    treat_prob = treatment_model.predict_proba(X_uplift)[:,1]

    control_prob = control_model.predict_proba(X_uplift)[:,1]

    uplift_score = (control_prob - treat_prob)[0]

    print("Churn probability:", churn_prob[0])
    print("Treatment probability:", treat_prob[0])
    print("Control probability:", control_prob[0])
    print("Uplift score:", uplift_score)


    recommendation = "No offer"

    UPLIFT_THRESHOLD = 0.2

    if uplift_score > UPLIFT_THRESHOLD:
        recommendation = "Retention Offer Needed"
    else:
        recommendation = "No Retention Offer Needed"
        
    print(f'Business Decision based on {uplift_score} is {recommendation}')

    return jsonify({
        "churn_label" : churn_label,
        "churn_prob" : float(churn_prob[0]),
        "offer" : recommendation,
        "uplift_score" : float(uplift_score),
        "top_features" : top_features
    })

# save reviews 
@app.route("/add-review", methods=["POST"])
def add_review():

    data = request.get_json()

    review = Review(
        name=data["name"],
        review_text=data["review"]
    )

    db.session.add(review)

    db.session.commit()

    return jsonify({
        "message": "Review saved"
    })

# fetch reviews
@app.route("/reviews")
def get_reviews():

    reviews = Review.query.order_by(
        Review.created_at.desc()
    ).all()

    return jsonify([
        {
            "name": r.name,
            "review": r.review_text,
            "created_at": r.created_at.strftime("%d-%m-%Y")
        }
        for r in reviews
    ])

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    # app.run(host='0.0.0.0', port='5001')
    app.run()










