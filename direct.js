/*jshint laxcomma:true asi:true */
var cmdParser = require('./command-parser')
  , util = require('util')
  , commands = require('./commands/commands')

// "direct" messages will be prepended with our nickname (in some form)
// since some irc clients add extra characters for tab-completed nicks, we'll try to handle these
// PM's are also considered 'direct' messages automatically
var directHandler = module.exports = function(tecnorita, from, to, text, message) {
  var myNick = tecnorita.config.nick
    , shortPrefix = tecnorita.config.shortPrefix
    , stripped = stripColors(text).trim()
    , command = ''

  if(to == myNick) { // PM
    command = text // in this case, no prefix is expected
  }
  else if(shortPrefix && text.slice(0, shortPrefix.length) == tecnorita.config.shortPrefix) {
    command = text.substr(shortPrefix.length)
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
    , parsedCmd

  try {
    parsedCmd = cmdParser(command)
  }
  catch(err) {
    return tecnorita.chat.say(target, err.message)
  }

  //tecnorita.chat.say(target, util.inspect(parsedCmd).replace(/\n/g, ''))
  var executor = new commands.AdhocCommand(parsedCmd)
  executor.execute(null, function onExecutedCommand(err, result) {
    if(err) return tecnorita.chat.say(target, 'Error: ' + err.message)
    handleResult(tecnorita, target, message, result)
  })
}

function handleResult(tecnorita, target, raw, result) {
  if(typeof result == 'undefined' || result === null) return
  else if(isFunction(result)) result(tecnorita, target, raw)
  else if(isString(result)) tecnorita.chat.say(target, result)
  else {
    var strResult = util.inspect(result).replace(/\n/g, '')
    if(strResult.length > 450) strResult = strResult.substr(0, 447) + '...'
    tecnorita.chat.say(target, strResult)
  }
}

function isFunction(o) {
  return (typeof o == 'function' ||
          (typeof of == 'object' && Object.prototype.toString.call(o) == '[object Function]'))
}

function isString(o) {
  return (typeof o == 'string' ||
          (typeof o == 'object' && Object.prototype.toString.call(o) == '[object String]'))
}
