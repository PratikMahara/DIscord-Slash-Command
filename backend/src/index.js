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

// CORS — allow frontend
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));

// Raw body capture for Discord signature verification
// MUST come before express.json()
app.use('/api/interactions', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  req.body = JSON.parse(req.body);
  next();
});

// JSON for all other routes
app.use(express.json());

// Routes
app.use('/api/interactions', verifyDiscordRequest, interactionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);


app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});