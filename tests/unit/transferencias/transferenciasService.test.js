const sinon = require('sinon');
const expect = require('chai').expect;
const contasModel = require('../../../models/contasModel');
const transferenciasService = require('../../../services/transferenciasService');

describe('Testando o método realizarTransferencia', () => {
    it('deve lançar erro quando o valor é menor que R$ 10', async () => {
        try {
            await transferenciasService.realizarTransferencia(1, 2, 9.99, null);
            expect.fail('Deveria ter falhado, pois o valor é abaixo de R$ 10');
        } catch (err) {
            expect(err.status).to.equal(422);
            expect(err.message).to.equal('O valor da transferência deve ser maior ou igual a R$10,00.');
        }
    });

    it('deve lançar erro quando o valor for maior ou igual a R$ 10 mas a conta de origem não for encontrada', async () => {
        // Preparando o Stub (Mock)
        const getContaByIdStub = sinon.stub(contasModel, 'getContaById');
        getContaByIdStub.withArgs(1).resolves(null);
        getContaByIdStub.withArgs(2).resolves({ ativa: true, saldo: 1000 });

        try {
            await transferenciasService.realizarTransferencia(1, 2, 10, null);
            expect.fail('Deveria ter falhado, pois a conta origem retornou null');
        } catch (err) {
            expect(err.status).to.equal(404);
            expect(err.message).to.equal('Conta de origem ou destino não encontrada.');
        }
    });

    afterEach(() => {
        sinon.restore(); 
    });
});