import express from 'express';
import indexRouter from './routes/index.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/', indexRouter);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});