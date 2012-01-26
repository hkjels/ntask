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
  , op = require('op')
  , path = require('path')
  , Project = require('./project')
  , Task = require('./task')
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

  db.registerConstructors(Task)
  db.openSync()

  query = queryParser(query)

  // Fetch tasks from Barricane

  if (query.assignee !== null) tasks = db.find('assignee', query.assignee)
  else tasks = db.find()

  // Filter tasks by labels

  if (query.labels.length) {
    tasks = tasks.filter(function (task) {
      var exists = false
      query.labels.forEach(function (label) {
        if (task.labels.join(',').indexOf(label[0]) != -1) {
          exists = true
        }
      })
      return exists
    })
  }

  // Sort by date

  function sortByDate(a, b) {
    return new Date(a.added).getTime() - new Date(b.added).getTime()
  }
  tasks.sort(sortByDate)

  // Fulltext search

  if (query.text.length) {
    tasks = tasks.filter(function (task) {
      return (task.title+task.body).indexOf(query.text) != -1
    })
  }

  db.end(function (err, result) {
    if (err) return callback(err)
    callback(false, tasks)
  })
}

/**
 * Parse query
 * Will sanitize & split a query into sensible key/values
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

var queryParser = exports.queryParser = function queryParser(query) {
  // Sanitize query
  query = query.toLowerCase().replace(/^[^a-z0-9-_@# ]*$/g, '')

  var obj = { assignee: null, labels: [], text: '' }
    , words = query.split(' ')

  words.forEach(function (word) {
    switch (word[0]) {
      case '@' : {
        obj.assignee = word
        break
      }
      case '#' : {
        var matches = word.trim().split(/^([^\[]*)\[?([0-9]*)?\]?$/g)
        if (matches.length) {
          var parsed = []
          parsed[0] = matches.slice(1,2)
          parsed[1] = matches.slice(2,3) || null
          obj.labels.push(parsed)
        }
        break
      }
      default : obj.text += word
    }
  })

  return obj
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

  taskpool.db.registerConstructors(Task)
  taskpool.db.openSync()

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
  this.db = new barricane.DB({ path: project.storage, name: 'tasks' })
  process.db = this.db
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

          // Final task-object

          var task = {
              added: new Date()
            , assignee: assignee
            , body: body
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
