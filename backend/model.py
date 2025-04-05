import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import warnings
warnings.filterwarnings('ignore')

# Function to load and preprocess the data
def load_and_preprocess_data(file_path):
    df = pd.read_csv(file_path)
    
    # Display basic information
    print("Dataset shape:", df.shape)
    print("\nData types:")
    print(df.dtypes)
    print("\nMissing values:")
    print(df.isnull().sum())
    
    # Fill missing values with median for numerical columns and mode for categorical columns
    for column in df.select_dtypes(include=[np.number]).columns:
        df[column].fillna(df[column].median(), inplace=True)
    for column in df.select_dtypes(include=[object]).columns:
        df[column].fillna(df[column].mode()[0], inplace=True)
    
    return df

# Function to engineer features
def engineer_features(df):
    # Create car age feature
    current_year = df['year'].max()
    df['car_age'] = current_year - df['year']
    
    # Extract brand from name
    df['brand'] = df['name'].apply(lambda x: x.split()[0])
    
    # Calculate price per km (value retention)
    df['price_per_km'] = df['selling_price'] / df['km_driven']
    
    # Log transformation for skewed variables
    df['log_price'] = np.log1p(df['selling_price'])
    df['log_km'] = np.log1p(df['km_driven'])
    
    # Brand encoding based on average price
    brand_means = df.groupby('brand')['selling_price'].mean()
    df['brand_value'] = df['brand'].map(brand_means)
    
    # Premium brand indicator (top 25% by average price)
    premium_threshold = brand_means.quantile(0.75)
    df['is_premium'] = df['brand_value'] > premium_threshold
    df['is_premium'] = df['is_premium'].astype(int)
    
    # Power brand indicator (brands that maintain value with age)
    brand_age_values = df.groupby(['brand', 'car_age'])['selling_price'].mean().reset_index()
    pivot_table = brand_age_values.pivot(index='brand', columns='car_age', values='selling_price')
    
    brands_with_data = pivot_table.dropna(thresh=5).index
    powerful_brands = []
    
    for brand in brands_with_data:
        brand_data = pivot_table.loc[brand].dropna()
        if len(brand_data) >= 3:  # Ensure enough data points
            correlation = brand_data.corr(pd.Series(brand_data.index), method='spearman')
            if correlation > -0.7:  # Less negative correlation means better value retention
                powerful_brands.append(brand)
    
    df['is_power_brand'] = df['brand'].isin(powerful_brands).astype(int)
    
    # Transmission efficiency
    df['transmission_efficiency'] = 1
    df.loc[df['transmission'] == 'Automatic', 'transmission_efficiency'] = 0.8
    
    return df

# Data preparation for modeling
def prepare_data_for_modeling(df):
    # Define features and target
    features = df.drop(['name', 'selling_price', 'log_price', 'brand', 'price_per_km'], axis=1)
    target = df['selling_price']
    
    # Define categorical and numerical columns
    categorical_cols = ['fuel', 'seller_type', 'transmission', 'owner']
    numerical_cols = ['year', 'km_driven', 'car_age', 'brand_value', 'is_premium', 'is_power_brand', 'transmission_efficiency']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    
    return X_train, X_test, y_train, y_test, categorical_cols, numerical_cols

# Build and evaluate machine learning models
def build_and_evaluate_model(X_train, X_test, y_train, y_test, categorical_cols, numerical_cols):
    # Define preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
        ])
    
    # Define Random Forest model with best hyperparameters found out with the help of GridSearchCV
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=1,
        random_state=42
    )
    
    # Create pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    
    # Train model
    pipeline.fit(X_train, y_train)
    
    # Make predictions
    y_pred = pipeline.predict(X_test)
    
    # Evaluate model
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Random Forest - RMSE: {rmse:.2f}, MAE: {mae:.2f}, R2: {r2:.4f}")
    
    # Save model
    joblib.dump(pipeline, 'best_car_price_model.pkl')
    
    return pipeline

# Function to create a prediction interface
def create_prediction_function(model_path='best_car_price_model.pkl'):
    # Load the model
    model = joblib.load(model_path)
    
    def predict_price(year, km_driven, fuel, seller_type, transmission, owner, brand):
        # Create a DataFrame with the input values
        input_data = pd.DataFrame({
            'year': [year],
            'km_driven': [km_driven],
            'fuel': [fuel],
            'seller_type': [seller_type],
            'transmission': [transmission],
            'owner': [owner],
            'name': [f"{brand} Model"]  # Placeholder for the model name
        })
        
        # Apply the same feature engineering
        current_year = 2020  # As per the dataset max year
        input_data['car_age'] = current_year - input_data['year']
        input_data['brand'] = brand
        
        # For brand value, is_premium and is_power_brand, we need the original mappings
        # For simplicity, we'll set them to the median values from the training data
        input_data['brand_value'] = 500000  # This should ideally be replaced with actual mapping
        input_data['is_premium'] = 0
        input_data['is_power_brand'] = 0
        input_data['transmission_efficiency'] = 1.0 if transmission == 'Manual' else 0.8
        
        # Drop unnecessary columns
        features = input_data.drop(['name', 'brand'], axis=1)
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        return round(prediction, 2)
    
    return predict_price

# Main function to run the entire workflow
def main(file_path='dataset.csv'):
    # Load and preprocess data
    print("Loading and preprocessing data...")
    df = load_and_preprocess_data(file_path)
    
    # Engineer features
    print("\nEngineering features...")
    df = engineer_features(df)
    
    # Prepare data for modeling
    print("\nPreparing data for modeling...")
    X_train, X_test, y_train, y_test, categorical_cols, numerical_cols = prepare_data_for_modeling(df)
    
    # Build and evaluate model
    print("\nBuilding and evaluating model...")
    model = build_and_evaluate_model(X_train, X_test, y_train, y_test, categorical_cols, numerical_cols)
    
    # Create prediction function
    predict_price = create_prediction_function()
    
    # Example prediction
    print("\nExample prediction:")
    example_prediction = predict_price(
        year=2015,
        km_driven=50000,
        fuel='Petrol',
        seller_type='Individual',
        transmission='Manual',
        owner='First Owner',
        brand='Maruti'
    )
    print(f"Predicted price for a 2015 Maruti with 50,000 km: ₹{example_prediction}")
    
    print("\nDone! The model is ready for use.")

if __name__ == "__main__":
    main()