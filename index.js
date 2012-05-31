/*jshint laxcomma:true asi:true */
var irc = require('irc')
  , redis = require('redis')
  , _ = require('underscore')
  , config = require('./config-loader')

function Tecnorita(config) {
  if(!(this instanceof Tecnorita)) return new Tecnorita(config);
  console.log('tecnorita starting...')
  var serverSplit = config.server.split(/:/)
    , serverHost = serverSplit[0]
    , serverPort = serverSplit.length > 1 ? serverSplit[1] : 6667

  console.log('connecting to %s:%s as %s', serverHost, serverPort, config.nick)
  this.chat = new irc.Client( serverHost
                            , config.nick
                            , { userName: config.userName
                              , realName: config.realName
                              , port: serverPort
                              , debug: true
                              }
                            );
  this.chat.on('registered', this.onRegistered.bind(this))
          .on('names', this.onNames.bind(this))
          .on('topic', this.onTopic.bind(this))
          .on('nick', this.onNickChange.bind(this))
          .on('message', this.onMessage.bind(this))

  this.config = config
  this.channels = {}
  this.messageHandlers =  [ require('./direct.js')
                          , require('./indirect.js')
                          ]
}

Tecnorita.prototype.onRegistered = function(message) {
  console.log('connected.')

  var self = this
  this.config.channels.forEach(function(channel) {
    console.log('joining %s...', channel)
    self.chat.join(channel, function() {
      console.log('joined %s.', channel)
    })
  })
}

Tecnorita.prototype.onNames = function(channel, nicks) {
  this.channels[channel] = this.channels[channel] || {}
  this.channels[channel].nicks = nicks;
}

Tecnorita.prototype.onTopic = function(channel, topic, nick, message) {
  this.channels[channel] = this.channels[channel] || {}
  this.channels[channel].topic =  { msg: topic
                                  , setBy: nick
                                  , setAt: message.args.length > 3 ? new Date(message.args[3]): new Date()
                                  }
}

Tecnorita.prototype.onNickChange = function(oldNick, newNick, channels, message) {
  _.each(this.channels, function(chanData) {
    var oldVal = chanData[oldNick] || ''
    ;delete chanData[oldNick]
    chanData[newNick] = oldVal
  })
}

Tecnorita.prototype.onMessage = function(nick, to, text, message) {
  for(var i = 0; i < this.messageHandlers.length; i++) {
    var res = this.messageHandlers[i](this, nick, to, text, message)
    if(res) break;
  }
}

var tecnorita = new Tecnorita(config)
