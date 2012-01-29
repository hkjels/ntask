/*!
 * Todo
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var barricane = require('barricane-db')
  , fs = require('fs')
  , path = require('path')
  , Project = require('./project')
  , Task = require('./task')
  , qp = exports.qp = require('./query')
  , _ = require('underscore')

/**
 * Keywords to look for in sourcecode
 */

var KEYWORDS = ['TODO', 'BUG', 'FIXME', 'OPTIMIZE'].join('|')

/**
 * Expose `Taskpool`
 */

exports = module.exports = Taskpool

/**
 * Searches & filters tasks
 * Using a somewhat twitter-like query-format you can retrieve any number of
 * tasks from the pool. Have in mind that querying labels and assignments are
 * faster & usually more efficient than freeform.
 *
 * @param {String} query
 * @param {Function} callback(err, tasks)
 */

exports.find = function taskpoolFind (query, callback) {
  project = new Project(PWD)
  if (!project.exists()) return callback(new Error('You are not within an initiliazed project'))

  var taskpool = new Taskpool(project)
    , tasks = []
    , db = taskpool.db

  var query = qp(query)

  // Fetch tasks from Barricane

  if (query.assignee !== null) tasks = db.find('assignee', query.assignee)
  else tasks = db.find('done', query.done)

  // Filter tasks by labels

  tasks = tasks.filter(function (task) {
    var matches = null

    // Fulltext search

    if (query.text.length) {
      matches = (task.title+task.body).indexOf(query.text) != -1
    }

    // Label search

    if (query.labels.length) {
      query.labels.forEach(function (qlabel) {
        task.labels.forEach(function(tlabel) {
          tlabel = tlabel.trim().replace(']', '').split('[')
          if (tlabel[0] == qlabel.key) {
            if (tlabel.length > 1) matches = qlabel.fn(qlabel.val, tlabel[1])
            else matches = true
          }
        })
      })
    }
    else if (matches === null) matches = true

    return matches
  })

  // Sort by date

  function sortByDate(a, b) {
    return new Date(a.added).getTime() - new Date(b.added).getTime()
  }
  tasks.sort(sortByDate)

  db.end(function (err, result) {
    if (err) return callback(err)
    callback(false, tasks)
  })
}

/**
 * Update taskpool with added/modified/removed-tasks
 *
 * @param {Array} fpaths
 * @param {Function} callback(err, updates)
 */

exports.update = function taskpoolUpdate (fpaths, callback) {
  project = new Project(PWD)
  if (!project.exists()) return callback(new Error('You are not within an initialized project'))

  var taskpool = new Taskpool(project)
    , updates = { added: [], modified: [], removed: [] }

  fpaths.forEach(function (fpath) {
    taskpool.ack(fpath, function (err, tasks) {
      if (err) return callback(err)
      tasks.forEach(function (task, i) {
        updates.added.push(task)
        new Task(task)

        // Every task is submitted

        if (i == tasks.length - 1) {
          taskpool.db.end(function (err) {
            if (err) return callback(err)
            callback(false, updates)
          })
        }
      })
    })
  })
}

/**
 * Keep track of the tasks of a `Project`
 * Uses BarricaneDb to store the tasks within you project-directory ".todo/"
 *
 * @param {Project} project
 * @api private
 */

function Taskpool (project) {
  var db = this.db = new barricane.DB({ path: project.storage, name: 'tasks' })
  process.db = this.db

  db.registerConstructors(Task)
  db.openSync()
}

/**
 * Find TODO's
 * This will hackle the specified path for TODO-comments and return
 * the comments to it's callback.
 *
 * @param {String} fpath
 * @param {Function} callback(err, tasks)
 * @api private
 */

Taskpool.prototype.ack = function taskpoolAck (fpath, callback) {
  var self = this
    , pattern = new RegExp('('+KEYWORDS+')', 'g')

  fs.stat(fpath, function (err, stat) {
    if (err) return callback(err)

    // Recurse directory

    if (stat.isDirectory()) {
      fs.readdir(fpath, function (err, files) {
        if (err) return callback(err)
        files.forEach(function (file) {
          self.ack(path.join(fpath, file), callback)
        })
      })
    }

    // Test file for "TODO"-comments
    // Each comment is parsed into an object that is compatible with barricane

    if (stat.isFile()) {
      var tasks = []
      fs.readFile(fpath, 'utf8', function (err, str) {
        if (err) return callback(err)
        var lines = str.split('\n')
          , linum = 0

        while (lines.length) {
          var line = lines.shift()
          linum++
          if (!pattern.test(line)) continue

          // Assignee is either the first occurence of "@sometext" or "@none"

          var assignee = (line.match(/@[a-z\[0-9\]-_]*/gi)||['@none'])[0]

          // Title is the first line of the comment
          // Assignee, keyword and commentspesific characters are removed.

          var title = line.replace(new RegExp('.*('+KEYWORDS+')'), '')
                          .replace(assignee, '')
                          .replace(/[^a-z0-9\!]*$/i, '').trim()

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

          var labels = ((title+body).match(/#[a-z\[0-9\]-_]*/gi) || [])
          labels.unshift('#'+line.match(pattern)[0])
          labels.filter(function (label) { return label.length > 1 })
          labels = labels.map(function (label) {
            label = label.toLowerCase()
            return label
          })

          var done = labels[0] == '#done' ? true : false

          // Final task-object

          var task = {
              added: new Date()
            , assignee: assignee
            , body: body
            , done: done
            , file: fpath
            , labels: labels
            , line: linum
            , title: title
          }

          tasks.push(task)
        }
        callback(false, tasks)
      })
    }
  })
}
