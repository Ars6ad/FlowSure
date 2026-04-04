// India seismic zones (IS 1893)
const SEISMIC = {
  'jammu and kashmir': 5, 'ladakh': 5, 'uttarakhand': 5, 'himachal pradesh': 5,
  'manipur': 5, 'assam': 5, 'meghalaya': 5, 'arunachal pradesh': 5,
  'andaman and nicobar islands': 5, 'mizoram': 5, 'nagaland': 5,
  'delhi': 4, 'haryana': 4, 'punjab': 4, 'uttar pradesh': 4,
  'bihar': 4, 'west bengal': 4, 'sikkim': 4, 'tripura': 4, 'chandigarh': 4,
  'gujarat': 3, 'maharashtra': 3, 'kerala': 3, 'goa': 3,
  'karnataka': 3, 'rajasthan': 3, 'jharkhand': 3, 'odisha': 3, 'chhattisgarh': 3,
  'tamil nadu': 2, 'andhra pradesh': 2, 'telangana': 2, 'madhya pradesh': 2,
  'puducherry': 2, 'lakshadweep': 2,
};
const FLOOD_HIGH = ['assam','bihar','uttar pradesh','west bengal','odisha','andhra pradesh',
  'manipur','meghalaya','arunachal pradesh','tripura','nagaland','kerala','uttarakhand',
  'himachal pradesh','jammu and kashmir'];
const FLOOD_MED = ['gujarat','maharashtra','karnataka','rajasthan','madhya pradesh',
  'chhattisgarh','jharkhand','punjab','haryana','delhi'];
const CYCLONE_HIGH = ['odisha','andhra pradesh','west bengal','tamil nadu','gujarat',
  'maharashtra','goa','kerala','andaman and nicobar islands'];
const URBAN = ['mumbai','delhi','bangalore','bengaluru','hyderabad','chennai','kolkata',
  'pune','ahmedabad','surat','jaipur','lucknow','kanpur','nagpur','indore','thane',
  'bhopal','patna','vadodara','ghaziabad'];

export const calculateRiskScore = (state = '', city = '') => {
  const s = state.toLowerCase();
  const c = city.toLowerCase();
  let score = 0;
  const zone = SEISMIC[s] || 2;
  score += Math.round(((zone - 1) / 4) * 30);
  if (FLOOD_HIGH.includes(s)) score += 35;
  else if (FLOOD_MED.includes(s)) score += 18;
  else score += 5;
  if (CYCLONE_HIGH.includes(s)) score += 20;
  if (URBAN.some(u => c.includes(u) || u.includes(c))) score += 15;
  else score += 5;
  score = Math.min(100, Math.round(score));
  const riskLevel = score < 35 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH';
  const tier = score < 35 ? 'basic' : score < 65 ? 'standard' : 'premium';
  return { score, riskLevel, tier };
};

export const getInsurancePlans = (score) => [
  {
    id: 'basic', name: 'Basic Shield', tagline: 'Essential Protection',
    weeklyPremium: Math.max(49, Math.round(score * 0.65)),
    maxPayout: 2000, coveragePercent: 80, processingTime: '24 hours',
    triggerThresholds: { rain: 40, earthquake: 5.5 },
    coverageTypes: ['Heavy Rain >40mm', 'Earthquake ≥5.5'],
    recommended: score < 35,
  },
  {
    id: 'standard', name: 'Standard Shield', tagline: 'Comprehensive Coverage',
    weeklyPremium: Math.max(99, Math.round(score * 1.3)),
    maxPayout: 5000, coveragePercent: 85, processingTime: '6 hours',
    triggerThresholds: { rain: 25, earthquake: 4.5 },
    coverageTypes: ['Rain >25mm', 'Earthquake ≥4.5', 'Flood Alert'],
    recommended: score >= 35 && score < 65,
  },
  {
    id: 'premium', name: 'Premium Shield', tagline: 'Maximum Safety Net',
    weeklyPremium: Math.max(179, Math.round(score * 2.1)),
    maxPayout: 10000, coveragePercent: 90, processingTime: 'Instant',
    triggerThresholds: { rain: 15, earthquake: 4.0 },
    coverageTypes: ['Rain >15mm', 'Earthquake ≥4.0', 'Cyclone', 'Flood', 'Heatwave', 'Nominee Cover'],
    recommended: score >= 65,
  },
];
