class DecisionTree {
  private maxDepth: number;
  private minSamplesSplit: number;
  private tree: any;

  constructor(maxDepth = 5, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.tree = null;
  }

  private variance(y: number[]): number {
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    return y.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / y.length;
  }

  private splitData(X: number[][], y: number[], feature: number, threshold: number): any {
    const leftIndices = X.map((_, i) => i).filter(i => X[i][feature] <= threshold);
    const rightIndices = X.map((_, i) => i).filter(i => X[i][feature] > threshold);

    return {
      leftX: leftIndices.map(i => X[i]),
      leftY: leftIndices.map(i => y[i]),
      rightX: rightIndices.map(i => X[i]),
      rightY: rightIndices.map(i => y[i])
    };
  }

  private findBestSplit(X: number[][], y: number[]): any {
    let bestGain = -Infinity;
    let bestFeature = 0;
    let bestThreshold = 0;

    const parentVariance = this.variance(y);

    for (let feature = 0; feature < X[0].length; feature++) {
      const values = X.map(x => x[feature]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const split = this.splitData(X, y, feature, threshold);

        if (split.leftY.length < this.minSamplesSplit || 
            split.rightY.length < this.minSamplesSplit) continue;

        const leftVariance = this.variance(split.leftY);
        const rightVariance = this.variance(split.rightY);
        
        const gain = parentVariance - 
          (split.leftY.length / y.length * leftVariance +
           split.rightY.length / y.length * rightVariance);

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }

    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
  }

  private buildTree(X: number[][], y: number[], depth = 0): any {
    if (depth >= this.maxDepth || y.length < this.minSamplesSplit || 
        new Set(y).size === 1) {
      return { value: y.reduce((a, b) => a + b, 0) / y.length };
    }

    const split = this.findBestSplit(X, y);
    if (split.gain <= 0) {
      return { value: y.reduce((a, b) => a + b, 0) / y.length };
    }

    const { leftX, leftY, rightX, rightY } = 
      this.splitData(X, y, split.feature, split.threshold);

    return {
      feature: split.feature,
      threshold: split.threshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1)
    };
  }

  fit(X: number[][], y: number[]): void {
    this.tree = this.buildTree(X, y);
  }

  private predict_single(x: number[], node: any): number {
    if ('value' in node) return node.value;
    
    if (x[node.feature] <= node.threshold) {
      return this.predict_single(x, node.left);
    } else {
      return this.predict_single(x, node.right);
    }
  }

  predict(X: number[][]): number[] {
    return X.map(x => this.predict_single(x, this.tree));
  }
}

export class RandomForest {
  private nTrees: number;
  private trees: DecisionTree[];
  private featureImportance: number[];

  constructor(nTrees = 10) {
    this.nTrees = nTrees;
    this.trees = [];
    this.featureImportance = [];
  }

  private bootstrapSample(X: number[][], y: number[]): [number[][], number[]] {
    const indices = Array(X.length).fill(0).map((_, i) => 
      Math.floor(Math.random() * X.length)
    );
    return [
      indices.map(i => X[i]),
      indices.map(i => y[i])
    ];
  }

  fit(X: number[][], y: number[]): void {
    this.trees = Array(this.nTrees).fill(null).map(() => {
      const tree = new DecisionTree();
      const [bootX, bootY] = this.bootstrapSample(X, y);
      tree.fit(bootX, bootY);
      return tree;
    });

    // Simple feature importance calculation
    this.featureImportance = Array(X[0].length).fill(0);
    const baseError = this.calculateError(X, y);
    
    for (let i = 0; i < X[0].length; i++) {
      const permutedX = X.map(row => [...row]);
      const col = permutedX.map(row => row[i]);
      for (let j = 0; j < permutedX.length; j++) {
        const randIdx = Math.floor(Math.random() * permutedX.length);
        permutedX[j][i] = col[randIdx];
      }
      const permutedError = this.calculateError(permutedX, y);
      this.featureImportance[i] = permutedError - baseError;
    }

    const sum = this.featureImportance.reduce((a, b) => a + b, 0);
    this.featureImportance = this.featureImportance.map(v => v / sum);
  }

  private calculateError(X: number[][], y: number[]): number {
    const predictions = this.predict(X);
    return predictions.reduce((sum, pred, i) => 
      sum + Math.pow(pred - y[i], 2), 0
    ) / y.length;
  }

  predict(X: number[][]): number[] {
    const predictions = this.trees.map(tree => tree.predict(X));
    return X.map((_, i) => 
      predictions.reduce((sum, pred) => sum + pred[i], 0) / this.nTrees
    );
  }

  getFeatureImportance(): number[] {
    return this.featureImportance;
  }
}

export function runRandomForestAnalysis() {
  const X = [
    [1200, 0.9, 0.8, 0.85, 1],  // Gachibowli 2BHK
    [2200, 0.95, 0.9, 0.95, 0], // Jubilee Hills 3BHK
    [3000, 0.9, 0.7, 0.9, 0],   // Banjara Hills 4BHK
    [650, 0.85, 0.85, 0.8, 1],  // Madhapur 1BHK
    [1800, 0.8, 0.8, 0.75, 0],  // Kondapur 3BHK
  ];

  const y = [45, 85, 120, 35, 65];  // Prices in lakhs

  const rf = new RandomForest(10);
  rf.fit(X, y);

  const example = [1500, 0.88, 0.82, 0.83, 1];
  const prediction = rf.predict([example])[0];
  const importance = rf.getFeatureImportance();

  return {
    prediction,
    featureImportance: {
      area: importance[0],
      location: importance[1],
      propertyType: importance[2],
      infrastructure: importance[3],
      age: importance[4]
    }
  };
}