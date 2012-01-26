/**
 * Test dependencies
 */

var todo = require('../lib/todo')
  , Project = todo.Project
  , Taskpool = todo.Taskpool


// Taskpool

describe('Taskpool', function () {

  var dir = __dirname+'/fixtures'
    , project = new Project(dir)
    , taskpool = new Taskpool(project)
    , tasks = []

  describe('.ack()', function () {
    it ('should search for tasks', function (done) {
      taskpool.ack(dir+'/task.fixture', function (err, ptasks) {
        ptasks.should.be.an.instanceof(Array)
        tasks = ptasks
        done()
      })
    })
  })

  describe('tasks', function () {
    it ('should have been populated by ack', function () {
      tasks.should.have.lengthOf(5)
    })

    describe('task', function () {
      it ('should be parsed into an object that corresponds with the task-model', function () {
        tasks.forEach(function (task) {
          task.should.be.an.instanceof(Object)
          task.should.have.property('file')
          task.should.have.property('line')
          task.should.have.property('title')
          task.should.have.property('assignee')
          task.should.have.property('labels')
        })
      })
    })

    describe('task#1', function () {
      it ('should be a todo with certain parameters', function () { 
        var task = tasks[0]
        task.assignee.should.equal('@none')
        task.title.should.equal('is for planning future tasks')
        task.labels[0].should.equal('#todo')
      })
    })

    describe('task#2', function () {
      it ('should be a bugreport with certain parameters', function () {
        var task = tasks[1]
        task.assignee.should.equal('@none')
        task.title.should.equal('is for reporting problems')
        task.labels[0].should.equal('#bug')
      })
    })

    describe('task#3', function () {
      it ('should be a task of type fixme with certain parameters', function () {
        var task = tasks[2]
        task.assignee.should.equal('@blame')
        task.title.should.equal('is for really critical issues')
        task.labels[0].should.equal('#fixme')
      })
    })

    describe('task#4', function () {
      it ('should be a task of type optimize with certain parameters', function () {
        var task = tasks[3]
        task.assignee.should.equal('@none')
        task.title.should.equal('is for known bottlenecks')
        task.labels[0].should.equal('#optimize')
      })
    })

    describe('task#5', function () {
      it ('should be a task of type optimize with certain parameters', function () {
        var task = tasks[4]
        task.assignee.should.equal('@none')
        task.title.should.equal('Quite a few comment-syntaxes are supported')
        task.should.have.property('body').with.lengthOf(108)
        task.labels[0].should.equal('#optimize')
      })
    })

  })
})
