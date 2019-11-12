'use strict';

require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(bodyParser());
app.use(cors());

// View Engine
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views/pages'))
app.set('view engine', 'ejs');

app.get('/hello', (request, response) => {
  response.render('index');
})


app.listen(PORT, console.log(`Listening on ${PORT}`));
