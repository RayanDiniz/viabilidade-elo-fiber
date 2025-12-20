export const extractCoordinatesFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Padrões comuns de URLs do Google Maps
  const patterns = [
    // Padrão 1: @lat,lng
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    
    // Padrão 2: ?q=lat,lng
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    
    // Padrão 3: /@lat,lng,z
    /\/@(-?\d+\.\d+),(-?\d+\.\d+)/,
    
    // Padrão 4: !3d lat !4d lng
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    
    // Padrão 5: place/.../@lat,lng
    /place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/,
    
    // Padrão 6: data=!4m2!3m1!1s... (coordenadas embedadas)
    /data=![^!]+!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Validação básica das coordenadas
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }
  }

  return null;
};

export const generateGoogleMapsUrl = (lat, lng) => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const generateGoogleMapsEmbedUrl = (lat, lng, zoom = 15) => {
  return `https://www.google.com/maps/embed/v1/view?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${lat},${lng}&zoom=${zoom}`;
};

export const isValidGoogleMapsUrl = (url) => {
  const googleDomains = [
    'maps.google.com',
    'google.com/maps',
    'goo.gl/maps',
    'maps.app.goo.gl'
  ];
  
  try {
    const urlObj = new URL(url);
    return googleDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};