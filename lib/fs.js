
/**
 * Monkey patch filesystem
 * Extension makes it easy to ignore files from a list of glob-patterns
 */

/**
 * Module dependencies
 */

var fs = module.exports = require('fs')
  , minimatch = require('minimatch')

/**
 * Read directory asynchronously
 * Reads the content of a directory and excludes files & directories within
 * the glob-list. The callback gets two arguments (err, files) where files is
 * an array of filenames excluding (.|..|list).
 *
 * @param {String} path
 * @param {Array} list of glob patterns to be ignored
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
      cb(err, file)
    })
  })
}

/**
 * TODO Create a synchronous version of readdirIgnore
 */

