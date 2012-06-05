{
  function Subfunction(chain) {
    this.chain = chain
  }
}

start
  = pipe

pipe
  = left:command ' '* '|' ' '* right:pipe { right.unshift(left); return right }
  / left:command ' '* { return [ left ] }

command
  = left:token ' '+ right:command { right.unshift(left); return right }
  / left:subfunction ' '+ right:command { right.unshift(left); return right }
  / left:array ' '+ right:command { right.unshift(left); return right }
  / left:subfunction ' '* { return [ left ] }
  / left:array ' '* { return [ left ] }
  / left:token ' '* { return [ left ] }

subfunction
  = '{' ' '* expr:pipe ' '* '}' { return new Subfunction(expr) }

array
  = '[' ' '* list:list ' '* ']' { return list }

list
  = left:token ' '* ',' ' '* right:list { right.unshift(left); return right }
  / left:token { return [ left ] }

token
  = '"' literal:chars_with_escapes* '"' { return literal.join('') }
  / literal:char+ { if(literal[0] == '"') return null; return literal.join('') }

char
  = [^ {[|\]},]

chars_with_escapes
  = '\\\\' { return '\\' }
  / '\\"' { return '"' }
  / '\\' c:[^\\"] { return null }
  / c:[^"\\] { return c }

