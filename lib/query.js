
/*!
 * ntask
 * Copyright(c) 2012 Henrik Kjelsberg <hkjels@me.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var compare = require('compare'),
    stem = require('porter-stemmer').stemmer;

/**
 * query
 *
 * Will sanitize & create a computer-friendly query from 'string'
 *
 * @param {String} 'string'
 * @return {Object}
 */

var query = module.exports = function query(string) {
  var words = string.toLowerCase()
    .replace(/^[^a-z0-9-_@#\.\* ]*$/g, '')
    .split(' ');

  var obj = {
    id: [],
    assignee: null,
    labels: [],
    text: '',
    done: false,
    sortby: 'added'
  };

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
       *
       * Starts with an '@'-symbol and contains mostly alphanumeric-characters
       */

      case '@' : {
        obj.assignee = word.replace(/^\@[^a-z0-9-_]*$/gi, '');
        if (obj.assignee === '@unassigned') obj.assignee = '@none';
        break;
      }

      /**
       * Label
       *
       * Starts with a '#'-symbol and contains mostly alpanumeric-characters.
       * Labels can also include a value, that can be sorted and filtered upon
       * using operators.
       *
       * Examples
       *
       *    #normal #withValue[1] #withExpression[>1] #withSortedExpression[>1]*
       */

      case '#' : {
        var label = word.split('['),
            key = label[0].replace(/[^\#a-z0-9]*/gi, ''),
            val = label[1],
            fn = function () { return true };

        /**
         * Has filter and/or sorting enabled
         */

        if (label.length > 1) {
          if (word.charAt(word.length-1) == '*') obj.sortby = key;
          var op = val.replace(/[^\<\>\=]*/g, '') || '==',
              val = val.replace(/[^a-f0-9\.]*/g, ''),
              fn = compare.getFn(op);
        }

        obj.labels.push({key: key, val: val, fn: fn});
        break;
      }

      /**
       * Id
       *
       * Starts with a semi-colon and contains only eight alphanumeric-
       * characters. You can specifiy multiple id's, but you can not mix them
       * with other query-symbols
       */

      case ':' : {
        var id = word.replace(/[^0-9a-f]/g, '');
        if (id.length == 8) obj.id.push(id);
        break;
      }

      /**
       * Plain text
       */

      default : obj.text += stem(word.toLowerCase().trim())+' ';
    }
  })

  /**
   * Simplify query-object if id's are present
   */

  if (obj.id.length) {
    obj.assignee = null;
    obj.text = '';
    obj.done = false;
  }

  return obj;
}

