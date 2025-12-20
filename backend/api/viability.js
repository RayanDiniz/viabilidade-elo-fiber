// backend/api/viability.js
const express = require('express');
const router = express.Router();
const BigQueryService = require('../services/bigquery.service');
const ValidationService = require('../services/validation.service');

// Middleware de logging
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Endpoint principal de viabilidade
router.get('/viability', async (req, res) => {
    try {
        const { lat, lng, radius = 300 } = req.query;
        
        // Validação das coordenadas
        const coordValidation = ValidationService.validateCoordinates(lat, lng);
        if (!coordValidation.isValid) {
            return res.status(400).json({
                error: 'Coordenadas inválidas',
                details: coordValidation.errors
            });
        }
        
        // Validação do raio
        const radiusValidation = ValidationService.validateRadius(radius);
        if (!radiusValidation.isValid) {
            return res.status(400).json({
                error: 'Parâmetro radius inválido',
                details: radiusValidation.error
            });
        }
        
        const { lat: latitude, lng: longitude } = coordValidation.coordinates;
        const finalRadius = radiusValidation.radius;
        
        // Consulta ao BigQuery
        const ctoResults = await BigQueryService.checkCTOsProximity(
            latitude, 
            longitude, 
            finalRadius
        );
        
        // Resposta estruturada
        res.json({
            success: true,
            metadata: {
                coordenadas_consulta: { latitude, longitude },
                raio_metros: finalRadius,
                timestamp: new Date().toISOString(),
                total_resultados: ctoResults.length
            },
            viabilidade_geral: ctoResults.length > 0 ? 'VIÁVEL' : 'NÃO VIÁVEL',
            resultados: ctoResults,
            recomendacoes: this.gerarRecomendacoes(ctoResults)
        });
        
    } catch (error) {
        console.error('Erro no endpoint /viability:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Endpoint completo de infraestrutura
router.get('/infraestrutura', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        const validation = ValidationService.validateCoordinates(lat, lng);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.errors });
        }
        
        const { lat: latitude, lng: longitude } = validation.coordinates;
        
        const resultados = await BigQueryService.checkInfraestruturaCompleta(
            latitude, 
            longitude
        );
        
        res.json({
            success: true,
            consulta: { latitude, longitude },
            ...resultados
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para estatísticas (dashboard admin)
router.get('/estatisticas', async (req, res) => {
    try {
        const estatisticas = await BigQueryService.getEstatisticas();
        res.json({
            success: true,
            ...estatisticas,
            atualizado_em: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Método auxiliar para gerar recomendações
router.gerarRecomendacoes = (ctoResults) => {
    if (ctoResults.length === 0) {
        return ['Nenhuma CTO encontrada no raio especificado'];
    }
    
    const recomendacoes = [];
    const ctoMaisProxima = ctoResults[0];
    
    if (ctoMaisProxima.distancia_metros <= 300) {
        recomendacoes.push('✅ CTO dentro do raio padrão de 300m');
        if (ctoMaisProxima.capacidade_disponivel > 0) {
            recomendacoes.push('✅ Capacidade disponível para nova instalação');
        } else {
            recomendacoes.push('⚠️ CTO sem capacidade disponível - verificar expansão');
        }
    } else {
        recomendacoes.push('⚠️ CTO mais próxima está a mais de 300m');
        recomendacoes.push('💡 Considerar estudo de viabilidade técnica para extensão');
    }
    
    return recomendacoes;
};

module.exports = router;