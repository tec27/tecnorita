/*jshint laxcomma:true asi:true */
module.exports =  {}

module.exports.italics = function(str) {
  return '\u0016' + str + '\u0016'
}

module.exports.bold = function(str) {
  return '\u0002' + str + '\u0002'
}

module.exports.underline = function(str) {
  return '\u001F' + str + '\u001F'
}

module.exports.reset = function(str) {
  return '' + str + '\u000F'
}

module.exports.colorize = function(str, fg, bg) {
  var colorStr = '\u0003' + (fg !== null ? fg : '') +
                  (typeof bg != 'undefined' && bg !== null ? ',' + bg : '')
  return reset(colorStr + str)
}

