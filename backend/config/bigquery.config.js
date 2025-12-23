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

    // Agora temos apenas uma view principal
    getViews() {
        return {
            VIABILIDADE: 'vw_viabilidade', // Sua nova view
            // Views antigas (remover se não existirem mais)
            CTOS_VIABILIDADE: 'vw_viabilidade' // Aponta para mesma view
        };
    }
}

module.exports = new BigQueryConfig();