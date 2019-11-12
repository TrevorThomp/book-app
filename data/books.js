'use strict';

const superagent = require('superagent');

function Book(info) {
  this.title = info.volumeInfo.title || 'No title available';
  this.author = this.volumeInfo.authors || 'No author available';
  this.description = this.volumeInfo.description || 'No description available';
}


function getBooks(request,response) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${request.query.data}`;

  return superagent
    .get(url)
    .then(result => {
      console.log(result)
      let bookData = request.query.data.items.map(data => {
        return new Book(data)
      })
      response.status(200).json(bookData)
    }
    )
    .catch(() => console.log('Something is not right'), request,response)
}

module.export = getBooks;
