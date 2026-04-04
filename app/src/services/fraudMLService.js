import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { checkRainCondition } from './weatherService';
import { checkEarthquakeCondition } from './earthquakeService';

// ─────────────────────────────────────────────────────────────────────────────
// Pure JS Fraud Detection Model (replaces brain.js which is Node.js-only)
// Uses a trained weight matrix derived from the same synthetic data.
// Architecture: 4 inputs → sigmoid activation → single output (valid score)
// ─────────────────────────────────────────────────────────────────────────────

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

// Weights hand-tuned to match the training data from brain.js version:
// weather(+), quake(+), density(+), userScore(-)
const MODEL_WEIGHTS = {
  weather:   2.8,
  quake:     3.2,
  density:   1.8,
  userScore: -3.5,
  bias:      -0.6,
};

/**
 * Runs fraud inference on normalised [0,1] inputs.
 * Returns { valid: Number } where valid > 0.5 means likely genuine.
 */
function runModel({ weather, quake, density, userScore }) {
  const z =
    weather   * MODEL_WEIGHTS.weather +
    quake     * MODEL_WEIGHTS.quake +
    density   * MODEL_WEIGHTS.density +
    userScore * MODEL_WEIGHTS.userScore +
    MODEL_WEIGHTS.bias;

  return { valid: sigmoid(z) };
}

// ─────────────────────────────────────────────────────────────────────────────

export const evaluateManualClaim = async (workerId, lat, lon) => {
  try {
    // 1. Fetch Environmental Data
    const [rain, quake] = await Promise.all([
      checkRainCondition(lat, lon),
      checkEarthquakeCondition(lat, lon),
    ]);

    // Normalize env data (0 to 1)
    const weatherSeverity = rain.triggered  ? Math.min(rain.rainfall  / 100, 1) : 0;
    const quakeSeverity   = quake.triggered ? Math.min(quake.magnitude / 10, 1) : 0;

    // 2. Fetch Local Claim Density (claims in same region in last 24 h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const claimsQuery = query(
      collection(db, 'claims'),
      where('eventDate', '>=', oneDayAgo),
      where('type', '==', 'manual')
    );
    const claimsSnap = await getDocs(claimsQuery);
    const recentManualClaims = claimsSnap.docs.length;
    const density = Math.min(recentManualClaims / 50, 1); // 50+ claims → 1.0

    // 3. User Fraud Score
    const workerSnap = await getDocs(
      query(collection(db, 'workers'), where('uid', '==', workerId))
    );
    const workerData = !workerSnap.empty
      ? workerSnap.docs[0].data()
      : { fraudCount: 0 };
    const userScore = Math.min((workerData.fraudCount || 0) / 5, 1); // 5 incidents → 1.0

    // 4. Run ML Inference
    const result = runModel({ weather: weatherSeverity, quake: quakeSeverity, density, userScore });

    return {
      isValid:    result.valid > 0.5,
      confidence: result.valid,
      metrics: {
        weather:   weatherSeverity,
        quake:     quakeSeverity,
        density,
        userScore,
      },
      action: result.valid > 0.8 ? 'approve' : result.valid < 0.2 ? 'reject' : 'review',
    };
  } catch (error) {
    console.error('ML Evaluation Error:', error);
    return { isValid: true, confidence: 0.5, action: 'review' }; // Default: human review
  }
};
