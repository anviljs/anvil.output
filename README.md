## Anvil Output Plugin

This plugin is a core component of anvil and is required to function as expected.

## Installation

anvil will install this plugin during post-install.

## Normal Output

This plugin will read the output path or list of output paths. For each path in the output path, all output will be copied relative to their source path structure.

### Example Source Structure

/src
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

### Build File 1

'''
{
	"output": "lib"
}
'''

**output structure**

/lib
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

### Build File 2

'''
{
	"output": [ "lib", "site" ]
}
'''

**output structure**

/lib
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

/output
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

## Additional Copy Control
You can further control what build files get copied to where using the "anvil.output": { "copy": {} } build option. The copy property is a hash where the key is a minimatch (glob) format of the files to be copied and the value is a path or paths to copy all matched files to.

### Example Source Structure

/src
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

### Build File 1
'''
{
	"anvil.output": {
		"copy": {
			"**/*.js": "js"
		}
	}
}
'''

***output structure***

/js
  | a.js
  | b.js

Note: the files output in the matter are output flat and to not retain the structure they were pulled from.

### Build File 2
'''
{
	"anvil.output": {
		"copy": {
			"**/*.css": "css",
			"**/*.html": "html"
		}
	}
}
'''

***output structure***

/css
  | b.css
  | e.css
/html
  | c.html
  | f.html