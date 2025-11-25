import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

import { usersRouter, ingredientsRouter } from './routes/index.js';
import { movementsRouter } from './routes/movements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o Swagger
const openApiSpec = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../docs/swagger.json'), 'utf8')
);

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
// Redirect the root URL to the Swagger UI so the service root is useful.
app.get('/', (req, res) => {
    return res.redirect('/api/docs');
});

app.use('/api/users', usersRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/movements', movementsRouter);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

export { app };
