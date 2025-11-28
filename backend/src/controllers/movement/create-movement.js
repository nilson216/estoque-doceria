import { badRequest, created, serverError, unauthorized } from '../helpers/index.js';
import { ZodError } from 'zod';
import { createMovementSchema } from '../../schemas/movement.js';
import { InsufficientStockError, IngredientNotFoundError } from '../../errors/ingredient.js';

/*
    CreateMovementController
    - Responsabilidade: receber requisições HTTP para criar uma movimentação (ENTRADA/SAIDA), validar a entrada,
        exigir autenticação (requer `req.userId` populado pelo middleware `auth`) e delegar
        a operação de domínio para o CreateMovementUseCase.
    - Entradas: objeto `httpRequest` esperado conter `params.ingredientId`, `body` com { type, quantity },
        e `userId` (do middleware).
    - Saídas: utiliza helpers de controller para retornar respostas HTTP estruturadas: `created`, `badRequest`,
        `unauthorized` ou `serverError`.
    - Efeitos colaterais: registra logs de validação e erros de domínio para facilitar o debugging.
    - Observações para mantenedores: o use-case retorna tanto a movimentação criada quanto o ingrediente atualizado
        (para que os chamadores possam reagir às mudanças de estoque). O roteamento e a construção estão em
        `factories/controllers` e `routes/ingredients.js` ou `routes/movements.js`.
*/

export class CreateMovementController {
    constructor(createMovementUseCase) {
        this.createMovementUseCase = createMovementUseCase;
    }

    async execute(httpRequest) {
        try {
            // require authenticated userId provided by middleware
            const userId = httpRequest.userId || httpRequest.userId === 0 ? httpRequest.userId : null;
            if (!userId) {
                return unauthorized();
            }
            // build params ensuring ingredientId comes from route params and quantity is numeric
            const params = { ...(httpRequest.body || {}), ingredientId: httpRequest.params?.ingredientId };
            if (params.quantity !== undefined) {
                // coerce numeric strings to numbers for validation
                params.quantity = Number(params.quantity);
            }
            // inject userId coming from middleware
            params.userId = userId;
            const parsed = await createMovementSchema.parseAsync(params);
            // ensure userId and ingredientId are present in parsed
            parsed.userId = params.userId;
            parsed.ingredientId = params.ingredientId;
            const result = await this.createMovementUseCase.execute(parsed);
            // return both movement and updated ingredient so callers can react to stock changes
            return created(result);
        } catch (error) {
                console.error('CreateMovementController caught error:', error && (error.stack || error.message || String(error)));
                if (error instanceof ZodError) {
                    // return detailed validation errors to help debugging
                    console.error('Zod validation issues:', error.errors);
                    const messages = error.errors?.map(e => e.message) || ['Validation error'];
                    return badRequest({ message: messages.join('; '), issues: error.errors });
                }
            if (error instanceof InsufficientStockError || error instanceof IngredientNotFoundError) {
                console.error('Domain error:', error.message);
                return badRequest({ message: error.message });
            }
            console.error('Unhandled error in CreateMovementController:', error);
            return serverError();
        }
    }
}