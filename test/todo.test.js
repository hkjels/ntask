
/**
 * Test dependencies
 */

var todo = require('../lib/todo')

describe('constants', function () {

  it ('should have two constants', function () {
    HOME.should.be.a('string')
    PWD.should.be.a('string')
  })

})

describe('version', function () {

  it ('should return a number separated with two punctuations', function () {
    todo.version.should.match(/^[\d]{1,2}\.[\d]{1,2}\.[\d]{1,2}$/)
  })

})
