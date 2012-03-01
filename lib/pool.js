/*!
 * ntask
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var barricane = require('barricane-db')
  , Project = require('./project')
  , Task = require('./task')
  , query = require('./query')

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
 * @param {String} qargs
 * @param {Function} cb(err, tasks)
 */

exports.find = function taskpoolFind (qargs, cb) {
  project = new Project(PWD)
  if (!project.exists()) return cb(new Error('You are not within an initiliazed project'))

  var taskpool = new Taskpool(project)
    , tasks = []
    , db = taskpool.db

  var qargs = query(qargs)

  // Fetch tasks from Barricane

  if (qargs.assignee !== null) tasks = db.find('assignee', qargs.assignee)
  else tasks = db.find('done', qargs.done)

  // Filter tasks by labels

  tasks = tasks.filter(function (task) {
    var matches = []
      , match = true

    // Fulltext search

    if (qargs.text.length) {
      match = (task.title+task.body).indexOf(qargs.text) != -1
    }

    // Label search

    if (qargs.labels.length) {
      qargs.labels.forEach(function (qlabel) {
        task.labels.forEach(function (tlabel) {
          tlabel = tlabel.trim()
          if (qlabel.val != null) {
            tlabel = tlabel.trim().replace(']', '').split('[')
            if (tlabel[0] == qlabel.key && qlabel.fn(qlabel.val, tlabel[1])) {
              if (qargs.sortby == tlabel[0]) task.sortval = tlabel[1]
              matches.push(true)
            }
          }
          else {
            var valexists = tlabel.indexOf('[')
            tlabel = valexists != -1 ? tlabel.substr(0, valexists) : tlabel
            if (tlabel == qlabel.key) matches.push(true)
          }
        })
      })
    }

    return (qargs.labels.length == matches.length) && match
  })

  function sortByDate(a, b) {
    return new Date(a.added).getTime() - new Date(b.added).getTime()
  }
  function sortByLabel(a, b) {
    if (a.sortval > b.sortval) return -1
    else if (a.sortval == b.sortval) return 0
    else return 1
  }

  if (qargs.sortby == 'added') tasks.sort(sortByDate)
  else tasks.sort(sortByLabel)

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
    , updates = { added: [], modified: [], removed: [], flawed: [] }

  paths.forEach(function (path) {
    taskpool.ack(path, project.ignore, function (err, tasks) {
      if (err) return cb(err)
      tasks.forEach(function (candidate, i) {
        var task = new Task(candidate)
        if (task.isValid()) {
          updates.added.push(task)
          task.save()
        }
        else {
          updates.flawed.push(task)
        }

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
