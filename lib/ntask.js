/*!
 * ntask
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Global path-constants
 */

HOME = process.env.HOME
PWD = process.env.PWD

/**
 * Library version
 */

exports.version = '0.0.3'

exports.gui = require('./gui')
exports.Project = require('./project')
exports.Taskpool = require('./pool')
