const express = require('express');
const apiRouter = express.Router();
const envelopesRouter = require('./envelopes');

apiRouter.use('/envelopes', envelopesRouter);

module.exports = apiRouter;