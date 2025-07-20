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
        throw createError(422, 'Conta de origem ou destino está inativa.');
    }

    if (parseFloat(contaOrigemData.saldo) < parseFloat(valor)) {
        console.log(contaOrigemData.saldo, valor)
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
    await contasModel.atualizarSaldo(contaDestino, valor);
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

async function getTransferencia(id) {
    const transferencia = await transferenciasModel.getTransferenciaById(id);

    return transferencia;
}

async function atualizarTransferencia(id, contaOrigem, contaDestino, valor, token) {
    const transferencia = await transferenciasModel.getTransferenciaById(id);
    if (!transferencia) {
        throw createError(404, 'Transferência não encontrada.');
    }

    if (valor < 10) {
        throw createError(422, 'O valor da transferência deve ser maior ou igual a R$10,00.');
    }

    const contaOrigemData = await contasModel.getContaById(contaOrigem);
    const contaDestinoData = await contasModel.getContaById(contaDestino);

    if (!contaOrigemData || !contaDestinoData) {
        throw createError(404, 'Conta de origem ou destino não encontrada.');
    }

    if (!contaOrigemData.ativa || !contaDestinoData.ativa) {
        throw createError(422, 'Conta de origem ou destino está inativa.');
    }

    if (contaOrigemData.saldo < valor) {
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
    await contasModel.atualizarSaldo(contaDestino, valor);

    await transferenciasModel.atualizarTransferencia(id, contaOrigem, contaDestino, valor, autenticada);

    return { message: 'Transferência atualizada com sucesso.' };
}

async function modificarTransferencia(id, campos) {
    const transferencia = await transferenciasModel.getTransferenciaById(id);
    if (!transferencia) {
        throw createError(404, 'Transferência não encontrada.');
    }

    if (campos.valor && campos.valor < 10) {
        throw createError(422, 'O valor da transferência deve ser maior ou igual a R$10,00.');
    }

    let valorAlterado = false;
    if (campos.valor && campos.valor !== transferencia.valor) {
        valorAlterado = true;
    }

    if (campos.contaOrigem) {
        const contaOrigemData = await contasModel.getContaById(campos.contaOrigem);
        if (!contaOrigemData || !contaOrigemData.ativa) {
            throw createError(422, 'Conta de origem inválida ou inativa.');
        }
    }

    if (campos.contaDestino) {
        const contaDestinoData = await contasModel.getContaById(campos.contaDestino);
        if (!contaDestinoData || !contaDestinoData.ativa) {
            throw createError(422, 'Conta de destino inválida ou inativa.');
        }
    }

    if (campos.valor >= 5000) {
        if (!campos.token || campos.token !== '123456') {
            throw createError(401, 'Autenticação necessária para transferências acima de R$5.000,00.');
        }
        campos.autenticada = true;
    }

    if (valorAlterado) {
        const contaOrigemData = await contasModel.getContaById(transferencia.conta_origem_id);
        const contaDestinoData = await contasModel.getContaById(transferencia.conta_destino_id);

        if (!contaOrigemData || !contaDestinoData) {
            throw createError(404, 'Conta de origem ou destino não encontrada.');
        }

        if (contaOrigemData.saldo < campos.valor) {
            throw createError(422, 'Saldo insuficiente para realizar a transferência.');
        }

        // Atualizar o saldo das contas
        await contasModel.atualizarSaldo(transferencia.conta_origem_id, transferencia.valor);
        await contasModel.atualizarSaldo(transferencia.conta_destino_id, -transferencia.valor);

        await contasModel.atualizarSaldo(campos.contaOrigem || transferencia.conta_origem_id, -campos.valor);
        await contasModel.atualizarSaldo(campos.contaDestino || transferencia.conta_destino_id, campos.valor);
    }

    await transferenciasModel.modificarTransferencia(id, campos);

    return { message: 'Transferência modificada com sucesso.' };
}

async function removerTransferencia(id) {
    const transferencia = await transferenciasModel.getTransferenciaById(id);
    if (!transferencia) {
        throw createError(404, 'Transferência não encontrada.');
    }

    const contaOrigemData = await contasModel.getContaById(transferencia.conta_origem_id);
    const contaDestinoData = await contasModel.getContaById(transferencia.conta_destino_id);

    if (!contaOrigemData || !contaDestinoData) {
        throw createError(404, 'Conta de origem ou destino não encontrada.');
    }

    // Reverter o saldo das contas
    await contasModel.atualizarSaldo(transferencia.conta_origem_id, transferencia.valor);
    await contasModel.atualizarSaldo(transferencia.conta_destino_id, -transferencia.valor);

    await transferenciasModel.removerTransferencia(id);

    return { message: 'Transferência removida com sucesso.' };
}


module.exports = {
    realizarTransferencia,
    getTransferencias,
    atualizarTransferencia,
    modificarTransferencia,
    removerTransferencia,
    getTransferencia
};
