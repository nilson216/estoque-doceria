import jwt from 'jsonwebtoken';

/*
    middleware `auth`
    - Responsabilidade: verificar o token Bearer no header `Authorization` e, se válido,
        anexar `request.userId` com o id do usuário autenticado.
    - Comportamento: retorna 401 quando o token está ausente ou inválido. Em caso de sucesso chama `next()`.
    - Observações: os controllers dependem de `req.userId` estar presente nas rotas protegidas. Guarde
        o segredo do token em `process.env.JWT_ACCESS_TOKEN_SECRET` e garanta que o serviço de
        autenticação emita tokens com a claim `userId`.
*/

export const auth = (request, response, next) => {
    try {
        // pegar o access token do header
        const accessToken = request.headers?.authorization?.split('Bearer ')[1];
        if (!accessToken) {
            return response.status(401).send({ message: 'Unauthorized' });
        }
        // verificar se o access token é válido
        const decodedToken = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN_SECRET,
        );
        if (!decodedToken) {
            return response.status(401).send({ message: 'Unauthorized' });
        }
        request.userId = decodedToken.userId;
        // se for válido, eu deixo a requisição prosseguir
        next();
    } catch (error) {
        console.error(error);
        return response.status(401).send({ message: 'Unauthorized' });
    }
};