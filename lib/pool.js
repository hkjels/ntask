/*!
 * Todo
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var barricane = require('barricane-db')
  , Project = require('./project')
  , Task = require('./task')
  , q = require('./query')

/**
 * Expose `Taskpool`
 */

exports = module.exports = Taskpool


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
 * Exposes `ack`
 */

Taskpool.prototype.ack = require('./ack')

/**
 * Searches Barricane for tasks
 * Using a twitter-like query-format you can retrieve any number of tasks from
 * the pool. Have in mind that querying labels and assignments are faster &
 * usually more efficient than fulltext-search.
 *
 * @param {String} query
 * @param {Function} cb(err, tasks)
 */

exports.find = function taskpoolFind (query, cb) {
  project = new Project(PWD)
  if (!project.exists()) return cb(new Error('You are not within an initiliazed project'))

  var taskpool = new Taskpool(project)
    , tasks = []
    , db = taskpool.db

  var query = q(query)

  // Fetch tasks from Barricane

  if (query.assignee !== null) tasks = db.find('assignee', query.assignee)
  else tasks = db.find('done', query.done)

  // Filter tasks by labels

  tasks = tasks.filter(function (task) {
    var match = null

    // Fulltext search

    if (query.text.length) {
      match = (task.title+task.body).indexOf(query.text) != -1
    }

    // Label search

    if (query.labels.length) {
      query.labels.forEach(function (qlabel) {
        task.labels.forEach(function(tlabel) {
          tlabel = tlabel.trim().replace(']', '').split('[')
          if (tlabel[0] == qlabel.key) {
            if (tlabel.length > 1) match = qlabel.fn(qlabel.val, tlabel[1])
            else match = true
          }
        })
      })
    }
    else if (match === null) match = true

    return match
  })

  /**
   * TODO Add more #sorting capabilities using query-#syntax
   * | Sort by label using "><" after a label or similar
   * | Perhaps also move the logic to a separate module
   */
  // Sort by date

  function sortByDate(a, b) {
    return new Date(a.added).getTime() - new Date(b.added).getTime()
  }
  tasks.sort(sortByDate)

  db.end(function (err, result) {
    if (err) return cb(err)
    cb(false, tasks)
  })
}

/**
 * Update taskpool with added/modified/removed-tasks
 *
 * TODO Done & modified tracking
 * | Has to work per file, so that atomic updates will update all aspects of
 * | the backlog
 *
 * @param {Array} paths
 * @param {Function} cb(err, updates)
 */

exports.update = function taskpoolUpdate (paths, cb) {
  project = new Project(PWD)
  if (!project.exists()) return cb(new Error('You are not within an initialized project'))

  var taskpool = new Taskpool(project)
    , updates = { added: [], modified: [], removed: [] }

  paths.forEach(function (path) {
    taskpool.ack(path, project.ignore, function (err, tasks) {
      if (err) return cb(err)
      tasks.forEach(function (task, i) {
        new Task(task)
        updates.added.push(task)

        // Every task is submitted

        if (i == tasks.length - 1) {
          taskpool.db.end(function (err) {
            if (err) return cb(err)
            cb(false, updates)
          })
        }
      })
    })
  })
}
