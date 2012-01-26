
/**
 * Module dependencies
 */

var express = require('express')
  , app = module.exports = express.createServer()
  , helpers = require('./helpers')(app)
  , nib = require('nib')
  , stylus = require('stylus')

// Stylus files will be served compressed & with the use of nib

var compile = function stylusCompile (str, path) {
  return stylus(str).set('filename', path).set('compress', true)
                    .use(nib()).import('nib')
}

// Configurations

app.configure(function config () {
  app
    .set('views', __dirname+'/views')
    .set('view engine', 'jade')

  app
    .use(stylus.middleware({ src: __dirname+'/public', compile: compile }))
    .use(express.errorHandler({ dumpExceptions: true, showStack: true }))
    .use(express['static'](__dirname+'/public'))
    .use(express.bodyParser())
})