import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChartBar, FaMapMarkerAlt, FaBell } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <FaMapMarkerAlt className="logo-icon" />
            <div>
              <h1>Dashboard FTTH</h1>
              <p className="logo-subtitle">Consulta de Viabilidade Técnica</p>
            </div>
          </div>
          
          <nav className="nav">
            <Link to="/" className="nav-link">
              <FaHome />
              <span>Home</span>
            </Link>
            <Link to="/admin" className="nav-link">
              <FaChartBar />
              <span>Estatísticas</span>
            </Link>
            <button className="nav-link notifications-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;