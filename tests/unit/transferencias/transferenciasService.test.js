const sinon = require('sinon');
const expect = require('chai').expect;
const contasModel = require('../../../models/contasModel');
const transferenciasModel = require('../../../models/transferenciasModel');
const transferenciasService = require('../../../services/transferenciasService');

describe('Testando o método realizarTransferencia', () => {
    let getContaByIdStub;
    let atualizarSaldoStub;
    let inserirTransferenciaStub;

    beforeEach(() => {
        getContaByIdStub = sinon.stub(contasModel, 'getContaById');
        atualizarSaldoStub = sinon.stub(contasModel, 'atualizarSaldo').resolves();
        inserirTransferenciaStub = sinon.stub(transferenciasModel, 'inserirTransferencia').resolves();
    });

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
        getContaByIdStub.onCall(0).resolves(null);
        getContaByIdStub.onCall(1).resolves({ ativa: true, saldo: 1000 });

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