/**
 * Module dependencies
 */

var crypto = require('crypto')

/**
 * Mock object for tasks
 */

var tasks = module.exports = [
  {
      id: ''
    , assignee: 'none'
    , labels: ['todo', 'ms0.0.2']
    , milestone: '0.0.2'
    , title: 'Need a new search-strategy for #ms0.0.2'
    , body: ''
    , file: '/Users/henrik/Github/todo/test/testing/Todo.md'
    , line: 10
  }
  ,{
      id: ''
    , assignee: 'hkjels'
    , labels: ['bug', 'ms0.0.2', 'api']
    , milestone: '0.0.2'
    , title: 'The #api for updating throws an exception on #ms0.0.2 if theres no todo-project'
    , body: ''
    , file: '/Users/henrik/Github/todo/test/testing/Todo.md'
    , line: 22
  }
]
  , task = 0

/**
 * Middleware
 */

for (task in tasks) {
  if (tasks.hasOwnProperty(task)) {
    unique = new Buffer(tasks[task].title.replace(/(#|@)[^ ]*/g, ''))
    md5 = crypto.createHash('md5').update(unique).digest('hex')
    tasks[task].id = md5
    tasks[task].type = tasks[task].labels[0].charAt(0).toUpperCase()+tasks[task].labels[0].slice(1)
  }
}