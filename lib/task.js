/*!
 * Todo
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var crypto = require('crypto')

/**
 * Expose `Task`
 */

exports = module.exports = Task

/**
 * Task
 * Model used by Barricane
 */

function Task(task) {

  // Populate taskmodel

  for (var prop in task) {
    if (task[prop] !== undefined) this[prop] = task[prop]
  }

  if (task !== undefined) this.createId()

  // Register model with Barricane

  process.db.registerInstance(this)
}

/**
 * Create a unique id
 * Strips trackable elements from the title & uses an md5-hash of the remainder
 * to create a unique id for the task
 *
 * @return {Task}
 * @api private
 */

Task.prototype.createId = function () {
  title = this.title.replace(/(TODO|BUG|OPTIMIZE)((#|@)[^ ]*)/g, '')
  if (title.length > 10) {
    this.__uuid__ = crypto.createHash('md5').update(new Buffer(title)).digest('hex')
  }
  return this
}

/**
 * Validates the task at hand
 *
 * @return {Boolean}
 * @api private
 */

Task.prototype.isValid = function () {
  return (
    typeof this.assignee !== 'undefined' && this.assignee.length > 1 &&
    typeof this.labels !== 'undefined' && this.labels.length > 0 &&
    typeof this.__uuid__ !== 'undefined' && this.__uuid__.length === 32
  )
}