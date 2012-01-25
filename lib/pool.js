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

/**
 * Keywords to look for in sourcecode
 */

var KEYWORDS = ['TODO', 'BUG', 'FIXME', 'OPTIMIZE']

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

  /*
  TODO Must be rewritten to work with objects or there will be need of some magic
     | in the search of these labels #label[n]
  
  tasks = tasks.filter(function (task) {
    var exists = false
    query.labels.forEach(function (label) {
      exists = exists || !task.labels.indexOf(label)
    })
    return exists
  })
  */

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
  query = query.toLowerCase().replace(/[^a-z0-9-_@# ]/g, '')

  var obj = { assignee: null, labels: [] }
    , words = query.split(' ')

  words.forEach(function (word) {
    switch (word[0]) {
      case '@' : obj.assignee = word
                 break
      case '#' : obj.labels.push(word)
                 break
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

  taskpool.db.openSync()

  fpaths.forEach(function (fpath) {
    taskpool.ack(fpath, function (err, tasks) {
      if (err) return callback(err)
      tasks.forEach(function (task, i) {
        updates.added.push(task)
        new Task(task)

        // Every task is submitted

        if (i == tasks.length - 1) {
          taskpool.db.end(function (err, result) {
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
 *
 * @param {Project} project
 * @api private
 */

function Taskpool (project) {
  this.db = new barricane.DB({ path: project.storage, name: 'tasks' })
  process.db = this.db
}

/**
 * Find sourcecode "TODO's"
 * This will hackle the specified path for TODO-comments and return
 * the comments to it's callback.
 *
 * @param {String} fpath
 * @param {Function} callback(err, tasks)
 * @api private
 */

Taskpool.prototype.ack = function taskpoolAck (fpath, callback) {
  var self = this
    , pattern = (function taskPattern () {
        return new RegExp('[@#]?('+KEYWORDS.join('|')+')', 'g')
      })()

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
    // Each comment is parsed into an object that is compatible with the taskmodel

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

          var assignee = (line.match(/@[a-z\[0-9\]-_]*/gi)||['@none'])[0]

          var task = { 
             file: fpath, line: linum, assignee: assignee
            ,title: line.split(' ').slice(1).join(' ').replace(assignee, '').trim()
            ,body: (function body() {
              // OPTIMIZE This code looks really awefull at the moment. Clean it up!
              var next = lines.shift()
              if (new RegExp('[\\s]*[\\\*]{0,2}[\|]', 'gi').test(next)) {
                linum++
                return next.split('|').slice(1).join('').trim()+'\n'+body()
              }
              else {
                lines.unshift(next)
                return ''
              }
            })()
          }
          // OPTIMIZE Same goes for labels. Just awefull
          task.labels = ((task.title+task.body).match(/#[a-z\[0-9\]-_]*/gi) || [])
            .filter(function (label) { return label.length > 1 })
            .map(function (label) { return label.toLowerCase() })
          task.labels.unshift('#'+line.match(pattern)[0].toLowerCase())
          task.labels = (function (arr) {
            var obj = {}
            for (var i = 0, c = arr.length; i < c; ++i) {
              if (arr[i] === undefined) continue
              if (arr[i].indexOf('[') !== -1) {
                var key = arr[i].substr(0, arr[i].indexOf('['))
                  , value = arr[i].substr(arr[i].indexOf('['), arr[i].length - 1)
                obj[i] = {}
                obj[key] = value
              }
              else obj[i] = arr[i]
            }
            return obj
          })(task.labels)

          tasks.push(task)
        }
        callback(false, tasks)
      })
    }
  })
}