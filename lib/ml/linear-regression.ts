export class LinearRegression {
  private weights: number[];
  private bias: number;

  constructor() {
    this.weights = [];
    this.bias = 0;
  }

  private normalize(X: number[][]): number[][] {
    const means = X[0].map((_, col) => 
      X.reduce((sum, row) => sum + row[col], 0) / X.length
    );
    
    const stds = X[0].map((_, col) => {
      const mean = means[col];
      const squaredDiffs = X.map(row => Math.pow(row[col] - mean, 2));
      return Math.sqrt(squaredDiffs.reduce((a, b) => a + b) / X.length);
    });

    return X.map(row =>
      row.map((val, col) => (val - means[col]) / (stds[col] || 1))
    );
  }

  fit(X: number[][], y: number[], learningRate = 0.01, epochs = 1000): void {
    const normalizedX = this.normalize(X);
    this.weights = new Array(normalizedX[0].length).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      const predictions = this.predict(normalizedX);
      
      // Calculate gradients
      const errors = predictions.map((pred, i) => pred - y[i]);
      
      // Update weights
      for (let j = 0; j < this.weights.length; j++) {
        const gradient = errors.reduce((sum, error, i) => 
          sum + error * normalizedX[i][j], 0
        ) / normalizedX.length;
        
        this.weights[j] -= learningRate * gradient;
      }
      
      // Update bias
      const biasGradient = errors.reduce((sum, error) => sum + error, 0) / normalizedX.length;
      this.bias -= learningRate * biasGradient;
    }
  }

  predict(X: number[][]): number[] {
    const normalizedX = this.normalize(X);
    return normalizedX.map(x =>
      x.reduce((sum, xi, i) => sum + xi * this.weights[i], 0) + this.bias
    );
  }

  getFeatureImportance(): number[] {
    const totalWeight = this.weights.reduce((sum, w) => sum + Math.abs(w), 0);
    return this.weights.map(w => Math.abs(w) / totalWeight);
  }
}

export function runLinearRegression() {
  const X = [
    [1200, 0.9, 0.8, 0.85],  // Gachibowli 2BHK
    [2200, 0.95, 0.9, 0.95], // Jubilee Hills 3BHK
    [3000, 0.9, 0.7, 0.9],   // Banjara Hills 4BHK
    [650, 0.85, 0.85, 0.8],  // Madhapur 1BHK
    [1800, 0.8, 0.8, 0.75],  // Kondapur 3BHK
  ];

  const y = [45, 85, 120, 35, 65];  // Prices in lakhs

  const model = new LinearRegression();
  model.fit(X, y);

  const example = [1500, 0.88, 0.82, 0.83];
  const prediction = model.predict([example])[0];
  const importance = model.getFeatureImportance();

  return {
    prediction: prediction,
    featureImportance: {
      area: importance[0],
      location: importance[1],
      propertyType: importance[2],
      infrastructure: importance[3]
    }
  };
}