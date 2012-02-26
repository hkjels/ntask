
/**
 * Module dependencies
 */

var compare = require('./compare')


/**
 * Parse query
 * Will sanitize & split a query into sensible key/values
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

var query = module.exports = function query(query) {
  var obj = { assignee: null, labels: [], text: '', done: false, sortby: 'added' }
    , words = query.toLowerCase().replace(/^[^a-z0-9-_@#\.\* ]*$/g, '').split(' ')

  /**
   * Loop through the words and place them in "obj" accordingly
   */

  words.forEach(function (word) {
    switch (word[0]) {
      case '@' : {
        obj.assignee = word.replace(/^\@[^a-z0-9-_]*$/gi, '')
        if (obj.assignee == '@unassigned') obj.assignee = '@none'
        break
      }
      case '#' : {
        var label = word.replace(/[^\#a-z0-9\.\<\>\[\]\=]*/gi, '')
                        .replace(']', '').split('[')
          , key = label[0]

        /**
         * Label with filter
         */

        if (label.length > 1) {
          if (word.charAt(word.length-1) == '*') obj.sortby = key
          var op = label[1].replace(/[^\<\>\=]*/g, '') || '=='
            , val = label[1].replace(/[^0-9\.]*/g, '')
            , fn = compare.getFn(op)
        }

        /**
         * Label without filter
         */

        else {
          var val = null
            , fn = function () { return true }
        }

        obj.labels.push({key: label[0], val: val, fn: fn})

        break
      }
      default : obj.text += word
    }
  })

  return obj
}
