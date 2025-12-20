import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FaArrowLeft, 
  FaDatabase, 
  FaChartLine, 
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { viabilityService } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AdminPage.css';

const AdminPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await viabilityService.getStatistics();
      setStatistics(data);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados de exemplo para gráficos
  const capacityData = [
    { name: '0-20%', value: 15 },
    { name: '21-50%', value: 30 },
    { name: '51-80%', value: 25 },
    { name: '81-100%', value: 30 }
  ];

  const monthlyData = [
    { month: 'Jan', consultas: 45, ctoEncontradas: 320 },
    { month: 'Fev', consultas: 52, ctoEncontradas: 380 },
    { month: 'Mar', consultas: 48, ctoEncontradas: 350 },
    { month: 'Abr', consultas: 61, ctoEncontradas: 420 },
    { month: 'Mai', consultas: 55, ctoEncontradas: 390 },
    { month: 'Jun', consultas: 58, ctoEncontradas: 410 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-admin">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <Link to="/" className="back-btn">
              <FaArrowLeft /> Voltar
            </Link>
            <div className="admin-title">
              <h1><FaChartLine /> Dashboard Administrativo</h1>
              <p>Estatísticas e Monitoramento do Sistema</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="admin-stats-grid">
          <div className="stat-card admin">
            <div className="stat-icon">
              <FaDatabase />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {statistics?.total_ctos || 0}
              </div>
              <div className="stat-label">Total de CTOs</div>
            </div>
          </div>

          <div className="stat-card admin">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {statistics?.cto_com_capacidade || 0}
              </div>
              <div className="stat-label">Com Capacidade</div>
            </div>
          </div>

          <div className="stat-card admin">
            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {statistics?.cto_sem_capacidade || 0}
              </div>
              <div className="stat-label">Sem Capacidade</div>
            </div>
          </div>

          <div className="stat-card admin">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {statistics?.capacidade_media ? statistics.capacidade_media.toFixed(1) : '0'}
              </div>
              <div className="stat-label">Capacidade Média</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3><FaChartLine /> Distribuição de Capacidade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3><FaClock /> Consultas Mensais</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consultas" fill="#8884d8" name="Consultas" />
                <Bar dataKey="ctoEncontradas" fill="#82ca9d" name="CTOs Encontradas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="time-range-selector">
          <h3>Período de Análise</h3>
          <div className="time-buttons">
            {['day', 'week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === 'day' && 'Hoje'}
                {range === 'week' && 'Semana'}
                {range === 'month' && 'Mês'}
                {range === 'quarter' && 'Trimestre'}
                {range === 'year' && 'Ano'}
              </button>
            ))}
          </div>
        </div>

        <div className="system-info">
          <h3>Informações do Sistema</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Última Atualização:</span>
              <span className="info-value">{statistics?.atualizado_em ? 
                new Date(statistics.atualizado_em).toLocaleString('pt-BR') : 
                'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status API:</span>
              <span className="info-value status-active">● Ativa</span>
            </div>
            <div className="info-item">
              <span className="info-label">BigQuery Status:</span>
              <span className="info-value status-active">● Conectado</span>
            </div>
            <div className="info-item">
              <span className="info-label">Versão:</span>
              <span className="info-value">1.0.0</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;