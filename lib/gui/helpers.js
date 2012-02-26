
var pkgpath = __dirname+'/../../package.json'

module.exports = function (app) {
  // Helpers
  app.helpers({
      meta: JSON.parse(require('fs').readFileSync(pkgpath))
    , tasks: []
    , filter: null
  })
}
