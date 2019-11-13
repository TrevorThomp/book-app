'use strict';

require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 3000;

app.use(bodyParser());
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// View Engine
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  let httpRegex = /^(http:\/\/)/g;

  this.title = info.title ? info.title : 'No title available';
  this.author = info.authors ? info.authors[0] : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}


function getBooks(request,response) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  return superagent
    .get(url)
    .then(result => result.body.items.map(data => new Book(data.volumeInfo)))
    .then(results => response.render('searches/show', {searchResults: results}))
    .catch(err => handleError(err,response));
}

function handleError(error,response) {
  response.render('pages/error', {error: error})
}

// Home Page Route
app.get('/', (request, response) => {
  response.render('index');
})

app.post('/searches', getBooks);

app.listen(PORT, console.log(`Listening on ${PORT}`));
