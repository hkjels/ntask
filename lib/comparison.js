
/**
 * Comparison
 */

var comparison = module.exports = {
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
   * Return comparison-function based on operator
   * @param {String} op
   */

  ,getOp: function (op) {
    switch (op) {
      case '>' : return comparison.gt;
      case '<' : return comparison.lt;
      case '>=': return comparison.gte;
      case '<=': return comparison.lte;
      case '==': return comparison.eq;
      case '!=': return comparison.not;
    }
  }
}
