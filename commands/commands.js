/*jshint laxcomma:true asi:true */
var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , cmdParser = require('../command-parser')
  , redis = require('../redis-client')

module.exports = {}

var BuiltinCommand = module.exports.BuiltinCommand = function(name, params, exec) {
  this.name = name
  this.params = params
  this.exec = exec
  this.frozen = true
}

BuiltinCommand.prototype.execute = function(from, to, params, cb) {
  var paramObj = {}
  for(var i = 0; i < this.params.length; i++) {
    paramObj[this.params[i]] = params[i]
  }
  if(params.length > this.params.length)
    paramObj._rest = params.slice(this.params.length)

  paramObj._from = from
  paramObj._to = to

  this.exec(paramObj, cb)
}

var AdhocCommand = module.exports.AdhocCommand = function(tokenChain) {
  this.chain = tokenChain
}

AdhocCommand.prototype.execute = function(from, to, params, cb) {
  var self = this
  process.nextTick(function onAdhocExecNextTick() {
    var i = 0
      , cmds = []
    // verify that all the required commands exist and retrieve their descriptors
    function validate(err, cmd) {
      if(err) return cb(err)
      if(cmd) cmds.push(cmd)
      if(i >= self.chain.length) { // finished validating, execute the chain
        i = 0
        return exec(null, params)
      }

      find(self.chain[i][0], validate)
      i++
    }

    // execute command chain (called after we verify all commands)
    function exec(err, result) {
      if(err) return cb(err)
      if(i >= self.chain.length) {
        return cb(null, result)
      }
      var cmd = cmds[i]
        , cmdParams = self.chain[i].slice(1) // remove command name from params
      if(result && isString(result))
        cmdParams.push(result)
      else if(result && util.isArray(result))
        cmdParams = cmdParams.concat(result)
      else if(result)
        cmdParams.push(result)

      cmd.execute(from, to, cmdParams, exec)
      i++
    }

    validate()
  })
}

// a custom command is an adhoc command that has been named and given a parameter list
var CustomCommand = module.exports.CustomCommand =
function(name, params, tokenChain, frozen, lastModifiedBy, lastModifiedDate) {
  CustomCommand.super_.call(this, tokenChain)
  this.name = name
  this.params = params
  this.frozen = !!frozen
  this.lastModifiedBy = lastModifiedBy
  this.lastModifiedDate = lastModifiedDate ? new Date(+lastModifiedDate) : new Date()
}
util.inherits(CustomCommand, AdhocCommand)

CustomCommand.prototype.execute = function(from, to, params, cb) {
  var paramObj = {}
  for(var i = 0; i < this.params.length; i++) {
    paramObj[this.params[i]] = params[i]
  }
  if(params.length > this.params.length)
    paramObj._rest = params.slice(this.params.length)
  paramObj._from = from
  paramObj._to = to

  function replaceArgs(chain) {
    var result = [];
    console.log('replaceArgs:')
    console.dir(chain)
    for(var i = 0; i < chain.length; i++) {
      var curToken = chain[i];
      if(isString(curToken) && curToken.indexOf('%') > -1) {
        result[i] = replaceIn(curToken)
      }
      else if(util.isArray(curToken)) {
        result[i] = replaceArgs(curToken)
      }
      else if(curToken.chain) {
        result[i] = { chain: replaceArgs(curToken.chain) }
      }
      else result[i] = curToken
    }
    return result
  }

  function replaceIn(token) {
    var match
      , result = token
      , regex = /%([^%]+)%/g
    while((match = regex.exec(token))) {
      if(paramObj.hasOwnProperty(match[1])) {
        result = result.replace(match[0], getStringFor(paramObj[match[1]]))
      }
    }

    return result
  }

  function getStringFor(val) {
    if(isString(val)) return val
    else return util.inspect(val).replace(/\n/g, '')
  }

  // TODO: really need to do this without modifying the actual chain, so that this cmd object can be re-used
  this.chain = replaceArgs(this.chain)
  CustomCommand.super_.prototype.execute.call(this, from, to, null, cb)
}

var commands = {}

function loadBuiltins() {
  var files = fs.readdirSync(__dirname)
  files.forEach(function(file) { // load all the command files in this dir
    if(path.basename(__filename) == file || path.extname(file) != '.js')
      return; // don't load this file or files that aren't javascript
    require('./'  + path.basename(file, '.js'))(commands)
  })
}

function isString(o) {
  return (typeof o == 'string' ||
          (typeof o == 'object' && Object.prototype.toString.call(o) == '[object String]'))
}

var find = module.exports.find = function(name, cb) {
  if(commands[name]) {
    process.nextTick(function() {
      cb(null, commands[name])
    })
  }
  else {
    redis.hgetall('command:' + name, function(err, cmdHash) {
      if(err) return console.err('Error reading from redis: ' + err)
      if(!cmdHash) {
        var ret = new Error("A command with the name '" + name + "' could not be found.")
        ret.notFound = true
        return cb(ret)
      }
      try {
        cmdHash.chain = JSON.parse(cmdHash.chain)
        cmdHash.params = JSON.parse(cmdHash.params)
      }
      catch(err) {
        return cb(err)
      }
      var cmd = new CustomCommand(cmdHash.name, cmdHash.params, cmdHash.chain,
                                  cmdHash.frozen == 'true', cmdHash.lastModifiedBy, cmdHash.lastModifiedDate)
      cb(null, cmd)
    })
  }
}

var save = module.exports.save = function(cmd, cb) {
  if(cmd.frozen || commands[cmd.name]) {
    return process.nextTick(function() {
      cb(new Error('This command exists and cannot be modified.'))
    })
  }

  redis.multi()
        .hmset('command:' + cmd.name
              , { name: cmd.name
                , params: JSON.stringify(cmd.params || [])
                , chain: JSON.stringify(cmd.chain || [])
                , frozen: cmd.frozen ? 'true' : 'false'
                , lastModifiedBy: cmd.lastModifiedBy || ''
                , lastModifiedDate: +(cmd.lastModifiedDate || new Date())
                }
              )
        .zadd('commands', 0, cmd.name)
        .exec(function(err, replies) {
                  if(err) {
                    console.err('Error writing to redis: ' + err)
                    return cb(new Error('There was an error saving the command, please try again later.'))
                  }
                  cb(null, true)
              })
}

loadBuiltins()
