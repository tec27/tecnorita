/*jshint laxcomma:true asi:true */
var fs = require('fs')
  , path = require('path')
  , util = require('util')

module.exports = {}

var BuiltinCommand = module.exports.BuiltinCommand = function(name, params, exec) {
  this.name = name
  this.params = params
  this.exec = exec
}

BuiltinCommand.prototype.execute = function(params, cb) {
  this.exec(params, cb)
}

var AdhocCommand = module.exports.AdhocCommand = function(tokenChain) {
  this.chain = tokenChain
}

AdhocCommand.prototype.execute = function(params, cb) {
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
        cmdParams.concat(result)
      else if(result)
        cmdParams.push(result)

      // TODO: parameter/environment var replacement, IE: %argname% => argname's value

      cmd.execute(cmdParams, exec)
      i++
    }

    validate()
  })
}

// a custom command is an adhoc command that has been named and given a parameter list
var CustomCommand = module.exports.CustomCommand = function(name, params, tokenChain) {
  CustomCommand.super_.call(this, tokenChain)
  this.name = name
  this.params = params
}
util.inherits(CustomCommand, AdhocCommand)

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
    // TODO: look for command in redis
    process.nextTick(function() {
      cb(new Error("A command with the name '" + name + "' could not be found."))
    })
  }
}

loadBuiltins()
