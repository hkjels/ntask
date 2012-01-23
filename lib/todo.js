/*!
 * Todo
 * Copyright(c) 2011 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Path constants
 */

HOME = process.env.HOME
PWD = process.env.PWD

/**
 * Library version
 */

exports.version = '0.0.1'

exports.gui = require('./gui')
exports.Project = require('./project')
exports.Taskpool = require('./pool')