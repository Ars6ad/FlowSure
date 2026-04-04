import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { checkRainCondition, checkAirCondition } from './weatherService';
import { checkEarthquakeCondition } from './earthquakeService';

export const runClaimsCheck = async (region) => {
  try {
    const q = region 
      ? query(collection(db, 'policies'), where('status', '==', 'active'), where('region', '==', region))
      : query(collection(db, 'policies'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    const policies = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const results = [];

    for (const policy of policies) {
      const { workerId, id: policyId, lat, lon, triggerThresholds, maxPayout } = policy;
      if (!lat || !lon) continue;

      const recentSnap = await getDocs(query(collection(db, 'claims'), where('workerId', '==', workerId)));
      const recent = recentSnap.docs.map(d => d.data());
      const hasRecentClaim = (type) =>
        recent.some(c => c.triggerType === type && (Date.now() - new Date(c.eventDate).getTime()) < 86400000);

      const rain = await checkRainCondition(lat, lon);
      if (rain.triggered && rain.rainfall >= (triggerThresholds?.rain || 25) && !hasRecentClaim('rain')) {
        await addDoc(collection(db, 'claims'), {
          workerId, policyId, type: 'auto',
          triggerType: rain.isFlood ? 'flood' : 'rain',
          triggerValue: rain.rainfall,
          triggerDescription: `${rain.description} – ${rain.rainfall}mm/hr in ${rain.city}`,
          amount: Math.round(maxPayout * 0.85),
          status: 'approved',
          eventDate: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        });
        results.push({ type: 'rain', workerId });
      }

      const quake = await checkEarthquakeCondition(lat, lon);
      if (quake.triggered && quake.magnitude >= (triggerThresholds?.earthquake || 4.5) && !hasRecentClaim('earthquake')) {
        await addDoc(collection(db, 'claims'), {
          workerId, policyId, type: 'auto',
          triggerType: 'earthquake',
          triggerValue: quake.magnitude,
          triggerDescription: `M${quake.magnitude} earthquake near ${quake.place}`,
          amount: Math.round(maxPayout * 0.90),
          status: 'approved',
          eventDate: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        });
        results.push({ type: 'earthquake', workerId });
      }

      const aqiRes = await checkAirCondition(lat, lon);
      if (aqiRes.triggered && !hasRecentClaim('aqi')) {
        await addDoc(collection(db, 'claims'), {
          workerId, policyId, type: 'auto',
          triggerType: 'aqi',
          triggerValue: aqiRes.aqi,
          triggerDescription: `Unsafe Air Quality (${aqiRes.description}) - PM2.5: ${aqiRes.pm2_5}`,
          amount: Math.round(maxPayout * 0.4),
          status: 'approved',
          eventDate: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        });
        results.push({ type: 'aqi', workerId });
      }
    }
    return results;
  } catch (e) {
    console.error('Claims engine error:', e);
    return [];
  }
};
