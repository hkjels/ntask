/*!
 * Todo
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var fs = require('fs')
  , path = require('path')

/**
 * Expose `Project`
 */

exports = module.exports = Project

/**
 * Initializes a new project
 *
 * @param {String} fpath
 * @return {Boolean}
 */

exports.init = function init (fpath) {
  var project = new Project(fpath)
  if (project.exists()) return false
  try { fs.mkdirSync(fpath+'/.todo', '0755') }
  catch (err) { throw new err() }
  return true
}

/**
 * Locates & sets up project
 * Path is only needed for testing, usual case `pwd` by default
 *
 * @param {String}
 * @api private
 */

function Project(fpath) {
  fpath = fpath || PWD
  this.root = ''
  this.storage = ''
  this.ignore = []
  this.resolvePaths(fpath)
}

/**
 * Wether the project has already been initialized
 *
 * @api private
 */

Project.prototype.exists = function projectExists () {
  return (this.root !== '')
}

/**
 * Resolve project-paths
 *
 * @param {String} fpath
 * @return {Project}
 * @api private
 */

Project.prototype.resolvePaths = function resolvePaths (fpath) {
  fs.realpathSync(fpath)
  var segments = fpath.split('/')

  // Recurse back until ".todo"-directory is found

  while (segments.length) {
    if (path.existsSync(segments.join('/')+'/.todo')) {
      this.root = segments.join('/')
      this.storage = this.root+'/.todo'
      this.ignorePaths()
    }
    segments.pop()
  }
  return this
}

/**
 * Ignore paths, specified in .todoignore
 *
 * @api private
 */

Project.prototype.ignorePaths = function ignorePaths () {
  var ignorefile = this.root+'/.todoignore'
  if (path.existsSync(ignorefile)) {
    this.ignore = fs.readFileSync(ignorefile).toString()
      .replace(/[^\#\na-z0-9-_\.\*\?\\]*/gi, '')  // Sanitize filenames
      .replace(/#.*\n/g, '')
      .split('\n')
    this.ignore = this.ignore.filter(function (val) { return !!val })
  }
  this.ignore.push('.todo')
}
