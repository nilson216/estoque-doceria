import express from 'express';
import { usersRouter, transactionsRouter } from './routes/index.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);


export { app };