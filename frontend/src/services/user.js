import { protectedApi, publicApi } from "@/lib/axios"

/**
 * @typedef {Object} UserTokens
 * @property {string} accessToken - Token de acesso
 * @property {string} refreshToken - Token de renovação
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} id - ID do usuário
 * @property {string} email - Email do usuário
 * @property {string} firstName - Nome do usuário
 * @property {string} lastName - Sobrenome do usuário
 * @property {UserTokens} [tokens] - Tokens de autenticação (somente login e signup)
 */

/**
 * @typedef {Object} UserInputSignup
 * @property {string} firstName - Nome do usuário
 * @property {string} lastName - Sobrenome do usuário
 * @property {string} email - Email do usuário
 * @property {string} password - Senha do usuário
 */

/**
 * @typedef {Object} UserInputLogin
 * @property {string} email - Email do usuário
 * @property {string} password - Senha do usuário
 */

/**
 * Service layer responsável por simplificar chamadas API
 * relacionadas ao usuário.
 * Camada utilizada pelo front-end para isolar regras de comunicação com o backend.
 */
export const UserService = {

  /**
   * Cria um novo usuário na API.
   *
   * @async
   * @param {UserInputSignup} input - Dados do usuário a ser criado
   * @returns {Promise<UserResponse>} Retorna o usuário criado com tokens
   */
  signup: async (input) => {
    const response = await publicApi.post('/users', {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      password: input.password,
    })

    return {
      id: response.data.id,
      email: response.data.email,
      firstName: response.data.first_name,
      lastName: response.data.last_name,
      tokens: response.data.tokens,
    }
  },

  /**
   * Realiza login do usuário na API.
   *
   * @async
   * @param {UserInputLogin} input - Credenciais do usuário
   * @returns {Promise<UserResponse>} Retorna dados do usuário e tokens
   */
  login: async (input) => {
    const response = await publicApi.post('/users/login', {
      email: input.email,
      password: input.password,
    })

    return {
      id: response.data.id,
      email: response.data.email,
      firstName: response.data.first_name,
      lastName: response.data.last_name,
      tokens: response.data.tokens,
    }
  },

  /**
   * Busca os dados do usuário autenticado.
   *
   * @async
   * @returns {Promise<UserResponse>} Retorna dados do usuário logado (sem tokens)
   */
  me: async () => {
    const response = await protectedApi.get('/users/me')

    return {
      id: response.data.id,
      email: response.data.email,
      firstName: response.data.first_name,
      lastName: response.data.last_name,
    }
  }
}
