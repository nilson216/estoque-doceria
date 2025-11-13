import { prisma } from '../../../../prisma/prisma.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { UserNotFoundError } from '../../../errors/index.js';

export class PostgresUpdateUserRepository {
    async execute(userId, updateUserParams) {
        try {
            return await prisma.user.update({
                where: {
                    id: userId,
                },
                data: updateUserParams,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new UserNotFoundError(userId);
                }
            }

            throw error;
        }
    }
}