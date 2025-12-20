import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner">
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-text">Consultando CTOs próximas...</p>
        <p className="loading-subtext">Aguarde enquanto processamos sua solicitação</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;