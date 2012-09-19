var path = require( "path" );
var minimatch = require( "minimatch" );

module.exports = function( _, anvil ) {
	return anvil.plugin( {
		name: "anvil.output",
		activity: "push",
		config: {
			copy: {
			}
		},
		clean: function( done ) {
			var self = this,
				list = _.isArray( anvil.config.output ) ? anvil.config.output : [ anvil.config.output ],
				base = path.resolve( "./" );
			anvil.scheduler.parallel( list, function( directory, done ) {
				anvil.log.event( "cleaning " + directory );
				anvil.fs.cleanDirectory( directory, function( err ) {
					if( err ) {
						anvil.log.error( "Error cleaning " + directory + " : " + err.stack );
					}
					done();
				} );
			}, done );
		},

		configure: function( config, command, done ) {
			var self = this,
				all = self.copy[ "**/*" ],
				outputList = _.isArray( anvil.config.output ) ? anvil.config.output : [ anvil.config.output ];
				outputList = _.map( outputList, function( outputPath ) {
					return path.join( outputPath, "{relative}" );
				} );
			if( all ) {
				all = all.concat( outputList );
			} else {
				self.config.copy[ "**/*" ] = outputList;
			}
			anvil.events.on( "file.deleted", function( change, path, base ) {
				if( base === anvil.config.source ) {
					self['delete']( path );
				}
			} );
			done();
		},

		copy: function( done ) {
			var self = this,
				list = this.getOutputList(),
				base = path.resolve( "./" );
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
			var self = this;
			return _.map( self.config.copy, function( directories, pattern ) {
				directories = _.isArray( directories ) ? directories : [ directories ];
				return { pattern: pattern, directories: directories };
			} );
		},

		run: function( done ) {
			var self = this;
			this.clean( function() {
				self.copy( done );
			} );
		}
	} );
};