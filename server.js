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
const methodOverride = require('method-override')
const PORT = process.env.PORT || 3000;

app.use(bodyParser());
app.use(cors());

// Middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

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
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  let httpRegex = /^(http:\/\/)/g

  this.title = info.title ? info.title : 'No title available';
  this.author = info.authors ? info.authors[0] : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
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

function createBook(request,response){
  let normalizedBookshelf = request.body.bookshelf.toLowerCase();
  //create a SQL statement to insert book
  let { title,author,isbn,image_url, description } = request.body;
  let SQL = 'INSERT INTO books(author, title, isbn, image_url, description, bookshelf) VALUES($1,$2,$3,$4,$5,$6) RETURNING id';
  //return id of book back to calling function
  let values = [author, title, isbn, image_url, description, normalizedBookshelf];

  return client.query(SQL, values)
    .then(result => response.redirect(`/books/${result.rows[0].id}`))
    .catch(handleError)
}

function getOneBook(request,response){
  getBookShelves()
    .then(shelves => {
      let SQL = 'SELECT * FROM books WHERE id=$1';
      let values = [request.params.id];
      return client.query(SQL, values)
        .then(result => response.render('books/show', {result: result.rows[0], bookshelves: shelves.rows}))
    })
    .catch(handleError);
}

function getBookShelves() {
  let SQL = 'SELECT DISTINCT bookshelf FROM books ORDER BY bookshelf';
  return client.query(SQL)
}

function updateBook(request,response) {
  let { author, title, isbn, image_url, description, bookshelf} = request.body;
  let SQL = 'UPDATE books SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7';

  let values = [author, title, isbn, image_url, description, bookshelf, request.params.id];

  return client.query(SQL, values)
    .then(response.redirect(`/books/${request.params.id}`))
    .catch(handleError)
}

function deleteBook(request,response) {
  let SQL = 'DELETE FROM books WHERE id=$1';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(handleError)
}

// Error Handler
function handleError(error,response) {
  response.render('error', {error: error})
}

// Port listener
app.listen(PORT, console.log(`Listening on ${PORT}`));
