module.exports = function( grunt ) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    webpack: {
      dist: require('./webpack.config.js')
    },
    sasslint: {
      options: {
        configFile: './config/.sass-lint.yml',
      },
      target: ['src/_sass/**/*\.scss']
    }
  });

  grunt.registerTask( 'test', [ 'sasslint' ]);
  grunt.registerTask( 'build', [ 'test', 'webpack' ]);
  grunt.registerTask( 'default', [ 'build' ]);
};
