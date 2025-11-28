import { Router } from 'express';
import {
    makeCreateUserController,
    makeDeleteUserController,
    makeGetUserByIdController,
    makeListUsersController,
    makeLoginUserController,
    makeRefreshTokenController,
    makeUpdateUserController,
} from '../factories/controllers/user.js';
import { auth } from '../middlewares/auth.js';

export const usersRouter = Router();

usersRouter.get('/me', auth, async (request, response) => {
    const getUserByIdController = makeGetUserByIdController();

    const { statusCode, body } = await getUserByIdController.execute({
        ...request,
        params: {
            userId: request.userId,
        },
    });

    response.status(statusCode).send(body);
});

usersRouter.post('/', async (request, response) => {
    const createUserController = makeCreateUserController();

    const { statusCode, body } = await createUserController.execute(request);

    response.status(statusCode).send(body);
});

usersRouter.get('/', auth, async (request, response) => {
    const listUsersController = makeListUsersController();

    const { statusCode, body } = await listUsersController.execute({ query: request.query });

    response.status(statusCode).send(body);
});

usersRouter.patch('/me', auth, async (request, response) => {
    const updateUserController = makeUpdateUserController();

    const { statusCode, body } = await updateUserController.execute({
        ...request,
        params: {
            userId: request.userId,
        },
    });

    response.status(statusCode).send(body);
});

usersRouter.delete('/me', auth, async (request, response) => {
    const deleteUserController = makeDeleteUserController();

    const { statusCode, body } = await deleteUserController.execute({
        ...request,
        params: {
            userId: request.userId,
        },
    });

    response.status(statusCode).send(body);
});

usersRouter.post('/login', async (request, response) => {
    const loginUserController = makeLoginUserController();

    const { statusCode, body } = await loginUserController.execute(request);

    response.status(statusCode).send(body);
});

usersRouter.post('/refresh-token', async (request, response) => {
    const refreshTokenController = makeRefreshTokenController();

    const { statusCode, body } = await refreshTokenController.execute(request);

    response.status(statusCode).send(body);
});

// GET /users/:id - defined after login/refresh to avoid path conflicts
usersRouter.get('/:id', auth, async (request, response) => {
    const getUserByIdController = makeGetUserByIdController();

    const { statusCode, body } = await getUserByIdController.execute({ params: { userId: request.params.id } });

    response.status(statusCode).send(body);
});

usersRouter.put('/:id', auth, async (request, response) => {
    const updateUserController = makeUpdateUserController();

    const { statusCode, body } = await updateUserController.execute({ params: { userId: request.params.id }, body: request.body });

    response.status(statusCode).send(body);
});

usersRouter.delete('/:id', auth, async (request, response) => {
    const deleteUserController = makeDeleteUserController();

    const { statusCode, body } = await deleteUserController.execute({ params: { userId: request.params.id } });

    response.status(statusCode).send(body);
});