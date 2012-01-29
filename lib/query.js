
/**
 * Module dependencies
 */

var comp = require('./comparison')


/**
 * Parse query
 * Will sanitize & split a query into sensible key/values
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

module.exports = function queryParser(query) {
  var obj = { assignee: null, labels: [], text: '', done: false }
    , words = query.toLowerCase().replace(/^[^a-z0-9-_@# ]*$/g, '').split(' ')
    , lnum = 0

  /**
   * Loop through the words and place them in "obj" accordingly
   */

  words.forEach(function (word) {
    switch (word[0]) {
      case '@' : {
        obj.assignee = word
        break
      }
      case '#' : {
        var label = word.replace(']', '').split('[')
          , key = label[0]

        if (label.length > 1) {
          var op = label[1].replace(/[0-9]*/g, '') || '=='
            , val = label[1].replace(/[\>\<\=]*/g, '')
            , fn = comp.getOp(op)
        }

        else {
          var val = null
            , fn = function () { return true }
        }

        obj.labels[lnum] = {
             key: label[0]
            ,val: val
            ,fn: fn
        }

        lnum++
        break
      }
      default : obj.text += word
    }
  })

  return obj
}
