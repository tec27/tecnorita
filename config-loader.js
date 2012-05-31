// this allows us to keep a single copy of the config in memory (with the same defaults set)
// without having to do weird initialization things or pass it around to anything we require
// from the main js file
//
// the same config-loader will be referenced for each require, so the config.js will never
// be reloaded, and the defaults we initially set can be passed around properly
var _ = require('underscore')

var config =  { nick: 'tecnorita'
              , userName: 'tecnorita'
              , realName: 'tecnorita'
              , server: 'localhost:6667'
              , channels: [ '#tecnorita' ]
              , admins: []
              , redis: 'localhost:6379'
              }
config = _.extend(config, require('./config'))
module.exports = config
