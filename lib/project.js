/*!
 * ntask
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 *
 * Project is written synchronously for simplicity, and should not affect the
 * overall experience.
 */

/**
 * Module dependencies
 */

var fs = require('fs')
  , pathExists = require('path').existsSync

/**
 * Expose `Project`
 */

exports = module.exports = Project

/**
 * Initializes a new project
 *
 * @param {String} path
 * @return {Boolean}
 */

exports.init = function init (path) {
  path = path || PWD
  var project = new Project(path)
  if (project.exists()) return false
  try { fs.mkdirSync(path+'/.todo', '0755') }
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

function Project(path) {
  path = path || PWD
  this.root = ''
  this.storage = ''
  this.ignore = []
  this.resolvePaths(path)
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
 * @param {String} path
 * @return {Project}
 * @api private
 */

Project.prototype.resolvePaths = function resolvePaths (path) {
  fs.realpathSync(path)
  var segments = path.split('/')

  // Recurse back until ".todo"-directory is found

  while (segments.length) {
    if (pathExists(segments.join('/')+'/.todo')) {
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
  if (pathExists(ignorefile)) {
    this.ignore = fs.readFileSync(ignorefile).toString()
      .replace(/[^\#\na-z0-9-_\.\*\?\\]*/gi, '')  // Sanitize filenames
      .replace(/#.*\n/g, '')
      .split('\n')
    this.ignore = this.ignore.filter(function (val) { return !!val })
  }
  this.ignore.push('.todo', '.git', '.svn')
}
