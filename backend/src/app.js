import express from 'express';
import { usersRouter, ingredientsRouter } from './routes/index.js';
import { movementsRouter } from './routes/movements.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiSpec = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../docs/swagger.json'), 'utf8')
);
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/movements', movementsRouter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

export { app };