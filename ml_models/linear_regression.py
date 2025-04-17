import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# Predefined data for property price prediction
# Features: [area_sqft, location_score, property_type_score, infrastructure_score]
X = np.array([
    [1200, 0.9, 0.8, 0.85],  # Gachibowli 2BHK
    [2200, 0.95, 0.9, 0.95], # Jubilee Hills 3BHK
    [3000, 0.9, 0.7, 0.9],   # Banjara Hills 4BHK
    [650, 0.85, 0.85, 0.8],  # Madhapur 1BHK
    [1800, 0.8, 0.8, 0.75],  # Kondapur 3BHK
    [1150, 0.75, 0.7, 0.7],  # Kukatpally 2BHK
    # Additional synthetic data
    [1300, 0.92, 0.85, 0.88],
    [1600, 0.88, 0.75, 0.82],
    [1400, 0.86, 0.82, 0.84],
    [2000, 0.93, 0.88, 0.92]
])

# Price in lakhs
y = np.array([45, 85, 120, 35, 65, 42, 48, 55, 50, 78])

def run_linear_regression():
    print("\n=== Linear Regression Analysis ===")
    print("Analyzing property price predictions\n")

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    # Train the model
    model = LinearRegression()
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

    # Print feature importance
    features = ['Area (sqft)', 'Location Score', 'Property Type Score', 'Infrastructure Score']
    print("\nFeature Coefficients:")
    for feature, coef in zip(features, model.coef_):
        print(f"{feature}: {coef:.2f}")

    # Example prediction
    example = np.array([[1500, 0.88, 0.82, 0.83]])
    prediction = model.predict(example)
    
    print("\nExample Prediction:")
    print("Property Features:")
    print(f"- Area: 1500 sqft")
    print(f"- Location Score: 0.88")
    print(f"- Property Type Score: 0.82")
    print(f"- Infrastructure Score: 0.83")
    print(f"Predicted Price: {prediction[0]:.2f} Lakhs")

    # Visualize actual vs predicted prices
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred, color='blue', label='Predictions')
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 
             'r--', label='Perfect Prediction')
    plt.xlabel('Actual Price (Lakhs)')
    plt.ylabel('Predicted Price (Lakhs)')
    plt.title('Actual vs Predicted Property Prices')
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    run_linear_regression()