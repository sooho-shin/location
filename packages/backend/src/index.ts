import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware test
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
