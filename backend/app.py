from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS  # CORS for handling Cross-Origin Resource Sharing
import joblib
import logging

# Create a Flask application instance
app = Flask(__name__)

# Enable CORS for all routes, allowing requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Load the model
model = joblib.load('best_car_price_model.pkl')

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Function to preprocess input data
def preprocess_input(data):
    current_year = 2020  # As per the dataset max year
    data['year'] = data['year'].astype(int)  # Convert year to integer
    data['car_age'] = current_year - data['year']
    data['brand'] = data['name'].apply(lambda x: x.split()[0])
    data['brand_value'] = 500000  # This should ideally be replaced with actual mapping
    data['is_premium'] = 0
    data['is_power_brand'] = 0
    data['transmission_efficiency'] = data['transmission'].apply(lambda x: 1.0 if x == 'Manual' else 0.8)
    features = data.drop(['name', 'brand'], axis=1)
    return features

# Define a route for making predictions
@app.route('/predict', methods=['POST'])
def predict():
    try:
        logging.debug("Received request: %s", request.get_json())
        data = request.get_json()
        query_df = pd.DataFrame([data])
        preprocessed_data = preprocess_input(query_df)
        prediction = model.predict(preprocessed_data)
        logging.debug("Prediction: %s", prediction)
        return jsonify({'Prediction': prediction.tolist()})
    except Exception as e:
        logging.error("Error during prediction: %s", str(e))
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)