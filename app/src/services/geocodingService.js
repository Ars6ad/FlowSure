const NOMINATIM = 'https://nominatim.openstreetmap.org';

export const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'GigShield/1.0' } }
    );
    const data = await res.json();
    const a = data.address || {};
    return {
      city: a.city || a.town || a.village || a.county || '',
      state: a.state || '',
      district: a.county || a.state_district || '',
      postcode: a.postcode || '',
      country: a.country || 'India',
      displayName: data.display_name || '',
    };
  } catch (e) {
    console.error('Geocoding failed:', e);
    return { city: '', state: '', district: '', postcode: '', country: 'India', displayName: '' };
  }
};

export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => reject(new Error(err.message || 'Location access denied.')),
      { timeout: 10000, maximumAge: 60000 }
    );
  });
