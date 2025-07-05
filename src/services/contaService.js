const createError = require('http-errors');
const contasModel = require('../models/contasModel');

async function getContas(page = 1, limit = 10) {
    const contas = await contasModel.getContas();

    return {
        contas
    };
}

async function getContaById(id) {
    const contas = await contasModel.getContaById(id)

    if (!contas) {
        throw createError(404, 'Conta não encontrada.');
    }
    
    return contas;
}

module.exports = {
    getContas,
    getContaById
};
