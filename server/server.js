import express from 'express';
import cors from 'cors';
import indexRouter from './routes/index.js';
import { openDatabase } from './db/db-connection.js';

const app = express();
const PORT = 3001;

// Configure CORS to accept requests from localhost:5173 and 5174
app.use(cors({
	origin: ['http://localhost:5173', 'http://localhost:5174'],
	credentials: true
}));

app.use(express.json());
app.use('/', indexRouter);

await openDatabase();

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});