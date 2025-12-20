export const parseCoordinates = (input) => {
  if (!input) return null;

  // Tenta extrair de URL primeiro
  if (input.includes('google.com') || input.includes('goo.gl')) {
    const urlPatterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
    ];
    
    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
          source: 'url'
        };
      }
    }
  }

  // Tenta como coordenadas diretas: "lat, lng" ou "lat, lng"
  const coordPattern = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/;
  const coordMatch = input.match(coordPattern);
  
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2]),
      source: 'coordinates'
    };
  }

  return null;
};

export const formatCoordinates = (lat, lng, format = 'decimal') => {
  if (format === 'decimal') {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
  
  // Para formato DMS (graus, minutos, segundos)
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);
  
  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = ((absLat - latDeg - latMin/60) * 3600).toFixed(1);
  
  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = ((absLng - lngDeg - lngMin/60) * 3600).toFixed(1);
  
  return `${latDeg}°${latMin}'${latSec}"${latDir} ${lngDeg}°${lngMin}'${lngSec}"${lngDir}`;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distância em metros
};