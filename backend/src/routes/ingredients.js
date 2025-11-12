import { Router } from "express";
import {
  makeCreateingredientsController,
  makeDeleteingredientsController,
  makeGetingredientssByUserIdController,
  makeUpdateingredientsController,
} from "../factories/controllers/ingredients.js";
import { auth } from "../lib/auth.js";

export const ingredientssRouter = Router();

// Todas as rotas daqui exigem login
ingredientssRouter.use(auth.protect);

// ✅ Pega todos os ingredientes do usuário logado
ingredientssRouter.get("/me", async (req, res) => {
  const getingredientssByUserIdController = makeGetingredientssByUserIdController();

  const { statusCode, body } =
    await getingredientssByUserIdController.execute({
      ...req,
      query: {
        ...req.query,
        from: req.query.from,
        to: req.query.to,
        userId: req.user.id, // 👈 agora vem de req.user.id
      },
    });

  res.status(statusCode).send(body);
});

// ✅ Cria ingrediente vinculado ao usuário logado
ingredientssRouter.post("/me", async (req, res) => {
  const createingredientsController = makeCreateingredientsController();

  const { statusCode, body } = await createingredientsController.execute({
    ...req,
    body: {
      ...req.body,
      user_id: req.user.id, // 👈 usa o ID do usuário logado
    },
  });

  res.status(statusCode).send(body);
});

// ✅ Atualiza ingrediente
ingredientssRouter.patch("/me/:ingredientsId", async (req, res) => {
  const updateingredientsController = makeUpdateingredientsController();

  const { statusCode, body } = await updateingredientsController.execute({
    ...req,
    body: {
      ...req.body,
      user_id: req.user.id,
    },
  });

  res.status(statusCode).send(body);
});

// ✅ Deleta ingrediente
ingredientssRouter.delete("/me/:ingredientsId", async (req, res) => {
  const deleteingredientsController = makeDeleteingredientsController();

  const { statusCode, body } = await deleteingredientsController.execute({
    params: {
      ingredientsId: req.params.ingredientsId,
      user_id: req.user.id,
    },
  });

  res.status(statusCode).send(body);
});
