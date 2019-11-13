'use strict';

// dotenv Configuration
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

// Database Connetion
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// View Engine
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

// API Routes
app.get('/', getBooks);
app.get('/searches/new', newSearch);
app.post('/searches', createSearch);
app.post('/books', createBook);
app.get('/books/:id', getOneBook);

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  let httpRegex = /^(http:\/\/)/g;

  this.title = info.title || 'No title available';
  this.author = info.authors || 'No author available';
  this.description = info.description || 'No description available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
}

function newSearch(request, response) {
  response.render('searches/new')
}


function createSearch(request,response) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  return superagent
    .get(url)
    .then(result => result.body.items.map(data => new Book(data.volumeInfo)))
    .then(results => response.render('searches/show', {searchResults: results}))
    .catch(err => handleError(err, response));
}

function getBooks(request,response) {
  let SQL = 'SELECT * FROM books;'

  return client.query(SQL)
    .then(results => response.render('index', {books: results.rows}))
    .catch(err => handleError(err, response));
}

function createBook(){
  //create a SQL statement to insert book
  //return id of book back to calling function

}

function getOneBook(){
  //use the id passed in from the front-end (ejs form) 

}

// Error Handler
function handleError(error,response) {
  response.render('/pages/error', {error: error})
}

// Port listener
app.listen(PORT, console.log(`Listening on ${PORT}`));
