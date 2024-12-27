const createError = require('http-errors');
const contasModel = require('../models/contasModel');
const transferenciasModel = require('../models/transferenciasModel');

async function realizarTransferencia(contaOrigem, contaDestino, valor, token) {
    if (valor < 10) {
        throw createError(422, 'O valor da transferência deve ser maior ou igual a R$10,00.');
    }

    const contaOrigemData = await contasModel.getContaById(contaOrigem);
    const contaDestinoData = await contasModel.getContaById(contaDestino);

    if (!contaOrigemData || !contaDestinoData) {
        throw createError(404, 'Conta de origem ou destino não encontrada.');
    }

    if (!contaOrigemData.ativa || !contaDestinoData.ativa) {
        throw createError(422, 'Conta de origem ou destino está ativa.');
    }

    if (contaOrigemData.saldo <= valor) {
        throw createError(422, 'Saldo insuficiente para realizar a transferência.');
    }

    let autenticada = false;
    if (valor >= 5000) {
        if (!token || token !== '123456') {
            throw createError(401, 'Autenticação necessária para transferências acima de R$5.000,00.');
        }
        autenticada = true;
    }

    await contasModel.atualizarSaldo(contaOrigem, -valor);
    await transferenciasModel.inserirTransferencia(contaOrigem, contaDestino, valor, autenticada);

    return { message: 'Transferência realizada com sucesso.' };
}

async function getTransferencias(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const transferencias = await transferenciasModel.getTransferenciasPaginadas(limit, offset);
    const total = await transferenciasModel.getTotalTransferencias();

    return {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        transferencias,
    };
}

module.exports = {
    realizarTransferencia,
    getTransferencias,
};
