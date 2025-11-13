import express from 'express';
import { usersRouter, ingredientsRouter } from './routes/index.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/ingredients', ingredientsRouter);

export { app };