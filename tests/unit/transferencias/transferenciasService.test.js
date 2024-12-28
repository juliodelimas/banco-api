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

    it('deve lançar erro quando a conta de origem não for encontrada', async () => {
        getContaByIdStub.onCall(0).resolves(null);
        getContaByIdStub.onCall(1).resolves({ ativa: true, saldo: 1000 });

        try {
            await transferenciasService.realizarTransferencia(1, 2, 100, null);
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