const USGS_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const checkEarthquakeCondition = async (lat, lon, radiusKm = 300) => {
  try {
    const now = new Date();
    const yesterday = new Date(now - 48 * 60 * 60 * 1000);
    const url = `${USGS_BASE}?format=geojson&starttime=${yesterday.toISOString()}&endtime=${now.toISOString()}&latitude=${lat}&longitude=${lon}&maxradiuskm=${radiusKm}&minmagnitude=3.5&orderby=magnitude`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('USGS API error');
    const data = await res.json();
    const events = data.features || [];
    const strongest = events[0];
    return {
      triggered: events.length > 0,
      magnitude: strongest?.properties?.mag || 0,
      place: strongest?.properties?.place || null,
      time: strongest?.properties?.time ? new Date(strongest.properties.time).toLocaleString('en-IN') : null,
      eventCount: events.length,
      recentEvents: events.slice(0, 5).map(e => ({
        mag: e.properties.mag,
        place: e.properties.place,
        time: new Date(e.properties.time).toLocaleString('en-IN'),
      })),
    };
  } catch (e) {
    console.error('Earthquake check failed:', e);
    return { triggered: false, magnitude: 0, place: null, time: null, eventCount: 0, recentEvents: [] };
  }
};
