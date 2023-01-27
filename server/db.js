const faker = require('faker');
const randomDollarAmount = (min, max) => parseFloat((min + Math.random() * (max - min)).toFixed(2));
let envelopeIdCounter = 1;
const titles = ['Housing', 'Transportation', 'Food', 'Utilities', 'Medical/Healthcare', 'Insurance',
    'Taxes', 'Education/Childcare', 'Debt', 'Household Items/Supplies', 'Personal Care', 'Clothing',
    'Entertainment/Subscriptions', 'Travel', 'Pets', 'Gifts/Donations', 'Miscellaneous'];

const createEnvelope = () => {
    const randomTitleIndex = Math.floor(Math.random() * titles.length);
    const randomTitle = titles[randomTitleIndex];
    titles.splice(randomTitleIndex, 1);

    return {
        id: `${envelopeIdCounter++}`,
        title: randomTitle,
        budget: randomDollarAmount(100, 600)
    }
}

let transactionIdCounter = 1;

const createTransaction = (budgetId) => {
    return {
        id: `${transactionIdCounter++}`,
        action: ['add', 'subtract'][Math.floor(Math.random() * 2)],
        amount: randomDollarAmount(1, 50),
        budgetId: `${budgetId}`,
    }
}

let ideaIdCounter = 1;
const companies = [
    'Codecademy',
    'Uber',
    'Snapchat',
    'Facebook',
    'Microservices',
    'Pets.com',
];

const createIdea = () => {
    const noun = faker.company.bsNoun();
    const name = companies[Math.floor(Math.random() * companies.length)];
    let weeklyRevenue = 0;
    let numWeeks = 0;
    while (weeklyRevenue * numWeeks < 1000000) {
        weeklyRevenue = Math.floor(Math.random() * 123562);
        numWeeks = Math.floor(Math.random() * 104) + 6;
    }

    return {
        id: `${ideaIdCounter++}`,
        name: `${name} but for ${noun}`,
        description: 'The name says it all!!!',
        weeklyRevenue: weeklyRevenue,
        numWeeks: numWeeks,
    }
}

let meetingIdCounter = 1;

const createMeeting = () => {
    const options = [`Discussion about`, `Meeting for`, `Brainstorm`];
    const option = options[Math.floor(Math.random() * options.length)];
    const date = new Date(faker.date.future());
    return {
        id: `${meetingIdCounter++}`,
        time: date.toTimeString().slice(0, 5),
        date: date,
        day: date.toDateString(),
        note: `${option} ${faker.company.catchPhrase()}`,
    }
}

const allEnvelopes = new Array(10).fill(0).map(createEnvelope);
const allIdeas = new Array(10).fill(0).map(createIdea);
const allTransactions = allEnvelopes.map(envelope => createTransaction(envelope.id));
const allMeetings = new Array(3).fill(0).map(createMeeting);

const isValidEnvelope = (instance) => {
    instance.title = instance.title || '';
    instance.budget = instance.budget || '';
    if (typeof instance.title !== 'string') {
        throw new Error('Envelope\'s title must be a string.');
    }
    if (!isNaN(parseFloat(instance.budget)) && isFinite(instance.budget)) {
        instance.budget = Number(instance.budget);
    } else {
        throw new Error('Envelope\'s budget must be a number.');
    }
    return true;
}

const isValidIdea = (instance) => {
    instance.name = instance.name || '';
    instance.description = instance.description || '';
    if (typeof instance.name !== 'string' || typeof instance.description !== 'string') {
        throw new Error('Idea\'s name and description must be strings');
    }
    if (!isNaN(parseFloat(instance.numWeeks)) && isFinite(instance.numWeeks)) {
        instance.numWeeks = Number(instance.numWeeks);
    } else {
        throw new Error('Idea\'s numWeeks must be a number.');
    }
    if (!isNaN(parseFloat(instance.weeklyRevenue)) && isFinite(instance.weeklyRevenue)) {
        instance.weeklyRevenue = Number(instance.weeklyRevenue);
    } else {
        throw new Error('Idea\'s weeklyRevenue must be a number.');
    }
    return true;
}

const isValidTransaction = (instance) => {
    instance.action = instance.action || '';
    instance.amount = instance.amount || '';
    instance.budgetId = instance.budgetId || '';
    if (typeof instance.action !== 'string') {
        throw new Error('Transaction\'s action must be a string');
    }
    if (!isNaN(parseFloat(instance.amount)) && isFinite(instance.amount)) {
        instance.amount = Number(instance.amount);
    } else {
        throw new Error('Transaction\'s amount must be a number.');
    }
    console.log('instance.id', instance.budgetId, db.allEnvelopes.data);
    let isValidEnvelopeId = db.allEnvelopes.data.find((envelope) => {
        return envelope.id === instance.budgetId;
    });
    if (!isValidEnvelopeId) {
        throw new Error('Transaction must have a valid envelopeId that actually exists in the database');
    }
    return true;
}

const isValidMeeting = (instance) => {
    if (typeof instance.time !== 'string' || instance.time.length < 4) {
        throw new Error('Meeting time must be valid!');
    }
    if (!instance.date instanceof Date) {
        throw new Error('Meeting date must be a JS Date object');
    }
    if (!instance.day || typeof instance.day !== 'string') {
        throw new Error('Meeting must have a day property');
    }
    if (!instance.note || typeof instance.note !== 'string') {
        throw new Error('Meeting must have a valid note property');
    }
    return true;
}

const db = {
    allEnvelopes: {
        data: allEnvelopes,
        nextId: envelopeIdCounter,
        isValid: isValidEnvelope,
    },
    allIdeas: {
        data: allIdeas,
        nextId: ideaIdCounter,
        isValid: isValidIdea,
    },
    allTransactions: {
        data: allTransactions,
        nextId: transactionIdCounter,
        isValid: isValidTransaction,
    },
    allMeetings: {
        data: allMeetings,
        nextId: meetingIdCounter,
        isValid: isValidMeeting,
    }
}


const findDataArrayByName = (name) => {
    switch (name) {
        case 'envelopes':
            return db.allEnvelopes;
        case 'ideas':
            return db.allIdeas;
        case 'transactions':
            return db.allTransactions;
        case 'meetings':
            return db.allMeetings;
        default:
            return null;
    }
}

const getAllFromDatabase = (modelType) => {
    const model = findDataArrayByName(modelType);
    if (model === null) {
        return null;
    }
    return model.data;
}

const getFromDatabaseById = (modelType, id) => {
    const model = findDataArrayByName(modelType);
    if (model === null) {
        return null;
    }
    return model.data.find((element) => {
        return element.id === id;
    });
}

const addToDatabase = (modelType, instance) => {
    const model = findDataArrayByName(modelType);
    if (model === null) {
        return null;
    }
    if (model.isValid(instance)) {
        instance.id = `${model.nextId++}`;
        model.data.push(instance);
        return model.data[model.data.length - 1];
    }
}

const updateInstanceInDatabase = (modelType, instance) => {
    const model = findDataArrayByName(modelType);
    if (model === null) {
        return null;
    }
    const instanceIndex = model.data.findIndex((element) => {
        return element.id === instance.id;
    });
    if (instanceIndex > -1 && model.isValid(instance)) {
        console.log('instance', instance)
        model.data[instanceIndex] = instance;
        return model.data[instanceIndex];
    } else {
        return null;
    }
}

const deleteFromDatabasebyId = (modelType, id) => {
    const model = findDataArrayByName(modelType);
    if (model === null) {
        return null;
    }
    let index = model.data.findIndex((element) => {
        return element.id === id;
    });
    if (index !== -1) {
        model.data.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

const deleteAllFromDatabase = (modelType) => {
    const model = findDataArrayByName(modelType);
    if (model === null) {
        return null;
    }
    model.data = [];
    return model.data;
}

module.exports = {
    createMeeting,
    getAllFromDatabase,
    getFromDatabaseById,
    addToDatabase,
    updateInstanceInDatabase,
    deleteFromDatabasebyId,
    deleteAllFromDatabase,
};
