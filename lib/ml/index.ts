import { runSVMAnalysis } from './svm';
import { runLinearRegression } from './linear-regression';
import { runKMeansAnalysis } from './kmeans';
import { runRandomForestAnalysis } from './random-forest';

export function runAllAnalyses() {
  const svmResults = runSVMAnalysis();
  const lrResults = runLinearRegression();
  const kmeansResults = runKMeansAnalysis();
  const rfResults = runRandomForestAnalysis();

  return {
    svm: svmResults,
    linearRegression: lrResults,
    kmeans: kmeansResults,
    randomForest: rfResults
  };
}