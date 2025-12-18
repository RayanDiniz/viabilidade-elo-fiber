import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <input placeholder="Latitude" />
      <input placeholder="Longitude" />
      <button>Consultar viabilidade</button>
      
      <MapContainer center={[-2.53, -44.27]} zoom={15} style={{ height: '500px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </>
  )
}

export default App
