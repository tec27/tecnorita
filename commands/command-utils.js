/*jshint laxcomma:true asi:true */
var commands = require('./commands')
  , Builtin = commands.BuiltinCommand
  , c = require('../color-utils')

module.exports = function(cmdList) {
  cmdList.help = new Builtin('help', ['command'], help)
}

function help(params, cb) {
  process.nextTick(function() {
    if(params.length != 1)
      return cb(null, 'Syntax for help is: ' + c.bold('help ') + c.italics('command'))

    commands.find(params[0], function onCommandFound(err, cmd) {
      if(err) return cb(err)
      var msg = 'Syntax: ' + c.bold(params[0]) + ' ' + c.italics(cmd.params.join(' '))
      cb(null, msg)
    })
  })
}
