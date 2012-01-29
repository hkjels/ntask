var fs = require('fs')
  , Taskpool = require('../../pool')

// Title pre-condition

exports.title = function (req, res, next, title) {
  var task = {}
  title = decodeURIComponent(title)

  Taskpool.find('', function (err, tasks) {
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
  Taskpool.find((req.body.filter || ''), function (err, tasks) {
    res.render('tasks', { tasks: tasks, filter: req.body.filter || '' })
  })
}

// Single task
// Detailed information about a specific task

exports.task = function (req, res) {
  res.render('task')
}
