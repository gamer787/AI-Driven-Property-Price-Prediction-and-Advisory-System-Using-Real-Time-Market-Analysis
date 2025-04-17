import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# Predefined data for property price prediction
# Features: [area_sqft, location_score, property_type_score, infrastructure_score, age_years]
X = np.array([
    [1200, 0.9, 0.8, 0.85, 1],  # Gachibowli 2BHK
    [2200, 0.95, 0.9, 0.95, 0], # Jubilee Hills 3BHK
    [3000, 0.9, 0.7, 0.9, 0],   # Banjara Hills 4BHK
    [650, 0.85, 0.85, 0.8, 1],  # Madhapur 1BHK
    [1800, 0.8, 0.8, 0.75, 0],  # Kondapur 3BHK
    [1150, 0.75, 0.7, 0.7, 1],  # Kukatpally 2BHK
    # Additional synthetic data
    [1300, 0.92, 0.85, 0.88, 2],
    [1600, 0.88, 0.75, 0.82, 1],
    [1400, 0.86, 0.82, 0.84, 3],
    [2000, 0.93, 0.88, 0.92, 0]
])

# Price in lakhs
y = np.array([45, 85, 120, 35, 65, 42, 48, 55, 50, 78])

def run_random_forest():
    print("\n=== Random Forest Regression Analysis ===")
    print("Analyzing property price predictions with advanced features\n")

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    # Train the model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Make predictions
    y_pred = model.predict(X_test)

    # Calculate metrics
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    # Print results
    print("Model Performance:")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.2f}")

    # Feature importance analysis
    features = ['Area (sqft)', 'Location Score', 'Property Type Score', 
                'Infrastructure Score', 'Age (years)']
    importance = model.feature_importances_
    
    print("\nFeature Importance:")
    for feature, imp in zip(features, importance):
        print(f"{feature}: {imp:.3f}")

    # Example prediction
    example = np.array([[1500, 0.88, 0.82, 0.83, 1]])
    prediction = model.predict(example)
    
    print("\nExample Prediction:")
    print("Property Features:")
    print(f"- Area: 1500 sqft")
    print(f"- Location Score: 0.88")
    print(f"- Property Type Score: 0.82")
    print(f"- Infrastructure Score: 0.83")
    print(f"- Age: 1 year")
    print(f"Predicted Price: {prediction[0]:.2f} Lakhs")

    # Visualize feature importance
    plt.figure(figsize=(10, 6))
    importance_sorted = sorted(zip(importance, features), reverse=True)
    plt.bar(range(len(importance)), 
            [imp for imp, _ in importance_sorted],
            align='center')
    plt.xticks(range(len(importance)), 
               [feat for _, feat in importance_sorted], 
               rotation=45)
    plt.title('Feature Importance in Random Forest Model')
    plt.xlabel('Features')
    plt.ylabel('Importance Score')
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    run_random_forest()