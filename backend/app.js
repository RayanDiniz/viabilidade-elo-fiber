// backend/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rotas
const viabilityRouter = require('./api/viability');
const healthRouter = require('./api/health');

const app = express();

// Configurações de segurança
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json());

// Rotas
app.use('/api', viabilityRouter);
app.use('/health', healthRouter);

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        service: 'API de Viabilidade FTTH',
        version: '1.0.0',
        endpoints: {
            viabilidade: '/api/viability?lat=<latitude>&lng=<longitude>',
            infraestrutura: '/api/infraestrutura?lat=<latitude>&lng=<longitude>',
            estatisticas: '/api/estatisticas',
            health: '/health'
        }
    });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});