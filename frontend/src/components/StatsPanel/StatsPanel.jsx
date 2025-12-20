import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaHistory, 
  FaClock, 
  FaSearch, 
  FaCheckCircle,
  FaTimesCircle,
  FaTrash 
} from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';
import { useAppContext } from '../../contexts/AppContext';
import './StatsPanel.css';

const StatsPanel = () => {
  const { searchHistory, clearHistory, results } = useAppContext();
  const [stats, setStats] = useState({
    totalSearches: 0,
    successfulSearches: 0,
    averageResults: 0,
    lastSearch: null
  });

  useEffect(() => {
    // Calcular estatísticas do histórico
    if (searchHistory.length > 0) {
      const total = searchHistory.length;
      const successful = searchHistory.filter(h => h.resultCount > 0).length;
      const avgResults = searchHistory.reduce((sum, h) => sum + (h.resultCount || 0), 0) / total;
      
      setStats({
        totalSearches: total,
        successfulSearches: successful,
        averageResults: Math.round(avgResults),
        lastSearch: searchHistory[0]
      });
    }
  }, [searchHistory]);

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h3><FaChartBar /> Estatísticas</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaSearch />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalSearches}</div>
            <div className="stat-label">Consultas Totais</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.successfulSearches}</div>
            <div className="stat-label">Com Resultados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon avg">
            <FaChartBar />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.averageResults}</div>
            <div className="stat-label">CTOs/Consulta</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon time">
            <FaClock />
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {stats.lastSearch ? formatDateTime(stats.lastSearch.timestamp).split(',')[0] : 'N/A'}
            </div>
            <div className="stat-label">Última Consulta</div>
          </div>
        </div>
      </div>

      {searchHistory.length > 0 && (
        <>
          <div className="history-section">
            <div className="history-header">
              <h4><FaHistory /> Histórico Recente</h4>
              <button onClick={clearHistory} className="clear-history-btn">
                <FaTrash /> Limpar
              </button>
            </div>
            
            <div className="history-list">
              {searchHistory.slice(0, 5).map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-main">
                    <div className="history-coords">
                      {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                    </div>
                    <div className="history-time">
                      {formatDateTime(item.timestamp)}
                    </div>
                  </div>
                  <div className="history-details">
                    <div className="history-input">
                      <span className="truncate">{item.input}</span>
                    </div>
                    <div className="history-results">
                      <span className={`result-count ${item.resultCount > 0 ? 'success' : 'empty'}`}>
                        {item.resultCount > 0 ? (
                          <><FaCheckCircle /> {item.resultCount} CTOs</>
                        ) : (
                          <><FaTimesCircle /> Sem resultados</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {results && (
        <div className="current-stats">
          <h4>Consulta Atual</h4>
          <div className="current-stats-grid">
            <div className="current-stat">
              <span className="current-stat-label">Raio:</span>
              <span className="current-stat-value">{results.metadata?.raio_metros || 300}m</span>
            </div>
            <div className="current-stat">
              <span className="current-stat-label">CTOs:</span>
              <span className="current-stat-value">{results.metadata?.total_resultados || 0}</span>
            </div>
            <div className="current-stat">
              <span className="current-stat-label">Lat:</span>
              <span className="current-stat-value">{results.metadata?.coordenadas_consulta?.latitude?.toFixed(6) || 'N/A'}</span>
            </div>
            <div className="current-stat">
              <span className="current-stat-label">Lng:</span>
              <span className="current-stat-value">{results.metadata?.coordenadas_consulta?.longitude?.toFixed(6) || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;