/*!
 * Todo
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

var fs = require('fs')
  , Taskpool = require('../pool')

// Title pre-condition

exports.title = function (req, res, next, title) {
  var task = {}
  title = decodeURIComponent(title)

  Taskpool.find('blame', function (err, tasks) {
    for (var key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        if (tasks[key].title === title) task = tasks[key]
      }
    }
    res.local('task', task)
    next()
  })
}

// Tasks
// Filter & search for tasks

exports.tasks = function (req, res) {
  Taskpool.find('blame', function (err, tasks) {
    res.render('tasks', { tasks: tasks })
  })
}

// Single task
// Detailed information about a specific task

exports.task = function (req, res) {
  res.render('task')
}


exports.docs = function (req, res) {
  res.render('docs', {docs: JSON.parse(fs.readFileSync(__dirname+'/../../docs/docs.json'))})
}