
/**
 * Module dependencies
 */

var fs = require('./readdirIgnore'),
    join = require('path').join,
    setrlimit = require('posix').setrlimit,
    pluck = require('./pluck');

/**
 * Raise the number of open file-descriptors at a time to 10.000, ensuring that
 * `dive` will execute a lot faster.
 */

var running = 0,
    concurrency = 10000;

/**
 * TODO @henrik Research a better solution to setting #ulimit
 *    | Current solution does not work properly on ubuntu.
 */

try { setrlimit('nofile', {soft: concurrency}) }
catch (e) { concurrency = 256 }

/**
 * Dive
 *
 * Dives into your project and looks for tasks
 * It will recurse every directory below the target except for those specified
 * in ".todoignore"
 *
 * @param {String} path
 * @param [Array] list
 * @param {Function} cb
 */

var dive = module.exports = function dive (path, list, cb) {
  fs.stat(path, function (err, stat) {
    if (err) return cb(err);

    // Recurse directory

    if (stat.isDirectory()) {
      fs.readdirIgnore(path, list, function (err, file) {
        if (err) return cb(err);
        return dive(join(path, file), list, cb);
      })
    }

    // Look through files for tasks

    if (stat.isFile()) {
      if (running > concurrency) {
        return process.nextTick(function () {
          dive(path, list, cb);
        })
      }
      running++;

      // Pluck the tasks out

      running--;
      pluck(path, cb);
    }
  });
};

