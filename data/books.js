'use strict';

function Book(info) {
  this.title = info.title || 'No title available';
  this.author = this.author || 'No author available';
  this.description = this.description || 'No description available';
}