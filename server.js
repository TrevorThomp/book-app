'use strict';

require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// View Engine
app.set('view engine', 'ejs');




app.listen(PORT, console.log(`Listening on ${PORT}`));