// parser for "simplified shell" syntax, IE:
// myCmd param1 param2 | secondCmd "quoted string param 1" | thirdCmd

var parse = module.exports = function(line) {
  var next
    , state = ' '
    , escaping = false
    , commands = []
    , tokens = []
    , tok = ''

  function getNext() {
    next = line.length ? line[0] : null
    if(line.length) line = line.slice(1)
  }

  function readToken() {
    getNext()
    if(next === null && state != ' ')
      throw new Error('Syntax error: line ended unexpectedly. Did you forget a quote?')
    else if(next === null) {
      if(tok) tokens.push(tok)
      if(tokens.length) commands.push(tokens)
      return false
    }

    if(state == ' ') {
      if(!tok && next == '"') {
        state = '"'
      }
      else if(next == '|') {
        if(tok) {
          tokens.push(tok);
          tok = ''
        }
        if(tokens.length) {
          commands.push(tokens)
          tokens = []
        }
        else throw new Error('Syntax error: Pipe from empty command')
      }
      else if(next == ' ') {
        if(tok) {
          tokens.push(tok)
          tok = ''
        }
      }
      else {
        tok += next
      }
    }
    else if(state == '"') {
      if(!escaping && next == '\\') {
        escaping = true
      }
      else if(!escaping && next == '"') {
        state = ' '
        tokens.push(tok)
        tok = ''
      }
      else if(escaping && !(next == '\\' || next == '"')) {
        throw new Error('Syntax error: unknown escape character: ' + next)
      }
      else if(escaping) {
        tok += next
        escaping = false
      }
      else {
        tok += next
      }
    }

    return true
  }

  while(readToken()) {}

  return commands
}
