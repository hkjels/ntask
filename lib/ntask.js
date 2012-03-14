/*!
 * ntask
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Global constants
 */

HOME = process.env.HOME
PWD = process.env.PWD
KEYWORDS = ['TODO', 'DONE', 'BUG', 'FIXME', 'OPTIMIZE', 'XXX', 'REVIEW'].join('|')

/**
 * Library version
 */

exports.version = '0.0.4'

exports.gui = require('./gui')
exports.Project = require('./project')
exports.Taskpool = require('./pool')
