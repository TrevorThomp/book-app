'use strict';

const superagent = require('superagent');

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  let httpRegex = /^(http:\/\/)/g;

  this.title = info.title || 'No title available';
  this.author = info.authors || 'No author available';
  this.description = info.description || 'No description available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
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


module.exports = getBooks;
