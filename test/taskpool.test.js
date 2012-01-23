/**
 * Test dependencies
 */

var todo = require('../lib/todo')
  , Project = todo.Project
  , Taskpool = todo.Taskpool


// Taskpool

describe('Taskpool', function () {

  var project = new Project(__dirname)
    , taskpool = new Taskpool(project)
    , tasks = []

  describe('#ack()', function () {

    it ('should return an array of tasks', function (done) {
      taskpool.ack(__dirname+'/todo.test.md', function (err, tasks) {
        tasks.should.be.an.instanceof(Array)
        tasks.should.have.lengthOf(3)
        done()
      })
    })

    describe('task', function () {

      it ('should have a certain set of properties', function () {
        tasks.forEach(function (err, task) {
          console.log('here')
          task.should.be.a('object')
          task.should.have.property('file')
            .and.should.equal('/Users/henrik/Github/todo/test/project/Todo.md')
          task.should.have.property('line')
            .and.should.be.within(2, 13)
          task.should.have.property('assignee')
          task.should.have.property('title')
          task.should.have.property('labels')
        })
      })

      it ('should match the original comment', function () {
        tasks.forEach(function (task, i) {
          if (i === 0) {
            task.labels.should.contain('todo')
            task.labels.should.contain('markdown')
            task.assignee.should.equal('assignee')
            task.body.should.not.be.empty
          }
          if (i === 1) {
            task.labels.should.contain('bug')
            task.labels.should.contain('pri[1]')
            task.assignee.should.equal('blame')
            task.body.should.not.be.empty
          }
          if (i === 2) {
            task.labels.should.contain('optimize')
            task.assignee.should.equal('none')
            task.body.should.be.empty
          }
        })
      })

    })

  })

})