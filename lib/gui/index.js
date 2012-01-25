/*!
 * Todo
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var express = require('express')
  , fs = require('fs')
  , nib = require('nib')
  , routes = require('./routes')
  , stylus = require('stylus')
  , tty = require('tty')
  , project = new (require('../project'))()

// Stylus files will be served
// compressed & using nib

var compile = function stylusCompile (str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib')
}

/**
 * Expose `gui`
 * Invoked from the cli using "t gui [port]"
 * @param {Number} port
 */

module.exports = function (port) {
  var app = express.createServer()
    , port = parseInt(port || 3000, 10)
    , meta = JSON.parse(fs.readFileSync(__dirname+'/../../package.json'))

  if (!project.exists()) {
    console.error('\n   You are not within an initiliazed project\n')
    process.exit(0)
  }

  // Configuration

  app.configure(function config () {
    app
      .set('views', __dirname+'/views')
      .set('view engine', 'jade')

    app
      .use(stylus.middleware({ src: __dirname+'/public', compile: compile }))
      .use(express.errorHandler({ dumpExceptions: true, showStack: true }))
      .use(express['static'](__dirname+'/public'))
  })

  // Helpers

  app.helpers({ meta: meta })

  // Pre-conditions

  app.param('title', routes.title)

  // Routes

  app.get('/', routes.tasks)
  app.get('/task/:title', routes.task)
  app.get('/docs', routes.docs)

  // Make server listen for incoming requests

  app.listen(port)
  console.log('\n   Go to http://localhost:'+port+'/')

  // Kill gui gracefully with ^C

  process.stdin.resume()
  tty.setRawMode(true)
  process.stdin.on('keypress', function(c, key) {
    if (key && key.ctrl && 'c' === key.name) {
      console.log('\n   See you!\n')
      process.exit()
    }
  }).resume()
}