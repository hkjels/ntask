
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
  var obj = { id: [], assignee: null, labels: [], text: '', done: false, sortby: 'added', flawed: false }
    , words = query.toLowerCase().replace(/^[^a-z0-9-_@#\.\* ]*$/g, '').split(' ')

  /**
   * Loop through the words and place them in "obj" accordingly
   */

  words.forEach(function (word) {

    /**
     * First character can be used as a type-identifier for faster and more
     * accurate queries.
     */

    switch (word[0]) {

      /**
       * Assignee
       */

      case '@' : {
        obj.assignee = word.replace(/^\@[^a-z0-9-_]*$/gi, '')
        if (obj.assignee === '@unassigned') obj.assignee = '@none'
        break
      }

      /**
       * Label
       */

      case '#' : {

        var label = word.replace(/[^\#a-z0-9\.\<\>\[\=]*/gi, '').split('[')
          , key = label[0]

        /**
         * With filter and/or sort
         */

        if (label.length > 1) {
          if (word.charAt(word.length-1) == '*') obj.sortby = key
          var op = label[1].replace(/[^\<\>\=]*/g, '') || '=='
            , val = label[1].replace(/[^a-f0-9\.]*/g, '')
            , fn = compare.getFn(op)
        }

        /**
         * Without filter
         */

        else {
          var val = null
            , fn = function () { return true }
        }

        /**
         * Add label to query-object
         */

        obj.labels.push({key: key, val: val, fn: fn})

        break
      }

      /**
       * Id
       */

      case ':' : {
        var id = word.replace(/[^0-9a-f]/g, '')
        if (id.length == 8) obj.id.push(id)
        break
      }

      /**
       * Plain text
       */

      default : obj.text += word.trim()+' '
    }
  })

  return obj
}

