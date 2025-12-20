import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle,
  LayersControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMap, FaCrosshairs, FaExpand } from 'react-icons/fa';
import './MapView.css';

// Corrigir ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ coordinates, results }) => {
  const [map, setMap] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (map && coordinates) {
      map.setView([coordinates.lat, coordinates.lng], 15);
    }
  }, [map, coordinates]);

  if (!coordinates) {
    return (
      <div className="map-placeholder">
        <FaMap className="placeholder-icon" />
        <p>Insira coordenadas para visualizar no mapa</p>
      </div>
    );
  }

  const center = [coordinates.lat, coordinates.lng];
  const searchRadius = results?.metadata?.raio_metros || 300;

  const ctoIcon = L.divIcon({
    html: '<div class="cto-marker"></div>',
    className: 'cto-icon',
    iconSize: [20, 20]
  });

  const centerIcon = L.divIcon({
    html: '<div class="center-marker"></div>',
    className: 'center-icon',
    iconSize: [30, 30]
  });

  const toggleFullscreen = () => {
    const mapContainer = document.querySelector('.map-container');
    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const centerMap = () => {
    if (map) {
      map.setView(center, 15);
    }
  };

  return (
    <div className={`map-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="map-controls">
        <button onClick={centerMap} className="map-control-btn">
          <FaCrosshairs />
          Centralizar
        </button>
        <button onClick={toggleFullscreen} className="map-control-btn">
          <FaExpand />
          {isFullscreen ? 'Sair' : 'Tela Cheia'}
        </button>
      </div>
      
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satélite">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Topográfico">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Raio de busca */}
        <Circle
          center={center}
          radius={searchRadius}
          pathOptions={{
            fillColor: '#3b82f6',
            color: '#1d4ed8',
            fillOpacity: 0.1,
            weight: 2
          }}
        />

        {/* Marcador do ponto consultado */}
        <Marker position={center} icon={centerIcon}>
          <Popup>
            <strong>Local Consultado</strong><br />
            Lat: {coordinates.lat.toFixed(6)}<br />
            Lng: {coordinates.lng.toFixed(6)}
          </Popup>
        </Marker>

        {/* Marcadores das CTOs */}
        {results?.resultados?.map((cto, index) => {
          if (!cto.latitude_cto || !cto.longitude_cto) return null;
          
          const ctoPosition = [cto.latitude_cto, cto.longitude_cto];
          
          return (
            <Marker key={index} position={ctoPosition} icon={ctoIcon}>
              <Popup>
                <div className="popup-content">
                  <strong>CTO {cto.cto_id}</strong><br />
                  <div>Distância: {(cto.distancia_metros || 0).toFixed(0)}m</div>
                  <div>Capacidade: {cto.capacidade_disponivel || 0}/{cto.capacidade_total || 'N/A'}</div>
                  <div>Endereço: {cto.endereco || 'N/A'}</div>
                  <div className={`viability ${cto.viabilidade?.includes('ALTA') ? 'high' : cto.viabilidade?.includes('MÉDIA') ? 'medium' : 'low'}`}>
                    {cto.viabilidade}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;