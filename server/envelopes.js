const express = require('express');
const envelopesRouter = express.Router();
const { createError, bodyValidatorCreator, moneyOperate } = require('./utils');
const db = require('./db');
// /envelopes
const required = { title: 'string', budget: 'number' };
const bodyValidator = bodyValidatorCreator(required);

envelopesRouter.param('envelopeId', (req, res, next, id) => {
    const envelope = db.getFromDatabaseById('envelopes', id);
    if (envelope) {
        req.envelope = envelope;
        req.id = id;
        req.transactions = db.getAllFromDatabase('transactions').filter((transaction) => transaction.budgetId === id);
        next();
    } else {
        next(createError(404, `Envelope with id: [${id}] could not be found.`));
    }
});

envelopesRouter.get('/', (req, res, next) => {
    const envelopes = db.getAllFromDatabase('envelopes');
    res.send(envelopes);
});

envelopesRouter.post('/', bodyValidator, (req, res, next) => {
    const added = db.addToDatabase('envelopes', req.typedObject);
    res.status(201).send(added);
});

envelopesRouter.get('/:envelopeId', (req, res, next) => {
    res.send(req.envelope);
});

envelopesRouter.put('/:envelopeId', bodyValidator, (req, res, next) => {
    const updated = db.updateInstanceInDatabase('envelopes', { ...req.typedObject, id: req.id });
    res.send(updated);
});

envelopesRouter.delete('/:envelopeId', (req, res, next) => {
    db.deleteFromDatabasebyId('envelopes', req.id);
    res.status(204).send();
})

// transactions
const ADD = 'add';
const SUBTRACT = 'subtract';
const transactionsRequired = { action: 'string', amount: 'number' };
const transactionsBodyValidator = bodyValidatorCreator(transactionsRequired);

envelopesRouter.get('/:envelopeId/transactions', (req, res, next) => {
    res.send(req.transactions);
});

// add a transaction and update the budget of an envelope
envelopesRouter.post('/:envelopeId/transactions', transactionsBodyValidator, (req, res, next) => {
    const { envelope, transactions } = req;
    const { action, amount } = req.typedObject;

    // update envelope budget
    if (action === ADD) {
        envelope.budget += amount;
    } else if (action === SUBTRACT) {
        envelope.budget -= amount;
    }
    const updatedEnvelope = db.updateInstanceInDatabase('envelopes', { ...envelope, id: req.id });

    // add transaction
    const addedTransaction = db.addToDatabase('transactions', { ...req.typedObject, budgetId: req.id });


    res.send({ envelope: updatedEnvelope, transaction: addedTransaction });
});

// transfer
const transferRequired = { amount: 'number' };
const transferBodyValidator = bodyValidatorCreator(transferRequired);
envelopesRouter.param('from', (req, res, next, from) => {
    const fromEnvelope = db.getFromDatabaseById('envelopes', from);
    if (fromEnvelope) {
        req.fromEnvelope = fromEnvelope;
        req.fromId = from;
        next();
    } else {
        next(createError(404, `From evelope with id: [${to}] could not be found.`));
    }
});

envelopesRouter.param('to', (req, res, next, to) => {
    const toEnvelope = db.getFromDatabaseById('envelopes', to);
    if (toEnvelope) {
        req.toEnvelope = toEnvelope;
        req.toId = to;
        next();
    } else {
        next(createError(404, `To evelope with id: [${to}] could not be found.`));
    }
});
// update envelope.budget for two envelopes
envelopesRouter.post('/transfer/:from/:to', transferBodyValidator, (req, res, next) => {
    const { fromEnvelope, fromId, toEnvelope, toId } = req;
    const { amount } = req.typedObject;
    fromEnvelope.budget = moneyOperate(SUBTRACT, amount, fromEnvelope.budget);
    const updatedFrom = db.updateInstanceInDatabase('envelopes', { ...fromEnvelope, id: fromId });
    toEnvelope.budget = moneyOperate(ADD, amount, toEnvelope.budget);
    const updatedTo = db.updateInstanceInDatabase('envelopes', { ...toEnvelope, id: toId });

    res.send({ fromEnvelope: updatedFrom, toEnvelope: updatedTo });

})

module.exports = envelopesRouter;

