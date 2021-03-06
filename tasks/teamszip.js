module.exports = function( grunt ) {
    'use strict';
    var fs = require( 'fs' ),
        archiver = require( 'archiver' ),
        skipFiles = [ '.DS_Store' ];

    function generateZip( files ){
        var output = fs.createWriteStream( 'web/resources/all.zip' ),
            archive = archiver( 'zip' ),
            index;

        archive.on( 'error', function( error ) {
            throw error;
        });

        archive.pipe( output );

        for( index in files ){
            if( skipFiles.indexOf( files[ index ] ) !== -1 ){
                continue;
            }

            if( files[ index ].substr( -4 ) !== '.cfg' && files[ index ].substr( -4 ) !== '.png' ){
                continue;
            }

            if( files.hasOwnProperty( index ) ){
                archive.append(
                    fs.createReadStream(
                        'web/resources/ingame/' + files[ index ]
                    ), {
                        name: files[ index ]
                    }
                );
            }
        }

        archive.finalize();
    }

    function generateFastdl( files ){
        var compressjs = require( 'compressjs' ),
            algorithm = compressjs.Bzip2,
            output,
            archive = archiver( 'zip' ),
            index,
            data,
            compressed,
            compressedBuffer,
            bzip2List = [],
            bzip2Name;

        for( index in files ){
            if( skipFiles.indexOf( files[ index ] ) !== -1 ){
                continue;
            }

            if( files[ index ].substr( -4 ) !== '.png' ){
                continue;
            }

            if( files.hasOwnProperty( index ) ){
                bzip2Name = files[ index ] + '.bz2';
                data = fs.readFileSync( 'web/resources/ingame/' + files[ index ] );
                compressed = algorithm.compressFile( data );
                compressedBuffer = new Buffer( compressed );
                fs.writeFileSync( 'web/resources/ingame/' + bzip2Name, compressedBuffer );
                bzip2List.push( bzip2Name );
            }
        }

        output = fs.createWriteStream( 'web/resources/fastdl.zip' );

        archive.on( 'error', function( error ) {
            throw error;
        });

        archive.pipe( output );

        for( index in bzip2List ){
            if( bzip2List.hasOwnProperty( index ) ){
                archive.append(
                    fs.createReadStream(
                        'web/resources/ingame/' + bzip2List[ index ]
                    ), {
                        name: bzip2List[ index ]
                    }
                );
            }
        }

        archive.finalize();

        for( index in bzip2List ){
            if( bzip2List.hasOwnProperty( index ) ){
                fs.unlink( 'web/resources/ingame/' + bzip2List[ index ] );
            }
        }
    }

    grunt.registerTask( 'teams_zip', function() {
        var done = this.async(),
            files = fs.readdirSync( 'web/resources/ingame/' );

        generateZip( files );

        generateFastdl( files );
    });
};
