
/**
 * Module dependencies
 */

var fs = require('fs')
  , pathh = require('path')
  , minimatch = require('minimatch')

/**
 * Keywords to look-up
 */

var KEYWORDS = ['TODO', 'BUG', 'FIXME', 'OPTIMIZE'].join('|')

/**
 * Ack
 * Search for tasks within the given path
 *
 * TODO #ack could be a package of it's own that simply runs the callback
 * | with a pointer or similar. Could then use the more traditional lexer
 * | parser strategy for both queries and stored tasks.
 *
 * @param {String} path
 * @param [Array] list
 * @param {Function} cb
 */

var ack = module.exports = function ack (path, list, cb) {
  var pattern = new RegExp('('+KEYWORDS+')[ \:]{1,}', 'g')

  fs.stat(path, function (err, stat) {
    if (err) return cb(err)

    // Recurse directory

    if (stat.isDirectory()) {
      fs.readdir(path, function (err, files) {
        if (err) return cb(err)
        files.forEach(function (file) {
          var doIgnore = list.filter(function (ignore) {
            return minimatch(file, ignore)
          })
          if (doIgnore.length == 0) ack(pathh.join(path, file), list, cb)
        })
      })
    }

    // Test file for todo-comments
    // Each comment is parsed into an object that is compatible with barricane

    if (stat.isFile()) {
      var tasks = []
      fs.readFile(path, 'utf8', function (err, str) {
        if (err) return cb(err)
        var lines = str.split('\n')
          , linum = 0

        while (lines.length) {
          var line = lines.shift()
          linum++
          if (!pattern.test(line)) continue

          // Assignee is the first occurence of @\w

          var assignee = (line.match(/@[\w\[\d\]-_]*/g)||['@none'])[0]

          // Title is the first line of the comment
          // Assignee, keyword and commentspesific characters are removed.

          var title = line.replace(new RegExp('.*('+KEYWORDS+')'), '')
                          .replace(assignee, '')
                          .replace(/[^a-z0-9\!\]\)]*$/i, '').trim()

          // Body is every line after the title
          // Commentspesific characters are removed

          var body = (function body() {
             var next = lines.shift()
             if (/[\\s]*[\\\*\%\-(" )"]{0,3}[\|]/g.test(next)) {
               linum++
               return next.split('|').slice(1).join('').trim()+'\n'+body()
             } else {
               lines.unshift(next)
               return ''
             }
           })()

          // Labels are every word that starts with a hash "#"

          var labels = ((title+body).match(/#[\w]*[\[\]0-9\.]*/gi) || [])
          labels.unshift('#'+line.match(pattern)[0])
          labels.filter(function (label) { return label.length > 1 })
          labels = labels.map(function (label) {
            return label.toLowerCase()
          })

          var done = labels[0] == '#done' ? true : false

          // Final task-object

          var task = {
              added: new Date()
            , assignee: assignee
            , body: body
            , done: done
            , file: path
            , labels: labels
            , line: linum
            , title: title
          }

          tasks.push(task)
        }
        cb(false, tasks)
      })
    }
  })
}