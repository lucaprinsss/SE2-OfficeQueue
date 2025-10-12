import express from 'express';
import indexRouter from './routes/index.js';
import { openDatabase } from './db/db-connection.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/', indexRouter);

await openDatabase();

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});