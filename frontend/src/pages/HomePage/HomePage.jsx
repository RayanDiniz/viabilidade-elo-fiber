import React from 'react';
import Header from '../../components/Header/Header';
import SearchBar from '../../components/SearchBar/SearchBar';
import ResultsTable from '../../components/ResultsTable/ResultsTable';
import MapView from '../../components/MapView/MapView';
import StatsPanel from '../../components/StatsPanel/StatsPanel';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useAppContext } from '../../contexts/AppContext';
import './HomePage.css';

const HomePage = () => {
  const { loading, results, coordinates } = useAppContext();

  return (
    <div className="home-page">
      <Header />
      
      <main className="container main-content">
        {loading && <LoadingSpinner />}
        
        <div className="content-grid">
          <div className="left-column">
            <SearchBar />
            
            {results && (
              <>
                <ResultsTable results={results} coordinates={coordinates} />
                <MapView coordinates={coordinates} results={results} />
              </>
            )}
          </div>
          
          <div className="right-column">
            <StatsPanel />
            
            <div className="info-card">
              <h3>ℹ️ Como Usar</h3>
              <ol className="instructions">
                <li>Cole o link do Google Maps ou digite as coordenadas</li>
                <li>Ajuste o raio de busca se necessário (padrão: 300m)</li>
                <li>Clique em "Consultar Viabilidade"</li>
                <li>Visualize as CTOs encontradas no raio especificado</li>
                <li>Use o mapa para ver a localização exata</li>
              </ol>
              
              <div className="legend">
                <h4>Legenda:</h4>
                <div className="legend-item">
                  <span className="legend-color high"></span>
                  <span>Alta Viabilidade</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color medium"></span>
                  <span>Média Viabilidade</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color low"></span>
                  <span>Baixa Viabilidade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>Dashboard FTTH - Sistema Interno de Consulta de Viabilidade Técnica</p>
          <p className="footer-sub">© {new Date().getFullYear()} - Uso exclusivo da equipe comercial</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;