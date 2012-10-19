/*
	anvil.output - An anvil core plugin that pushes complete files to output
	version:	0.0.8
	author:		Alex Robson <alex@sharplearningcurve.com> (http://sharplearningcurve.com)
	copyright:	2011 - 2012
	license:	Dual licensed
				MIT (http://www.opensource.org/licenses/mit-license)
				GPL (http://www.opensource.org/licenses/gpl-license)
*/
var path = require( "path" );
var minimatch = require( "minimatch" );

module.exports = function( _, anvil ) {
	return anvil.plugin( {
		name: "anvil.output",
		activity: "push",
		output: {},
		commander: [
			[ "--clean", "Cleans all output and working directories" ]
		],
		clean: function( done ) {
			var self = this;
			anvil.scheduler.parallel( this.output.full, function( directory, done ) {
				directory = directory.replace( /[{]relative[}]/, "" );
				anvil.log.event( "cleaning " + directory );
				anvil.fs.cleanDirectory( directory, function( err ) {
					if( err ) {
						anvil.log.error( "Error cleaning " + directory + " : " + err.stack );
					}
					done();
				} );
			}, function() {
				anvil.fs.cleanDirectory( anvil.config.working, function( err ) {
					done();
				} );
			} );
		},

		configure: function( config, command, done ) {
			var self = this;
			this.normalizeConfig();
			if( command[ "clean" ] ) {
				this.clean( done );
			} else {
				anvil.on( "file.deleted", function( change, path, base ) {
					if( base === anvil.config.source ) {
						self['delete']( path );
					}
				} );
				done();
			}
		},

		copy: function( done ) {
			var self = this,
				list = this.getOutputList();
			anvil.scheduler.parallel( list, function( spec, done ) {
				var files = self.getFilesForPattern( spec.pattern );
				anvil.scheduler.parallel( spec.directories, function( directory, done ) {
					anvil.scheduler.parallel( files, function( file, written ) {
						var relativePath = directory.replace( "{relative}", file.relativePath );
						anvil.log.debug( "copying " + file.name + " to " + relativePath );
						anvil.fs.copy( [ file.workingPath, file.name ], [ relativePath, file.name ], written );
					}, done );
				}, done );
			}, done );
		},

		"delete": function( filePath ) {
			var file = _.find( anvil.project.files, function( file ) {
							return file.originalPath == filePath;
						} );
			if( file ) {
				anvil.scheduler.parallel( [ anvil.config.output ], function( destination, done ) {
					destination = path.resolve( destination );
					var removeFrom = anvil.fs.buildPath( [ destination, file.relativePath, file.name ] );
					anvil.log.debug( "Deleting output at " + removeFrom );
					anvil.fs["delete"]( removeFrom, done );
				}, function() {} );
			}
		},

		getFilesForPattern: function( pattern ) {
			return _.filter( anvil.project.files, function( file ) {
				var relativePath = anvil.fs.buildPath( [ file.relativePath, file.name ] );
				return !file.noCopy && minimatch.match( [ relativePath ], pattern, {} ).length > 0;
			} );
		},

		getOutputList: function() {
			var partials = _.map( this.output.partial, function( directories, pattern ) {
					directories = _.isArray( directories ) ? directories : [ directories ];
					return { pattern: pattern, directories: directories };
				} );
			return partials.concat( { pattern: "**/*", directories: this.output.full } );
		},

		normalizeConfig: function() {
			var output = anvil.config.output;
			this.output.partial = {};
			if( _.isString( output ) ) {
				this.output.full = [ output ];
			} else if( _.isArray( output ) ) {
				this.output.full = output;
			} else {
				this.output = _.extend( this.output, output );
				this.output.full = _.isArray( this.output.full ) ? this.output.full : [ this.output.full ];
			}
			this.output.full = _.map( this.output.full, function( fullPath ) {
				return fullPath.match( /[{]relative[}]/ ) ? fullPath : fullPath + "/{relative}";
			} );
		},

		run: function( done ) {
			var self = this;
			self.copy( done );
		}
	} );
};