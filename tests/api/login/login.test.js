const request = require('supertest')
const Ajv = require('ajv');
const { expect } = require('chai')
const baseURL = 'http://localhost:3000'

describe('Login', () => {
    it('com credenciais válidas deve gerar token', async () => {
        // Arrange
        const usuario = {
            username: 'julio.lima',
            senha: '123456'
        }

        const ajv = new Ajv()
        const validate = ajv.compile({
            type: 'object',
            properties: {
                token: { type: 'string' }
            },
            required: ['token'],
            additionalProperties: false
        })

        // Act
        const resposta = await request(baseURL)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send(usuario)
        
        const validacaoResposta = validate(resposta.body)

        // Assert
        expect(resposta.status).to.equal(200)
        expect(validacaoResposta).to.be.true
    })
})