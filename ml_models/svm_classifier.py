import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Predefined data for property price trend classification
# Features: [location_score, property_type_score, area_sqft, price_lakhs, infrastructure_score]
X = np.array([
    [0.9, 0.8, 1200, 45, 0.85],  # Gachibowli 2BHK
    [0.95, 0.9, 2200, 85, 0.95], # Jubilee Hills 3BHK
    [0.9, 0.7, 3000, 120, 0.9],  # Banjara Hills 4BHK
    [0.85, 0.85, 650, 35, 0.8],  # Madhapur 1BHK
    [0.8, 0.8, 1800, 65, 0.75],  # Kondapur 3BHK
    [0.75, 0.7, 1150, 42, 0.7],  # Kukatpally 2BHK
    # Additional synthetic data
    [0.92, 0.85, 1300, 48, 0.88],
    [0.88, 0.75, 1600, 55, 0.82],
    [0.86, 0.82, 1400, 50, 0.84],
    [0.93, 0.88, 2000, 78, 0.92]
])

# Labels: 1 for "Buy Now", 0 for "Wait"
y = np.array([1, 1, 0, 1, 1, 0, 1, 0, 1, 1])

def run_svm_analysis():
    print("\n=== SVM Classifier Analysis ===")
    print("Analyzing property investment decisions using SVM\n")

    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.3, random_state=42
    )

    # Train SVM model
    svm = SVC(kernel='rbf', C=1.0)
    svm.fit(X_train, y_train)

    # Make predictions
    y_pred = svm.predict(X_test)

    # Print results
    print("Model Performance:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, 
                              target_names=['Wait', 'Buy Now']))

    # Example prediction
    example = np.array([[0.88, 0.82, 1500, 52, 0.83]])
    example_scaled = scaler.transform(example)
    prediction = svm.predict(example_scaled)
    
    print("\nExample Prediction:")
    print("Property Features:")
    print(f"- Location Score: 0.88")
    print(f"- Property Type Score: 0.82")
    print(f"- Area: 1500 sqft")
    print(f"- Price: 52 Lakhs")
    print(f"- Infrastructure Score: 0.83")
    print(f"Recommendation: {'Buy Now' if prediction[0] == 1 else 'Wait'}")

if __name__ == "__main__":
    run_svm_analysis()