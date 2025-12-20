import React, { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaLink, FaRuler } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { viabilityService } from '../../services/api.service';
import { parseCoordinates } from '../../utils/coordinateParser';
import toast from 'react-hot-toast';
import './SearchBar.css';

const SearchBar = () => {
  const { 
    setLoading, 
    setResults, 
    setCoordinates,
    addToHistory,
    searchRadius,
    setSearchRadius
  } = useAppContext();
  
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('url');
  const [exampleLinks, setExampleLinks] = useState([]);

  useEffect(() => {
    // Exemplos para ajudar o usuário
    setExampleLinks([
      'https://goo.gl/maps/abc123',
      'https://maps.google.com/?q=-23.55052,-46.633308',
      'https://maps.app.goo.gl/xyz789',
      '-23.550520, -46.633308'
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast.error('Por favor, insira um link ou coordenadas');
      return;
    }

    setLoading(true);
    
    try {
      const coords = parseCoordinates(input);
      
      if (!coords) {
        toast.error('Não foi possível extrair coordenadas. Verifique o formato.');
        setLoading(false);
        return;
      }

      setCoordinates(coords);
      
      const response = await viabilityService.checkViability(
        coords.lat, 
        coords.lng, 
        searchRadius
      );
      
      setResults(response);
      
      // Salva no histórico
      addToHistory({
        input,
        coordinates: coords,
        timestamp: new Date().toISOString(),
        resultCount: response.metadata?.total_resultados || 0
      });
      
      toast.success(`Encontradas ${response.metadata?.total_resultados || 0} CTOs próximas`);
      
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao consultar viabilidade');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setInput(example);
  };

  const handleRadiusChange = (e) => {
    setSearchRadius(parseInt(e.target.value));
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <div className="input-icon">
            {inputType === 'url' ? <FaLink /> : <FaMapMarkerAlt />}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              inputType === 'url' 
                ? "Cole o link do Google Maps aqui..." 
                : "Digite as coordenadas (ex: -23.550520, -46.633308)"
            }
            className="search-input"
          />
          <div className="input-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${inputType === 'url' ? 'active' : ''}`}
              onClick={() => setInputType('url')}
            >
              <FaLink /> Link
            </button>
            <button
              type="button"
              className={`toggle-btn ${inputType === 'coords' ? 'active' : ''}`}
              onClick={() => setInputType('coords')}
            >
              <FaMapMarkerAlt /> Coordenadas
            </button>
          </div>
        </div>

        <div className="search-controls">
          <div className="radius-control">
            <FaRuler />
            <label htmlFor="radius">Raio de busca:</label>
            <input
              type="range"
              id="radius"
              min="100"
              max="1000"
              step="50"
              value={searchRadius}
              onChange={handleRadiusChange}
            />
            <span className="radius-value">{searchRadius}m</span>
          </div>

          <button type="submit" className="search-btn">
            <FaSearch />
            Consultar Viabilidade
          </button>
        </div>
      </form>

      <div className="examples-section">
        <p className="examples-title">Exemplos de formato:</p>
        <div className="examples-grid">
          {exampleLinks.map((example, index) => (
            <button
              key={index}
              type="button"
              className="example-btn"
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;