var Builtin = require('./commands').BuiltinCommand

module.exports = function(cmdList) {
  cmdList.echo = new Builtin('echo', 'message', echo)
  cmdList.emote = new Builtin('emote', 'action', emote)
}

function echo(params, cb) {
  process.nextTick(function() {
    cb(null, params.join(' '))
  })
}

function emote(params, cb) {
  process.nextTick(function() {
    cb(null, function(tecnorita, target, raw) {
      try {
        tecnorita.chat.action(target, params.join(' '))
      }
      catch(err) {
      }
    })
  })
}
