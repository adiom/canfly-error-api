const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Загружаем переменные окружения из .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const port = process.env.PORT || 3001;

// Проверяем наличие строки подключения
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

// Создаем пул соединений с базой данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Инициализируем таблицу, если она не существует
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS errors (
        id SERIAL PRIMARY KEY,
        path VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip VARCHAR(45),
        user_agent TEXT,
        referer TEXT,
        country VARCHAR(100),
        city VARCHAR(100)
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Маршрут для сохранения данных о посещении
app.post('/api/track-error', async (req, res) => {
  const { path, userAgent, referer } = req.body;
  
  // Получаем IP из заголовков
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO errors (path, ip, user_agent, referer)
         VALUES ($1, $2, $3, $4)`,
        [path, ip, userAgent, referer]
      );
      res.status(200).json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving visitor data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Маршрут для получения данных о посещениях
app.get('/api/errors', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM errors ORDER BY timestamp DESC LIMIT 1000`
      );
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Запускаем сервер
app.listen(port, async () => {
  await initializeDatabase();
  console.log(`API service running on port ${port}`);
}); 