import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyDiscordRequest } from './middleware/verifyDiscord.js';
import interactionsRouter from './routes/interactions.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));

// Health check — no body parsing needed
app.get('/health', (req, res) => res.json({ status: 'ok' }));


app.post('/api/interactions',
  express.raw({ type: '*/*' }),
  (req, res, next) => {
    // req.body is a Buffer here
    req.rawBody = req.body.toString('utf-8');
    try {
      req.body = JSON.parse(req.rawBody);
    } catch (e) {
      console.error('Failed to parse body:', req.rawBody);
      return res.status(400).send('Invalid JSON');
    }
    next();
  },
  verifyDiscordRequest,
  interactionsRouter
);

// JSON for all other routes — AFTER the interactions route
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});