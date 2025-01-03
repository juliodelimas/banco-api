const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const usuariosModel = require('../models/usuariosModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

async function autenticarUsuario(username, senha) {
    if (!username || !senha) {
        throw createError(400, 'Usuário e senha são obrigatórios.');
    }

    const usuario = await usuariosModel.getUsuarioByCredenciais(username, senha);

    if (!usuario) {
        throw createError(401, 'Usuário ou senha inválidos.');
    }

    return usuario;
}

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, username: usuario.username },
        JWT_SECRET,
        { expiresIn: '1y' }
    );
}

module.exports = {
    autenticarUsuario,
    gerarToken,
};
