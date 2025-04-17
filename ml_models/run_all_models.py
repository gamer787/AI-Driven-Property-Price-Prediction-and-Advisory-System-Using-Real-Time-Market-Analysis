from svm_classifier import run_svm_analysis
from linear_regression import run_linear_regression
from kmeans_clustering import run_kmeans_analysis
from random_forest_regression import run_random_forest

def main():
    print("Running all machine learning models for property analysis...")
    
    # Run SVM Classifier
    run_svm_analysis()
    
    # Run Linear Regression
    run_linear_regression()
    
    # Run K-means Clustering
    run_kmeans_analysis()
    
    # Run Random Forest Regression
    run_random_forest()
    
    print("\nAll analyses completed!")

if __name__ == "__main__":
    main()