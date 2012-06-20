// this allows us to keep a single copy of the config in memory (with the same defaults set)
// without having to do weird initialization things or pass it around to anything we require
// from the main js file
//
// the same config-loader will be referenced for each require, so the config.js will never
// be reloaded, and the defaults we initially set can be passed around properly
var config =  { nick: 'tecnorita'
              , userName: 'tecnorita'
              , realName: 'tecnorita'
              , server: 'localhost:6667'
              , channels: [ '#tecnorita' ]
              , admins: []
              , redis: 'localhost:6379'
              }
var imported = require('./config')
for(var key in imported) {
  config[key] = imported[key]
}
module.exports = config
