const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByCoords = async (lat, lon) => {
  const res = await fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`);
  if (!res.ok) throw new Error('Weather API error');
  return res.json();
};

export const checkRainCondition = async (lat, lon) => {
  try {
    const data = await getWeatherByCoords(lat, lon);
    const rainfall = data.rain?.['1h'] || data.rain?.['3h'] / 3 || 0;
    const id = data.weather?.[0]?.id || 800;
    const isFlood = id === 522 || id >= 503 || (id >= 230 && id <= 232);
    const isHeavyRain = rainfall > 15 || (id >= 502 && id <= 531);
    return {
      triggered: isHeavyRain || isFlood,
      rainfall: Math.round(rainfall * 10) / 10,
      isFlood,
      city: data.name,
      country: data.sys?.country,
      description: data.weather?.[0]?.description || 'Clear',
      temperature: Math.round(data.main?.temp),
      humidity: data.main?.humidity,
      weatherId: id,
      icon: data.weather?.[0]?.icon,
    };
  } catch (e) {
    console.error('Rain check failed:', e);
    return { triggered: false, rainfall: 0, isFlood: false, city: 'Unknown', description: 'Unavailable', temperature: '--', humidity: '--' };
  }
};
