import React from 'react';
import { 
  FaMapMarkerAlt, 
  FaRoute, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimesCircle,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { formatDistance, getViabilidadeColor, getViabilidadeIcon } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './ResultsTable.css';

const ResultsTable = ({ results, coordinates }) => {
  if (!results) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const renderStatusBadge = (viabilidade) => {
    const color = getViabilidadeColor(viabilidade);
    const icon = getViabilidadeIcon(viabilidade);
    
    return (
      <span className="status-badge" style={{ backgroundColor: color }}>
        {icon} {viabilidade}
      </span>
    );
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>
          <FaMapMarkerAlt /> Resultados da Consulta
        </h2>
        <div className="results-summary">
          <span className="summary-item">
            <FaCheckCircle className="text-success" />
            {results.metadata?.total_resultados || 0} CTOs encontradas
          </span>
          <span className="summary-item">
            <FaRoute />
            Raio: {results.metadata?.raio_metros || 300}m
          </span>
          <span className="summary-item">
            <FaMapMarkerAlt />
            {coordinates?.lat?.toFixed(6)}, {coordinates?.lng?.toFixed(6)}
          </span>
        </div>
      </div>

      {results.recomendacoes && results.recomendacoes.length > 0 && (
        <div className="recommendations">
          <h3><FaExclamationTriangle /> Recomendações:</h3>
          <ul>
            {results.recomendacoes.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {results.resultados && results.resultados.length > 0 ? (
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>CTO ID</th>
                <th>Endereço</th>
                <th>Distância</th>
                <th>Capacidade</th>
                <th>Viabilidade</th>
                <th>Localização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {results.resultados.map((cto, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td className="cto-id">
                    <strong>{cto.cto_id || 'N/A'}</strong>
                  </td>
                  <td className="address">
                    {cto.endereco || 'Endereço não disponível'}
                    {cto.nome && <div className="cto-name">{cto.nome}</div>}
                  </td>
                  <td className="distance">
                    <FaRoute />
                    {formatDistance(cto.distancia_metros || 0)}
                  </td>
                  <td className="capacity">
                    <div className="capacity-info">
                      <span className="available">
                        {cto.capacidade_disponivel || 0} disponíveis
                      </span>
                      {cto.capacidade_total && (
                        <span className="total">
                          de {cto.capacidade_total} total
                        </span>
                      )}
                    </div>
                    {cto.capacidade_total && (
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill"
                          style={{
                            width: `${((cto.capacidade_disponivel || 0) / cto.capacidade_total) * 100}%`
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="viability">
                    {renderStatusBadge(cto.viabilidade)}
                  </td>
                  <td className="coordinates">
                    {cto.latitude_cto && cto.longitude_cto ? (
                      <>
                        {cto.latitude_cto.toFixed(6)}, {cto.longitude_cto.toFixed(6)}
                      </>
                    ) : 'N/A'}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => copyToClipboard(`${cto.latitude_cto}, ${cto.longitude_cto}`)}
                      className="action-btn copy"
                      title="Copiar coordenadas"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => openInGoogleMaps(cto.latitude_cto, cto.longitude_cto)}
                      className="action-btn maps"
                      title="Abrir no Google Maps"
                    >
                      <FaExternalLinkAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          <FaTimesCircle className="no-results-icon" />
          <h3>Nenhuma CTO encontrada no raio especificado</h3>
          <p>
            Tente aumentar o raio de busca ou verifique se as coordenadas estão corretas.
          </p>
        </div>
      )}

      {results.resultados && results.resultados.length > 0 && (
        <div className="results-footer">
          <button 
            className="export-btn"
            onClick={() => {
              const dataStr = JSON.stringify(results.resultados, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              window.open(dataUri, '_blank');
            }}
          >
            Exportar JSON
          </button>
          <div className="timestamp">
            Consulta realizada em: {results.metadata?.timestamp ? 
              new Date(results.metadata.timestamp).toLocaleString('pt-BR') : 
              'N/A'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;