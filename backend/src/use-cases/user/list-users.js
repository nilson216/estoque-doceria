export class ListUsersUseCase {
    constructor(listUsersRepository) {
        this.listUsersRepository = listUsersRepository;
    }

    async execute(params = {}) {
        return await this.listUsersRepository.execute(params);
    }
}
