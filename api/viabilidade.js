import { BigQuery } from "@google-cloud/bigquery";

const credentials = JSON.parse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

const bigquery = new BigQuery({
  projectId: credentials.project_id,
  credentials
});

export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat e lng são obrigatórios" });
  }

  const query = `
    SELECT
      nome_cto,
      ST_DISTANCE(
        geometry,
        ST_GEOGPOINT(@lng, @lat)
      ) AS distancia
    FROM \`elofiber.viabilidade.pontos_rede\`
    WHERE ST_DISTANCE(
      geometry,
      ST_GEOGPOINT(@lng, @lat)
    ) <= 300
    ORDER BY distancia
    LIMIT 1
  `;

  const options = {
    query,
    params: {
      lat: Number(lat),
      lng: Number(lng)
    }
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();

  if (rows.length === 0) {
    return res.json({ viavel: false });
  }

  return res.json({
    viavel: true,
    cto: rows[0].nome_cto,
    distancia: Math.round(rows[0].distancia)
  });
}
