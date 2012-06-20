/*jshint laxcomma:true asi:true */
var commands = require('./commands')
  , Builtin = commands.BuiltinCommand
  , c = require('../color-utils')
  , util = require('util')

module.exports = function(cmdList) {
  cmdList.help = new Builtin('help', ['command'], help)
  cmdList.set = new Builtin('set', ['command', 'params', 'body' ], set)
  cmdList.unset = new Builtin('unset', ['command'], unset)
}

function help(params, cb) {
  process.nextTick(function() {
    if(!params.command)
      return cb(null, 'Syntax for help is: ' + c.bold('help ') + c.italics('command'))

    commands.find(params.command, function onCommandFound(err, cmd) {
      if(err) return cb(err)
      var msg = 'Syntax: ' + c.bold(params.command) + ' ' +
                cmd.params.map(function(param) { return c.italics(param) }).join(' ')
      cb(null, msg)
    })
  })
}

function set(params, cb) {
  if(!params.command || !params.params || !util.isArray(params.params) || !params.body || !params.body.chain) {
    return process.nextTick(function() {
      cb(null, 'Syntax: ' + c.bold('set') + ' ' + c.italics('command') + ' ' + c.italics('params') +
                ' ' + c.italics('body') +
                ' -- Example: set myCommand [paramOne, paramTwo] { echo "%paramOne%: %paramTwo%" }')
    })
  }

  commands.find(params.command, function onSetCommandFound(err, cmd) {
    if(err && !err.notFound) return cb(err)
    else if(err) {
      cmd = new commands.CustomCommand(params.command, params.params, params.body.chain,
                                        false /* frozen */, params._from, new Date())
    }
    else {
      cmd.params = params.params
      cmd.chain = params.body.chain
      cmd.lastModifiedBy = params._from
      cmd.lastModifiedDate = new Date()
    }

    commands.save(cmd, function(err, success) {
      if(err) return cb(err)
      else if(success) return cb(null, params.command + ' saved successfully.')
      else return cb(new Error('There was an error saving the command, please try again later.'))
    })
  })
}

function unset(params, cb) {
  if(!params.command) {
    return help({ command: 'unset', _from: params._from, _to: params._to }, cb)
  }

  commands.remove(params.command, function onCommandRemoved(err, success) {
    if(err) return cb(err)
    else if(success) return cb(null, params.command + ' removed successfully.')
    else return cb(new Error('There was an error removing the command, please try again later.'))
  })
}
