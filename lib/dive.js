
/**
 * Module dependencies
 */

var fs = require('./fs')
  , join = require('path').join
  , setrlimit = require('posix').setrlimit

/**
 * Quickfix for ulimit issue
 * TODO Research if ulimit can be set higher instead
 *    | Will deffiantly have to be testet on linux aswell
 */

var running = 0
  , concurrency = 10000
  , pattern = new RegExp('[#@\/\* ]+('+KEYWORDS+')[ \:]{1,}', 'g')
  , isoPattern = new RegExp('[#@\/\* ]+('+KEYWORDS+'):(\\d{4,}-\\d{2}-\\d{2}):([^:]+):(.*)', 'g')

/**
 * Raise the number of open file-descriptors at a time
 */

setrlimit('nofile', {soft: concurrency})

/**
 * Dive
 * Dives into your project and looks for tasks
 * It will recurse every directory below the target except for those specified
 * in ".todoignore"
 *
 * TODO #dive could be a packeage of it's own
 *    | that simply runs the callback with a pointer or similar. Could then
 *    | use the more traditional lexer/parser strategy for both queries and
 *    | stored tasks.
 *
 * @param {String} path
 * @param [Array] list
 * @param {Function} cb
 */

var dive = module.exports = function dive (path, list, cb) {
  fs.stat(path, function (err, stat) {
    if (err) return cb(err)

    // Recurse directory

    if (stat.isDirectory()) {
      fs.readdirIgnore(path, list, function (err, file) {
        if (err) return cb(err)
        return dive(join(path, file), list, cb)
      })
    }

    // Look through files for tasks

    if (stat.isFile()) {
      if (running > concurrency) {
        return process.nextTick(function () {
          dive(path, list, cb)
        })
      }
      running++

      // Pluck the tasks out

      pluck(path, cb)
    }
  })
}

/**
 * Pluck
 * Transform those boring strings into task-objects
 * @param {String} path
 */

var pluck = function pluck (path, cb) {
  var tasks = []
  fs.readFile(path, 'utf8', function (err, str) { running--
    if (err) return cb(err)

    /**
     * Skip binary-files
     */

    if (getEncoding(str) === 'binary') return

    var lines = str.split('\n')
      , linum = 0

    while (lines.length) {
      var line = lines.shift()
      linum++
      if (!pattern.test(line)) continue

      /**
       * Old-style comments
       * @see http://www.riedquat.de/TR/trunk/TODO_Syntax/
       */

      var matches = line.match(isoPattern)
      if (matches != null) {
        matches = matches.toString().split(':')
        var labels = ['#'+matches[0].toLowerCase()]
          , added = new Date(matches[1])
          , assignee = '@'+matches[2].replace(/[\\s]*/, '-')
          , linestart = linum
          , title = matches[3]
          , body = ''
      }

      /**
       * New-style comments
       *
       * TODO Write a comment specification
       *    | Should be located at the address below
       *
       * @see http://hkjels.github.com/t/comment.html
       */

      else {
        var added = new Date()
          , assignee = (line.match(/@[\w\[\d\]-_]*/g)||['@none'])[0]
          , title = line.replace(new RegExp('.*('+KEYWORDS+')'), '')
                        .replace(assignee, '')
                        .replace(/[^a-z0-9\!\]\)]*$/i, '').trim()
          , linestart = linum
          , body = (function body() {
           var next = lines.shift()
           if (/[\\s]*[\\\*\%\-(" )"]{0,3}[\|]/g.test(next)) {
             linum++
             return next.split('|').slice(1).join('').trim()+'\n'+body()
           } else {
             lines.unshift(next)
             return ''
           }
         })()
          , labels = ((title+body).match(/#[\w]*[\[\]a-f0-9\.]*/gi) || [])
                     .map(lowertrim).filter(minlength)
          , keyword = line.match(new RegExp('.*('+KEYWORDS+')'))[1].toLowerCase()
          labels.unshift('#'+keyword)
      }
      var done = labels.indexOf('#done') != -1

      /**
       * Parsed task-object ready for model-validation
       */

      var task = {
          added: added
        , assignee: assignee
        , body: body
        , done: done
        , file: path
        , labels: labels
        , line: linestart
        , title: title
      }
      tasks.push(task)
    }
    cb(false, tasks)
  })
}

function lowertrim (str) {
  return str.toLowerCase().trim()
}

function minlength (str) {
  return str.length > 1
}

function getEncoding (buffer) {
  var charCode, contentStartBinary, contentStartUTF8, encoding, i, _ref
  contentStartBinary = buffer.toString('binary', 0, 24)
  contentStartUTF8 = buffer.toString('utf8', 0, 24)
  encoding = 'utf8'
  for (i = 0, _ref = contentStartUTF8.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    charCode = contentStartUTF8.charCodeAt(i)
    if (charCode === 65533 || charCode <= 8) {
      encoding = 'binary'
      break
    }
  }
  return encoding
}
