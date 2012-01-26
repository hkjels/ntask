
/**
 * Test dependencies
 */

var Project = require('../lib/todo').Project

describe('Project', function () {

  var dir = __dirname+'/fixtures'
    , project = {}

  describe('init', function () {

    it ('should return true when a project is initialized', function () {
      Project.init(dir).should.be.ok
    })

    it ('should return false when a project already exists', function () {
      Project.init(dir).should.not.be.ok
    })

  })

  describe('exists', function () {

    it ('should return true, as a project has been initialized', function () {
      project = new Project(dir)
      project.exists().should.be.ok
    })

  })

  describe('resolvePaths', function () {

    it ('should set path-options & return the project instance', function () {
      project.resolvePaths(dir).root.should.equal(dir)
      project.storage.should.equal(dir+'/.todo')
    })

  })

})
