import { InsufficientStockError, IngredientNotFoundError } from '../../errors/ingredient.js';
import { prisma } from '../../../prisma/prisma.js';

/*
    CreateMovementUseCase
    - Responsabilidade: executar a lógica de domínio para criar uma movimentação e atualizar o estoque
        do ingrediente relacionado em uma única operação atômica (transação Prisma).
    - Entradas: { ingredientId, userId, type, quantity }
    - Comportamento: valida regras de domínio (ingrediente existe, estoque suficiente para SAIDA) e realiza uma
        transação que (1) cria o registro de movimentação e (2) atualiza o estoque do ingrediente.
    - Retorna: um objeto { createdMovement, updatedIngredient } para que camadas superiores (controllers/UI)
        possam reagir às alterações de estoque.
    - Observações para mantenedores: os repositórios passados ao construtor devem aceitar um cliente
        Prisma opcional para participar de transações (ver implementações Postgres*Repository).
*/

export class CreateMovementUseCase {
    constructor(getIngredientRepo, updateIngredientRepo, createMovementRepo, idGeneratorAdapter) {
        this.getIngredientRepo = getIngredientRepo;
        this.updateIngredientRepo = updateIngredientRepo;
        this.createMovementRepo = createMovementRepo;
        this.idGeneratorAdapter = idGeneratorAdapter;
    }

    async execute({ ingredientId, userId, type, quantity, observacao }) {
        // obtém ingrediente atual — validar se o requisitante tem acesso (owner or global)
        const ingredient = await this.getIngredientRepo.execute(ingredientId, userId ?? null);
        if (!ingredient) {
            throw new IngredientNotFoundError(ingredientId);
        }

        // valida saída com estoque
        if (type === 'SAIDA' && ingredient.stockQuantity < quantity) {
            throw new InsufficientStockError(ingredientId);
        }

        const movementId = this.idGeneratorAdapter.execute();
        const newStock = type === 'ENTRADA'
            ? ingredient.stockQuantity + quantity
            : ingredient.stockQuantity - quantity;

        // executa transação: cria movimento e atualiza stock (e soft-delete se zerar)
        const result = await prisma.$transaction(async (tx) => {
            const createdMovement = await this.createMovementRepo.execute({
                id: movementId,
                type,
                quantity,
                observacao: observacao ?? null,
                ingredientId,
                userId,
            }, tx);

            const updateParams = { stockQuantity: newStock, __allowStockUpdate: true };
            if (newStock === 0) {
                updateParams.deletedAt = new Date();
            }

            // pass the ingredient owner id so repository ownership check passes
            const updatedIngredient = await this.updateIngredientRepo.execute(ingredientId, updateParams, ingredient.userId ?? null, tx);
            return { createdMovement, updatedIngredient };
        });
        return result;
    }
}