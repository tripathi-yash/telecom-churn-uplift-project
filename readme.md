# Telecom Churn Prediction & Uplift Modeling

## Overview

This project combines **Customer Churn Prediction** and **Uplift Modeling** to identify customers who are likely to leave and determine whether a retention campaign is likely to influence their behavior.

Unlike traditional churn prediction systems, this application helps businesses focus retention efforts on customers who are both at risk and responsive to intervention, improving retention ROI.

---

## Features

* Customer Churn Prediction using XGBoost
* Uplift Modeling for retention campaign targeting
* SHAP-based model explainability
* Interactive web interface built with Flask
* Dark/Light mode support
* Customer review system with SQLite persistence
* Responsive modern UI
* Real-time predictions through AJAX requests

---

## Tech Stack

### Machine Learning

* Python
* XGBoost
* Scikit-Learn
* SHAP

### Backend

* Flask
* Flask-SQLAlchemy
* SQLite

### Frontend

* HTML5
* CSS3
* JavaScript

---

## Project Structure

```text
telecom_churn_upliftModel_proj/
│
├── app.py
├── requirements.txt
├── models/
│   ├── churn_model.pkl
│   ├── control_model.pkl
│   ├── treatment_model.pkl
│   └── preprocessor.pkl
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   ├── script.js
│   └── images/
│
└── reviews.db
```

## Business Problem

Customer churn prediction identifies customers at risk of leaving.

However, not every customer can be retained through marketing interventions.

This project uses uplift modeling to estimate the incremental effect of a retention offer and helps answer:

* Who is likely to churn?
* Who is likely to respond to an offer?
* Which customers should be targeted?

---

## Model Outputs

### Churn Analysis

* Customer Status
* Churn Probability

### Retention Analysis

* Uplift Score
* Retention Recommendation

### Explainability

Top contributing features are displayed using SHAP values to provide transparent model predictions.

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd telecom_churn_upliftModel_proj
```

Create a virtual environment:

```bash
python -m venv myvenv
```

Activate the environment:

```bash
myvenv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the application:

```bash
python app.py
```

Open:

```text
http://localhost:5001
```

---

## Future Improvements

* PostgreSQL / Neon database integration
* Cloud deployment (Render + Vercel)
* User authentication
* Review moderation
* Automated retention strategy recommendations
* Model monitoring and retraining pipeline

---

## Author

Yash

Machine Learning | Data Science | Full Stack Development
