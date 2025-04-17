export class KMeans {
  private k: number;
  private centroids: number[][];
  private labels: number[];

  constructor(k: number) {
    this.k = k;
    this.centroids = [];
    this.labels = [];
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

  private distance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  private initializeCentroids(X: number[][]): void {
    // K-means++ initialization
    this.centroids = [X[Math.floor(Math.random() * X.length)]];

    while (this.centroids.length < this.k) {
      const distances = X.map(point => 
        Math.min(...this.centroids.map(centroid => 
          this.distance(point, centroid)
        ))
      );
      
      const sum = distances.reduce((a, b) => a + b, 0);
      const probs = distances.map(d => d / sum);
      
      let r = Math.random();
      let i = 0;
      while (r > 0 && i < probs.length) {
        r -= probs[i];
        i++;
      }
      
      this.centroids.push(X[Math.max(0, i - 1)]);
    }
  }

  fit(X: number[][], maxIterations = 100): void {
    const normalizedX = this.normalize(X);
    this.initializeCentroids(normalizedX);

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign points to nearest centroid
      this.labels = normalizedX.map(point => {
        const distances = this.centroids.map(centroid => 
          this.distance(point, centroid)
        );
        return distances.indexOf(Math.min(...distances));
      });

      // Update centroids
      const newCentroids = this.centroids.map((_, i) => {
        const clusterPoints = normalizedX.filter((_, j) => this.labels[j] === i);
        if (clusterPoints.length === 0) return this.centroids[i];
        
        return clusterPoints[0].map((_, dim) =>
          clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length
        );
      });

      // Check convergence
      const centroidShift = this.centroids.reduce((sum, centroid, i) =>
        sum + this.distance(centroid, newCentroids[i]), 0
      );

      this.centroids = newCentroids;
      if (centroidShift < 0.001) break;
    }
  }

  predict(X: number[][]): number[] {
    const normalizedX = this.normalize(X);
    return normalizedX.map(point => {
      const distances = this.centroids.map(centroid => 
        this.distance(point, centroid)
      );
      return distances.indexOf(Math.min(...distances));
    });
  }
}

export function runKMeansAnalysis() {
  const X = [
    [45, 1200, 0.9, 0.85],   // Gachibowli 2BHK
    [85, 2200, 0.95, 0.95],  // Jubilee Hills 3BHK
    [120, 3000, 0.9, 0.9],   // Banjara Hills 4BHK
    [35, 650, 0.85, 0.8],    // Madhapur 1BHK
    [65, 1800, 0.8, 0.75],   // Kondapur 3BHK
  ];

  const kmeans = new KMeans(3);
  kmeans.fit(X);

  const example = [52, 1500, 0.88, 0.83];
  const cluster = kmeans.predict([example])[0];

  return {
    cluster,
    features: {
      price: example[0],
      area: example[1],
      locationScore: example[2],
      infrastructureScore: example[3]
    }
  };
}