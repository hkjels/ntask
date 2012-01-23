
/**
 * Test dependencies
 */

var Project = require('../lib/todo').Project

describe('Project', function () {

  var project = {}

  describe('init', function () {

    it ('should return true when a project is initialized', function () {
      Project.init(__dirname).should.be.ok
    })

    it ('should return false when a project already exists', function () {
      Project.init(__dirname).should.not.be.ok
    })

  })

  describe('exists', function () {

    it ('should return true, as a project has been initialized', function () {
      project = new Project(__dirname)
      project.exists().should.be.ok
    })

  })

  describe('resolvePaths', function () {

    it ('should set path-options & return the project instance', function () {
      project.resolvePaths(__dirname).root.should.equal(__dirname)
      project.storage.should.equal(__dirname+'/.todo')
    })

  })

})
