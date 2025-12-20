// backend/services/bigquery.service.js
const BigQueryConfig = require('../config/bigquery.config');
const { BigQuery } = require('@google-cloud/bigquery');

class BigQueryService {
    constructor() {
        this.config = BigQueryConfig;
        this.bigquery = this.config.bigquery;
        this.views = this.config.getViews();
    }

    async checkCTOsProximity(latitude, longitude, radius = 300) {
        // Consulta otimizada para sua view ctos_viabilidade_base
        const query = `
            WITH cliente_location AS (
                SELECT ST_GEOGPOINT(@longitude, @latitude) as point
            )
            SELECT 
                cto_id,
                nome,
                endereco,
                capacidade_total,
                capacidade_disponivel,
                ST_DISTANCE(cl.point, cto_location) as distancia_metros,
                ST_X(cto_location) as longitude_cto,
                ST_Y(cto_location) as latitude_cto,
                status,
                data_instalacao
            FROM ${this.config.getFullTableName(this.views.CTOS)} as c,
                cliente_location as cl
            WHERE ST_DWITHIN(cl.point, c.cto_location, @radius)
            ORDER BY distancia_metros
            LIMIT 20;
        `;

        const options = {
            query: query,
            params: {
                latitude: latitude,
                longitude: longitude,
                radius: radius
            },
            location: this.config.location
        };

        try {
            const [job] = await this.bigquery.createQueryJob(options);
            const [rows] = await job.getQueryResults();
            
            // Adiciona classificação de viabilidade
            return rows.map(row => ({
                ...row,
                viabilidade: this.classificarViabilidade(row.distancia_metros, row.capacidade_disponivel)
            }));
        } catch (error) {
            console.error('Erro na consulta de CTOs:', error);
            throw new Error(`Falha ao consultar CTOs: ${error.message}`);
        }
    }

    async checkPOPSProximity(latitude, longitude, radius = 1000) {
        // Consulta para POPs (OLTs) próximas
        const query = `
            SELECT 
                pop_id,
                nome_pop,
                endereco,
                tipo_olt,
                portas_disponiveis,
                capacidade_total,
                ST_DISTANCE(
                    ST_GEOGPOINT(@longitude, @latitude),
                    pop_location
                ) as distancia_metros,
                status
            FROM ${this.config.getFullTableName(this.views.POPS)}
            WHERE ST_DWITHIN(
                ST_GEOGPOINT(@longitude, @latitude),
                pop_location,
                @radius
            )
            ORDER BY distancia_metros
            LIMIT 10;
        `;

        const options = {
            query: query,
            params: { latitude, longitude, radius },
            location: this.config.location
        };

        const [job] = await this.bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();
        return rows;
    }

    async checkInfraestruturaCompleta(latitude, longitude) {
        // Consulta completa: CTOs + POPs + Portos
        const ctoPromise = this.checkCTOsProximity(latitude, longitude, 300);
        const popPromise = this.checkPOPSProximity(latitude, longitude, 1000);
        
        const [ctos, pops] = await Promise.all([ctoPromise, popPromise]);
        
        return {
            cto_disponiveis: ctos.length,
            pop_disponiveis: pops.length,
            cto_mais_proxima: ctos.length > 0 ? ctos[0] : null,
            pop_mais_proximo: pops.length > 0 ? pops[0] : null,
            lista_ctos: ctos,
            lista_pops: pops
        };
    }

    classificarViabilidade(distancia, capacidadeDisponivel) {
        if (distancia <= 300 && capacidadeDisponivel > 0) {
            return 'ALTA - Dentro do raio e com capacidade';
        } else if (distancia <= 300 && capacidadeDisponivel === 0) {
            return 'MÉDIA - Dentro do raio mas sem capacidade';
        } else if (distancia <= 500 && capacidadeDisponivel > 0) {
            return 'MÉDIA - Fora do raio padrão, com capacidade';
        } else {
            return 'BAIXA - Fora do raio ou sem capacidade';
        }
    }

    async getEstatisticas() {
        // Método para dashboard administrativo
        const query = `
            SELECT 
                COUNT(*) as total_ctos,
                SUM(CASE WHEN capacidade_disponivel > 0 THEN 1 ELSE 0 END) as cto_com_capacidade,
                SUM(CASE WHEN capacidade_disponivel = 0 THEN 1 ELSE 0 END) as cto_sem_capacidade,
                AVG(capacidade_disponivel) as capacidade_media
            FROM ${this.config.getFullTableName(this.views.CTOS)}
        `;

        const [job] = await this.bigquery.createQueryJob({
            query: query,
            location: this.config.location
        });
        
        const [rows] = await job.getQueryResults();
        return rows[0];
    }
}

module.exports = new BigQueryService();