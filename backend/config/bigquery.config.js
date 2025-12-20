// backend/config/bigquery.config.js
const { BigQuery } = require('@google-cloud/bigquery');

class BigQueryConfig {
    constructor() {
        this.projectId = process.env.GCP_PROJECT_ID || 'elofiber';
        this.datasetId = process.env.BIGQUERY_DATASET || 'viabilidade';
        this.location = process.env.BIGQUERY_REGION || 'southamerica-east1';
        
        this.bigquery = new BigQuery({
            projectId: this.projectId,
            location: this.location
        });
    }

    getDataset() {
        return this.datasetId;
    }

    getFullTableName(tableName) {
        return `\`${this.projectId}.${this.datasetId}.${tableName}\``;
    }

    getViews() {
        return {
            CTOS: 'ctos_viabilidade_base', // Sua view principal
            CTOS_DETAILS: 'iii\' ctos',    // View detalhada (escape da aspa)
            POPS: 'pops',
            PORTOS_CLASSIFICADOS: 'portos_classificados',
            PORTOS_REDE: 'portos_rede'
        };
    }
}

module.exports = new BigQueryConfig();