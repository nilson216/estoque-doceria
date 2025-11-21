import { badRequest, created, serverError } from '../helpers/index.js';
import { createIngredientSchema } from '../../schemas/ingredient.js';
import { ZodError } from 'zod';

/*
    CreateIngredientController
    - Responsabilidade: tratar requisições HTTP que criam um novo Ingredient. Valida a entrada via
        `createIngredientSchema` e delega ao use-case/repositório responsável pela criação.
    - Entradas: `httpRequest.body` com os campos do ingrediente. Se a requisição for autenticada
        (`httpRequest.userId`), o controller repassa esse `userId` para que o backend
        possa criar uma movimentação inicial de forma atômica (se fornecida pelo cliente).
    - Saídas: respostas HTTP estruturadas usando `created`, `badRequest` e `serverError`.
    - Observações: preservar `userId` permite que o repositório registre a movimentação inicial
        dentro da mesma transação (ver `PostgresCreateIngredientRepository`).
*/

export class CreateIngredientController {
    constructor(createIngredientUseCase) {
        this.createIngredientUseCase = createIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            const params = httpRequest.body;
            const parsed = await createIngredientSchema.parseAsync(params);
        
            const userId = httpRequest.userId || null;
            const createdIngredient = await this.createIngredientUseCase.execute(parsed, userId);
            return created(createdIngredient);
        } catch (error) {
            if (error instanceof ZodError) {
                return badRequest({ message: error.errors?.[0]?.message || 'Validation error' });
            }
            console.error(error);
            return serverError();
        }
    }
}

