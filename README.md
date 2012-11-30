## Anvil Output Plugin

This plugin is a core component of anvil and is required to function as expected.

## Installation

anvil will install this plugin during post-install.

## Normal Output

This plugin will read the output path or list of output paths. For each path in the output path, all output will be copied relative to their source path structure.

### Example Source Structure

```plain
/src
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html
```

### Build File 1

```javascript
{
	"output": "lib"
}
```

**output structure**

```plain
/lib
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html
```

### Build File 2

```javascript
{
	"output": [ "lib", "site" ]
}
```

**output structure**

```plain
/lib
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

/site
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html
```

## Additional Copy Control

You can further control what build files get copied to where using an object to control output.

In the object format, the full property can be a single string or a list of strings for full output behavior as described previously.

The partial property is a hash where the key is a minimatch (glob) format of the files to be copied and the value is a path or paths to copy all matched files to.

### Example Source Structure

```plain
/src
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html
```

### Build File 1

```javascript
{
	"output": {
		"parital": {
			"**/*.js": "js"
		}
	}
}
```

***output structure***

```plain
/js
  | a.js
  | b.js
```

_Note: the files copied using partial do not retain the structure they were pulled from._

### Build File 2

```javascript
{
	"output": {
    "full": "lib"
		"partial": {
			"**/*.css": "css",
			"**/*.html": "html"
		}
	}
}
```

***output structure***

```plain
/lib
  | a.js
  | b.css
  | c.html
  | - subdir
    | d.js
    | e.css
    | f.html

/css
  | b.css
  | e.css
/html
  | c.html
  | f.html
```