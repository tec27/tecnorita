var peg = require('pegjs')
  , fs = require('fs')

var grammar = fs.readFileSync('parser.pegjs', 'utf8')
  , parser = peg.buildParser(grammar)

var fileSource = 'var parser = ' + parser.toSource() +
                  '\nmodule.exports = function(line) { return parser.parse(line); }'
fs.writeFileSync('index.js', fileSource, 'utf8')
