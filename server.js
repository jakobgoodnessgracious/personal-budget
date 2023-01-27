const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const apiRouter = require('./server/api');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors(), bodyParser.json(), morgan('tiny'));
app.use('/', apiRouter);
app.use((err, req, res, next) => {
    const { status = 500, message } = err;
    // console.log(req.url, status, err.stack);
    console.log(req.url, status, message || err);
    res.status(status).send(message);
});
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}.`);
});

