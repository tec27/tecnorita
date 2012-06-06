var should = require('should')
  , parser = require('../command-parser')

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

  it('should handle arrays', function() {
    parser('test [ arrays, are, cool , woo ,yes ]').should.eql(
      [ ['test',  [ 'arrays'
                  , 'are'
                  , 'cool'
                  , 'woo'
                  , 'yes'
                  ]
        ]
      ]
    )
  })

  it('should handle arrays with quoted entries', function() {
    parser('test [ "arrays, with, quoted", things ]').should.eql(
      [ ['test',  [ 'arrays, with, quoted'
                  , 'things'
                  ]
        ]
      ]
    )
  })

  it('should handle empty arrays', function() {
    parser('test [] test2').should.eql([ ['test', [], 'test2' ] ])
  })

  it('should handle subfunctions', function() {
    var res = parser('test { test2 | test3 } { test4 | test5 }')
    res[0].length.should.eql(3)
    res[0][0].should.eql('test')
    res[0][1].chain.should.eql([ ['test2'], ['test3'] ])
    res[0][2].chain.should.eql([ ['test4'], ['test5'] ])
  })

  it('should handle nested subfunctions', function() {
    var res = parser('test { test2 { test3 | test4 } | test5 }')
    res[0].length.should.eql(2)
    res[0][0].should.eql('test')
    res[0][1].chain.length.should.eql(2)
    res[0][1].chain[0][0].should.eql('test2')
    res[0][1].chain[0][1].chain.should.eql([ ['test3'], ['test4'] ])
    res[0][1].chain[1].should.eql([ 'test5' ])
  })
})
