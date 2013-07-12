
/**
 * Module dependencies.
 */

var fs = require('fs'),
    isBinary = require('isbinaryfile');

// Expose `pluck`

module.exports = pluck;

/**
 * Patterns used to match tasks
 *
 * One with a slightly untraditional syntax.
 * @see http://hkjels.github.com/ntask/syntax/
 *
 * And one more traditional/boring syntax
 * @see http://www.riedquat.de/TR/trunk/TODO_Syntax/
 */

var pattern = new RegExp('[#@\/\* ]+('+KEYWORDS+')[ \:]{1,}', 'g'),
    isoPattern = new RegExp('[#@\/\* ]+('+KEYWORDS+'):(\\d{4,}-\\d{2}-\\d{2}):([^:]+):(.*)', 'g');

/**
 * Pluck
 *
 * Transform those boring strings into beautiful task-objects
 *
 * @param {String} path
 * @param {Function} cb
 */

function pluck(path, cb) {
  var tasks = [];
  fs.readFile(path, 'utf8', function (err, str) {
    if (err) return cb(err);

    /**
     * Skip binary-files
     */

    if (isBinary(str)) return;

    /**
     * Pointer within the file
     */

    var lines = str.split('\n'),
        linum = 0;

    while (lines.length) {
      var line = lines.shift(); linum++;

      /**
       * Check for task-comment
       */

      if (!pattern.test(line)) continue;

      /**
       * Old-style comments
       * @see http://www.riedquat.de/TR/trunk/TODO_Syntax/
       */

      var matches = line.match(isoPattern);
      if (matches != null) {
        matches = matches.toString().split(':');
        var labels = ['#'+matches[0].toLowerCase()],
            added = new Date(matches[1]),
            assignee = '@'+matches[2].replace(/[\\s]*/, '-'),
            linestart = linum,
            title = matches[3],
            body = '';
      }

      /**
       * New-style comments
       *
       * TODO Write a comment specification
       *    | Should be located at the address below
       *
       * TODO Share patterns between modules
       *    | Perhaps even make all of them global
       *
       * @see http://hkjels.github.com/ntask/syntax.html
       */

      else {
        var added = new Date(),
            assignee = (line.match(/@[\w\[\d\]-_]*/g)||['@none'])[0],
            title = line.replace(new RegExp('.*('+KEYWORDS+')'), '')
              .replace(assignee, '')
              .replace(/[^a-z0-9\!\]\)]*$/i, '').trim(),
            linestart = linum,
            body = (function body() {
              var next = lines.shift();
              if (/[\\s]*[\\\*\%\-(" )"]{0,3}[\|]/g.test(next)) {
                linum++;
                return next.split('|').slice(1).join('').trim()+'\n'+body();
              }
              else {
                lines.unshift(next);
                return '';
              }
            })(),
            labels = ((title+body).match(/#[\w]*[\[\]a-f0-9\.]*/gi) || [])
              .map(lowertrim).filter(minlength),
            keyword = line.match(new RegExp('.*('+KEYWORDS+')'))[1].toLowerCase();
            labels.unshift('#'+keyword);
      }
      var done = labels.indexOf('#done') != -1;

      /**
       * Parsed task-object ready for model-validation
       */

      var task = {
          added: added
        , assignee: assignee
        , body: body
        , done: done
        , file: path
        , labels: labels
        , line: linestart
        , title: title
      };
      tasks.push(task);
    }
    cb(false, tasks);
  });
}

function lowertrim (str) {
  return str.toLowerCase().trim();
}

function minlength (str) {
  return str.length > 1;
}

