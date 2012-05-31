var should = require('should')
  , parser = require('../command-parser.js')

describe('command-parser', function() {
  it('should parse a simple line', function() {
    parser('test command').should.eql([ ['test', 'command'] ])
  })

  it('should parse a simple line with pipes', function() {
    parser('test command | second command').should.eql(
      [ [ 'test', 'command' ]
      , [ 'second', 'command' ]
      ]
    )
  })

  it('should handle quoted strings', function() {
    parser('my "quoted string"').should.eql([ ['my', 'quoted string'] ])
    parser('"my quoted" string').should.eql([ ['my quoted', 'string'] ])
    parser('my"not quoted string').should.eql([ ['my"not', 'quoted', 'string'] ])
    parser('"my quoted"string').should.eql([ ['my quoted', 'string'] ])
    parser('"should handle | pipes"').should.eql([ ['should handle | pipes'] ])
  })

  it('should handle escaping', function() {
    parser('normal\\s dont do anything').should.eql([ ['normal\\s', 'dont', 'do', 'anything'] ])
    parser('"inside quotes they do: \\" escaped!"').should.eql([ ['inside quotes they do: " escaped!'] ])
    parser('"we can also escape slashes: \\\\ escaped!"').should
            .eql([ ['we can also escape slashes: \\ escaped!'] ])
  })

  it('should give a syntax error for invalid escapes', function() {
    ;(function() {
      parser('"\\n test!"')
    }).should.throw()
  })

  it('should give a syntax error for piping from empty commands', function() {
    ;(function() {
      parser('test | | test2')
    }).should.throw()
  })

  it('should give a syntax error for not closing quotes before the end of input', function() {
    ;(function() {
      parser('test "woo')
    }).should.throw()
  })

  it('should parse a complex line with pipes', function() {
    parser('test "command here" | piped "all the \\"way\\"" | to a third command').should.eql(
      [ [ 'test', 'command here' ]
      , [ 'piped', 'all the "way"' ]
      , [ 'to', 'a', 'third', 'command' ]
      ]
    )
  })
})
