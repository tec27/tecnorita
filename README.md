##tecnorita
_tecnorita_ is an IRC bot written in JavaScript using [node.js](http://nodejs.org). It is designed to be extensible and powerful for anyone in the channels it occupies, allowing users to utilize and compose a collection of basic commands to form new commands.

This project is still very much a work in progress and will likely change significantly.

##Usage
_tecnorita_'s commands are simple, unix-y functions that can be chained together to do useful things. All of the built-in commands can be used in custom commands, which can be stored in redis using the `set` command. Commands are parsed from a fairly simple syntax, namely:

* Regular words (separated by spaces) count as strings. If you want to have a space in a single string, you can quote the string ( `"This will be parsed as a single string!" But this will be five!`)
* Lists can be given by surrounding a comma-separated list of strings with brackets ( `[ first, second ]`)
* Sub-commands (command-ception!) can be given by surrounding a block in braces ( `{ echo Hello! }` )

Any value left over at the end of the command chain will be output to the channel the command was received on, in some form. The forms depend on the type left over:

* Strings will be output directly
* Arrays and objects will be converted to JSON.
* Functions (only returnable by built-ins) will be called with the current instance of `tecnorita`, the `target` of the original command, and access to the `raw` message info given by _node-irc_

Commands can be executed by addressing the bot directly:
```
<user> tecnorita: echo hello
<tecnorita> hello
```
Or by preceding them with the prefix specified in the configuration:
```
<user> \`echo hello
<tecnorita> hello
```

They can be chained together by using `|`:
```
<user> \`echo dances! | emote
\* tecnorita dances!
```

###Built-in Commands (currently implemented)
####command utilities
*help* `command`
Provides help for a specific command, listing its parameters.
```
<user> \`help unset
<tecnorita> Syntax: unset command
```

*set* `name` [ `paramList` ] { `command body` }
Adds a custom command to the database.
```
<user> \`set addressedMsg [ target, msg ] { echo "%msg%, %target%!" }
<tecnorita> addressedMsg saved successfully.
<user> \`addressedMsg everyone "Good news"
<tecnorita> Good news, everyone!
```

*unset* `command`
Removes a custom command from the database.
```
<user> \`unset addressedMsg
<tecnorita> addressedMsg removed successfully.
```

####messaging
*echo* `message`
Outputs the specified message.
```
<user> \`echo Hello!
<tecnorita> Hello!
```

*emote* `action`
Performs the specifiedd action.
```
<user> \`emote dances!
\* tecnorita dances!
```

###Built-in Commands (coming soon)
* More command utilities (freezing/unfreezing, searching, appending)
* HTTP Handlers
* HTML Parsing/Selectors
* JSON Parsing/Selectors
* List manipulation, map/reduce, etc.
* And much more!

##Installation
Simply clone this repo, `npm install` to get the dependencies, then create a `config.js` for your particular setup. There is a sample config provided in this repo. You will need a [redis](http://redis.io/) server to connect to which will be used to store custom commands and words the bot has 'learned'.

After these things have been setup, you can run the bot by simply doing:
```
node index.js
```
