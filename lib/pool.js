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
  , parseQuery = require('./query')
  , stem = require('porter-stemmer').stemmer
  , _ = require('underscore')

/**
 * Expose `Taskpool`
 */

exports = module.exports = Taskpool


/**
 * Taskpool
 *
 * Keep track of the tasks of a `Project`
 * Uses BarricaneDb to store the tasks within your project-directory.
 * "project/.todo"
 *
 * @param {Project} project
 */

function Taskpool (project) {
  var db = this.db = new barricane.DB({ path: project.storage, name: 'tasks' })
  process.db = this.db
  db.registerConstructors(Task)
  db.openSync()
}

/**
 * Exposes `dive`
 */

Taskpool.prototype.dive = require('./dive')

/**
 * find
 *
 * Searches Barricane for tasks
 * Using a twitter-like query-format you can retrieve any number of tasks from
 * the pool. Have in mind that querying labels and assignments are faster &
 * usually more efficient than fulltext-search.
 *
 * @param {String} query
 * @param {Function} cb(err, tasks)
 */

exports.find = function taskpoolFind (query, cb) {

  /**
   * Make sure we are within a project
   */

  var project = new Project(PWD)
  if (!project.exists()) {
    return cb(new Error('You are not within an initiliazed project'))
  }

  /**
   * Retrieve BarricaneDb and initialize Taskpool
   *
   * PS! Beyond this point, any failure can lead to seriously corrupted data
   * TODO @henrik Write #test for query-parsing
   */

  var taskpool = new Taskpool(project)
    , tasks = []
    , db = taskpool.db
    , query = parseQuery(query)

  /**
   * Fetch tasks from Barricane
   */

  if (query.assignee !== null) tasks = db.find('assignee', query.assignee)
  else tasks = db.find('all', '*')

  /**
   * Filter tasks based on query-properties
   */

  tasks = _.filter(tasks, function (task) {
    var matches = []
      , match = true

    // Id : If an id is present, it will immidiately add the task

    if (query.id.length && _.indexOf(query.id, task.id) !== -1) {
      return true
    }

    // Fulltext : Uses porter-stemmer

    if (query.text.length) {
      match = task.stemmed.indexOf(query.text) != -1
    }

    // Label
    // TODO @henrik #Refactor label-filtering

    if (query.labels.length) {
      query.labels.forEach(function (qlabel) {
        task.labels.forEach(function (tlabel) {
          tlabel = tlabel.trim()
          if (qlabel.val != null) {
            tlabel = tlabel.replace(']', '').split('[')
            if (tlabel[0] === qlabel.key && qlabel.fn(qlabel.val, tlabel[1])) {
              if (query.sortby == tlabel[0]) task.sortval = tlabel[1]
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

    return (query.labels.length == matches.length) && match
  })

  /**
   * Sort by date [default]
   *
   * Will sort descending by the date when the task was added
   * Use the reverse flag or function for ascending results
   */

  function sortByDate(a, b) {
    return new Date(a.added).getTime() - new Date(b.added).getTime()
  }

  /**
   * Sort by label
   *
   * Will sort descending by the label specified
   * Use the reverse flag or function for ascending results
   */

  function sortByLabel(a, b) {
    if (a.sortval > b.sortval) return -1
    else if (a.sortval == b.sortval) return 0
    else return 1
  }

  /**
   * Choose sort-method
   */

  if (query.sortby == 'added') tasks.sort(sortByDate)
  else tasks.sort(sortByLabel)

  /**
   * Return the tasks to caller
   */

  db.end(function (err, result) {
    if (err) return cb(err)
    process.nextTick(function () { cb(false, tasks) })
  })
}

/**
 * Update taskpool with added/modified/removed-tasks
 *
 * TODO #Done & #modified #tracking
 * | Has to work per file, so that atomic updates will update all aspects of
 * | the backlog
 *
 * @param {Array} paths
 * @param {Function} cb(err, updates)
 */

exports.update = function taskpoolUpdate (paths, cb) {

  /**
   * Make sure we are within a project
   */

  var project = new Project(PWD)
  if (!project.exists()) {
    return cb(new Error('You are not within an initialized project'))
  }

  /**
   * Retrieve BarricaneDb and initialize Taskpool
   *
   * PS! Beyond this point, any failure can lead to seriously corrupted data
   */

  var taskpool = new Taskpool(project)
    , updates = { added: [], modified: [], removed: [], flawed: [] }
    , db = taskpool.db

  /**
   * Dive into the supplied paths and make sure the backlog is up to date
   */

  paths.forEach(function (path) {
    taskpool.dive(path, project.ignore, function (err, tasks) {
      if (err) return cb(err)
      tasks.forEach(function (candidate, i) {
        var task = new Task(candidate)

        /**
         * Task validates
         *
         * Add | Modify | Remove
         */

        if (task.isValid()) {
          updates.added.push(task)
          task.save()
        }

        /**
         * Task is invalid
         */

        else updates.flawed.push(task)

        /**
         * Tell caller about the updated backlog
         */

        db.end(function (err) {
          if (err) return cb(err)
          cb(false, updates)
        })
      })
    })
  })
}

