/*jshint laxcomma:true asi:true */
var commands = require('./commands')
  , Builtin = commands.BuiltinCommand
  , c = require('../color-utils')
  , util = require('util')
  , redis = 

module.exports = function(cmdList) {
  cmdList.help = new Builtin('help', ['command'], help)
  cmdList.set = new Builtin('set', ['command', 'params', 'body' ], set)
}

function help(params, cb) {
  process.nextTick(function() {
    if(!params.command)
      return cb(null, 'Syntax for help is: ' + c.bold('help ') + c.italics('command'))

    commands.find(params.command, function onCommandFound(err, cmd) {
      if(err) return cb(err)
      var msg = 'Syntax: ' + c.bold(params[0]) + ' ' + c.italics(cmd.params.join(' '))
      cb(null, msg)
    })
  })
}

function set(params, cb) {
  console.log(util.inspect(params, false, null, true))
}
