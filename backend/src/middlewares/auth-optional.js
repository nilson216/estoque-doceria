import jwt from 'jsonwebtoken';

/*
    middleware `authOptional`
    - Tenta extrair e validar um token Bearer em `Authorization`.
    - Se o token estiver presente e válido, define `req.userId`.
    - Se o token estiver ausente ou inválido, apenas segue sem interromper (req.userId fica undefined).
*/

export const authOptional = (request, response, next) => {
    try {
        const header = request.headers?.authorization;
        if (!header) return next();
        const accessToken = header.split('Bearer ')[1];
        if (!accessToken) return next();

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
            if (decoded && decoded.userId) request.userId = decoded.userId;
        } catch (err) {
            // token inválido — não bloqueamos, apenas não autenticamos
            console.warn('authOptional: failed to verify token');
        }

        return next();
    } catch (error) {
        // Não interromper a requisição: apenas prosseguir sem userId
        return next();
    }
};
