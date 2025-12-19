import express from 'express';
import cors from 'cors';
import { bigquery } from './bigquery.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.post('/viabilidade', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    const query = `
      SELECT
        id_cto,
        nome_cto,
        ST_DISTANCE(
          geography,
          ST_GEOGPOINT(@lon, @lat)
        ) AS distancia_metros
      FROM \`elofiber.viabilidade.ctos_viabilidade_base\`
      WHERE ST_DWITHIN(
        geography,
        ST_GEOGPOINT(@lon, @lat),
        raio_atendimento_m
      )
      ORDER BY distancia_metros
      LIMIT 1
    `;

    const options = {
      query,
      params: {
        lat: Number(latitude),
        lon: Number(longitude)
      }
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      return res.json({
        viavel: false,
        mensagem: 'Nenhuma CTO dentro do raio'
      });
    }

    res.json({
      viavel: true,
      cto: rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
