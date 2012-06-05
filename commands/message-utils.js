/*jshint laxcomma:true asi:true */
var Builtin = require('./commands').BuiltinCommand

module.exports = function(cmdList) {
  cmdList.echo = new Builtin('echo', ['message'], echo)
  cmdList.emote = new Builtin('emote', ['action'], emote)
}

function echo(params, cb) {
  process.nextTick(function() {
    if(params._rest && params._rest.length)
      cb(null, [params.message].concat(params._rest).join(' '))
    else
      cb(null, params.message)
  })
}

function emote(params, cb) {
  process.nextTick(function() {
    cb(null, function(tecnorita, target, raw) {
      try {
        var msg
        if(params._rest && params._rest.length)
          msg = [params.action].concat(params._rest).join(' ')
        else
          msg = params.action
        tecnorita.chat.action(target, msg)
      }
      catch(err) {
      }
    })
  })
}
