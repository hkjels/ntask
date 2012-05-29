
/*!
 * ntask
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var fs = module.exports = require('fs')
  , minimatch = require('minimatch')

/**
 * readdirIgnore
 *
 * Reads the content of a directory, excluding files and directories from the
 * glob-array passed as 'list'-argument. The callback receives two arguments
 * (err, files), where files is an array of filenames excluding '.', '..' and
 * whatever that matched 'list'.
 *
 * @param {String} path to traverse
 * @param {Array} list of glob-patterns to be ignored
 * @param {Function} cb
 */

fs.readdirIgnore = function (path, list, cb) {
  var ignorefile = function (file) {
    var match = list.filter(function (pattern) {
      return minimatch(file, pattern)
    })
    return !(match.length > 0)
  }

  fs.readdir(path, function (err, files) {
    files.filter(ignorefile).forEach(function (file) {
      process.nextTick(function() { cb(err, file) })
    })
  })
}

