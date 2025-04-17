import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Predefined data for property segmentation
# Features: [price_lakhs, area_sqft, location_score, infrastructure_score]
X = np.array([
    [45, 1200, 0.9, 0.85],   # Gachibowli 2BHK
    [85, 2200, 0.95, 0.95],  # Jubilee Hills 3BHK
    [120, 3000, 0.9, 0.9],   # Banjara Hills 4BHK
    [35, 650, 0.85, 0.8],    # Madhapur 1BHK
    [65, 1800, 0.8, 0.75],   # Kondapur 3BHK
    [42, 1150, 0.75, 0.7],   # Kukatpally 2BHK
    # Additional synthetic data
    [48, 1300, 0.92, 0.88],
    [55, 1600, 0.88, 0.82],
    [50, 1400, 0.86, 0.84],
    [78, 2000, 0.93, 0.92]
])

def run_kmeans_analysis():
    print("\n=== K-means Clustering Analysis ===")
    print("Analyzing property market segments\n")

    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Perform k-means clustering
    n_clusters = 3
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(X_scaled)

    # Analyze clusters
    print("Cluster Analysis:")
    for i in range(n_clusters):
        cluster_points = X[clusters == i]
        print(f"\nCluster {i + 1}:")
        print(f"Number of properties: {len(cluster_points)}")
        print(f"Average price: {cluster_points[:, 0].mean():.2f} Lakhs")
        print(f"Average area: {cluster_points[:, 1].mean():.2f} sqft")
        print(f"Average location score: {cluster_points[:, 2].mean():.2f}")
        print(f"Average infrastructure score: {cluster_points[:, 3].mean():.2f}")

    # Visualize clusters (using price and area)
    plt.figure(figsize=(10, 6))
    scatter = plt.scatter(X[:, 0], X[:, 1], c=clusters, cmap='viridis')
    plt.xlabel('Price (Lakhs)')
    plt.ylabel('Area (sqft)')
    plt.title('Property Clusters based on Price and Area')
    plt.colorbar(scatter, label='Cluster')
    plt.grid(True)
    plt.show()

    # Example property classification
    example = np.array([[52, 1500, 0.88, 0.83]])
    example_scaled = scaler.transform(example)
    cluster = kmeans.predict(example_scaled)[0]
    
    print("\nExample Property Classification:")
    print("Property Features:")
    print(f"- Price: 52 Lakhs")
    print(f"- Area: 1500 sqft")
    print(f"- Location Score: 0.88")
    print(f"- Infrastructure Score: 0.83")
    print(f"Assigned to Cluster: {cluster + 1}")

if __name__ == "__main__":
    run_kmeans_analysis()