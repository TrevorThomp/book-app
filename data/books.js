'use strict';

const superagent = require('superagent');

function Book(info) {
  this.title = info.title || 'No title available';
  this.author = info.authors || 'No author available';
  this.description = info.description || 'No description available';
}


function getBooks(request,response) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  return superagent
    .get(url)
    .then(result => result.body.items.map(data => new Book(data.volumeInfo)))
    .then(results => response.render('searches/show', {searchResults: results}))
    .catch(() => console.log('Something is not right'), request,response)
}

module.exports = getBooks;
