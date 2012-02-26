
/**
 * Compare
 * Mappable functions for doing comparison of two arguments a and b
 * Be aware that the operators used are "lazy"
 */

var compare = module.exports = {
  lt: function (a, b) {
    return a > b
  }
  ,lte: function (a, b) {
    return a >= b
  }
  ,gt: function (a, b) {
    return a < b
  }
  ,gte: function (a, b) {
    return a <= b
  }
  ,eq: function (a, b) {
    return a == b
  }
  ,not: function (a, b) {
    return a != b
  }

  /**
   * Return function based on operator-string
   * @param {String} op
   * @return {Function}
   */

  ,getFn: function (op) {
    switch (op) {
      case '>' : return compare.gt;
      case '<' : return compare.lt;
      case '>=': return compare.gte;
      case '<=': return compare.lte;
      case '==': return compare.eq;
      case '!=': return compare.not;
    }
    return null
  }
}
