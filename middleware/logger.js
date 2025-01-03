const morgan = require('morgan');

const captureResponseBody = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    res.locals.body = body; 
    return originalSend.call(this, body); 
  };
  next();
};

morgan.token('req-body', (req) => JSON.stringify(req.body) || '{}');
morgan.token('res-body', (req, res) => res.locals.body || '');

const logFormat =
  ':method :url :status :response-time ms - Req Body: :req-body - Res Body: :res-body';

const requestLogger = morgan(logFormat);

module.exports = {
  captureResponseBody, 
  requestLogger, 
};