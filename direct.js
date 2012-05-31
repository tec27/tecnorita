/*jshint laxcomma:true asi:true */
var cmdParser = require('./command-parser')

// "direct" messages will be prepended with our nickname (in some form)
// since some irc clients add extra characters for tab-completed nicks, we'll try to handle these
// PM's are also considered 'direct' messages automatically
var directHandler = module.exports = function(tecnorita, from, to, text, message) {
  var myNick = tecnorita.config.nick
    , stripped = stripColors(text).trim()
    , command = ''

  if(to == myNick) { // PM
    command = text // in this case, no prefix is expected
  }
  else if(stripped.split(/[:,. ]+/, 2)[0] == myNick) {
    // remove prefix (without removing colors/formatting from the rest of the message)
    command = text.trim()
    var colorRegex = /[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/
      , match
    while(command.slice(0, myNick.length) != myNick) {
      // remove formatting at the beginning
      match = colorRegex.exec(command)
      command = command.substr(0,match.index) + command.substr(match.index + match[0].length)
    }
    command = command.slice(myNick.length)
    while(command.length && !/^[:,. ]+/.test(command)) {
      // remove formatting before delimiter
      match = colorRegex.exec(command)
      command = command.substr(0,match.index) + command.substr(match.index + match[0].length)
    }
    command = command.replace(/^[:,. ]+/, '')
    while(command.length && (match = colorRegex.exec(command)) !== null && match.index === 0) {
      // replace any lingering formatting before initial part of the command
      command = command.substr(0,match.index) + command.substr(match.index + match[0].length)
      command = command.trim()
    }
  }
  else return false

  process.nextTick(function() {
    parseAndExec(tecnorita, from, to, command, message)
  })

  return true
}

function stripColors(text) {
  var colorRegex = /[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/g
  return text.replace(colorRegex,'')
}

function parseAndExec(tecnorita, from, to, command, message) {
  var target = to != tecnorita.config.nick ? to : from
  tecnorita.chat.say(target, 'direct: ' + command)
}

function NativeCommand() {

}

function CompositeCommand() {

}
