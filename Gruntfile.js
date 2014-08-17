module.exports = function( grunt ) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    banner: {
      normal: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
      inlineHead: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
    },
    clean: {
      dev: [
        'js/dev/**/*.map'
      ],
      prod: [
        'css/prod',
        'js/prod',
        'js/**/*.map'
      ],
      img: [
        'img'
      ],
      inline: [ 'build' ]
    },
    compass: {
      dev: {
        options: {
          sassDir: 'dev/sass',
          cssDir: 'css/dev',
          imagesDir: 'img',
          javascriptDir: 'js',
          fontsDir: 'fonts',
          relativeAssets: true,
          environment: 'development',
          outputStyle: 'expanded',
          noLineComments: false,
          force: true,
          debugInfo: false
        }
      },
      prod: {
        options: {
          sassDir: 'dev/sass',
          cssDir: 'css/prod',
          imagesDir: 'img',
          javascriptDir: 'js',
          fontsDir: 'fonts',
          relativeAssets: true,
          environment: 'production',
          outputStyle: 'compressed',
          noLineComments: true,
          force: true,
          debugInfo: false
        }
      }
    },
    coffee: {
      options: {
        bare: true
      },
      all: {
        expand: true,
        cwd: 'dev/coffee/',
        src: [
          '**/*.coffee',
          '!**/_nu/**/*.coffee'
        ],
        dest: 'js/dev/',
        rename: function( destPath, srcPath ) {
          var dest;
          dest = destPath + srcPath.replace(/\.coffee$/,".js");
          return dest;
        },
        options: {
          sourceMap: true
        }
      }
    },
    'string-replace' : {
      version: {
        files: {
          './': [ 'bower.json', 'dev/coffee/main.coffee', 'ts/constants.ts' ]
        },
        options: {
          replacements: [
            {
              pattern: /("version": ")(\d{1,2})\.(\d{1,2})\.(\d{1,2})(?:-(\w{1,5}))?(?:\.\d{1,3})?/ig,
              replacement: '$1<%= pkg.version %>'
            },
            {
              pattern: /("urlArgs": "v=)(\d{1,2})\.(\d{1,2})\.(\d{1,2})(?:-(\w{1,5}))?(?:\.\d{1,3})?/ig,
              replacement: '$1<%= pkg.version %>'
            },
            {
              pattern: /(app = )(\d{1,2})\.(\d{1,2})\.(\d{1,2})(?:-(\w{1,5}))?(?:\.\d{1,3})?/ig,
              replacement: '$1<%= pkg.version %>'
            }
          ]
        }
      }
    },
    jshint: {
      options: {
        jshintrc: 'js/dev/.jshintrc'
      },
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: [ 'Gruntfile.js' ]
      },
      main: {
        src: [
          'js/dev/*.js'
        ]
      },
      modules: {
        src: [
          'js/dev/module/*.js'
        ]
      },
      plugins: {
        options: {
          jshintrc: 'js/dev/plugin/.jshintrc'
        },
        src: [
          // only lint own plugin files
        ]
      },
      inline: {
        src: [
          'js/dev/inline/*.js',
          '!js/dev/inline/head.js'
        ]
      },
      test: {
        //options: {
        //  jshintrc: 'dev/test/.jshintrc'
        //},
        src: [ 'dev/test/**/*.js' ]
      }
    },
    qunit: {
      all: [ 'test/**/*.html' ]
    },
    requirejs: {
      single: {
        options: {
          "name": "main",
          "baseUrl": ".",
          "mainConfigFile": "js/dev/main.js",
          "out": "js/prod/main-<%= pkg.version %>.min.js",
          "useStrict": true,
          "optimize": "none",
          "generateSourceMaps": false,
          "useSourceUrl": false,
          "preserveLicenseComments": false,
          "fileExclusionRegExp": /(^\.)|(^coffee)|(^old)|(^_nu)|(^main\.js)|(\.map$)|(inline)/,
          "include": [
            //"requireLib",
            "almond",
            "domReady"
          ]
        }
      },
      inline: {
        options: {
          dir: "build",
          appDir: "js/dev/inline",
          baseUrl: ".",
          optimize: "none",
          optimizeCss: "none",
          useStrict: true,
          fileExclusionRegExp: /^(.git|.gitignore|node_modules|coffee|media|test|old|.*\.map|.*\.sublime-.*)$/,
          wrap: {
            start: '<%= banner.inlineHead %>' + "\n;(function(window, document, undefined){\n  'use strict';",
            end: "})((typeof window === 'object' && window) || this, document);\n"
          },
          onBuildWrite: function (id, path, contents) {
            if ((/define\(.*?\{/).test(contents)) {
              //Remove AMD ceremony for use without require.js or almond.js
              contents = contents.replace(/define\(.*?\{/, '');
              contents = contents.replace(/\}\);\s*?$/,'');
            }
            else if ((/require\([^\{]*?\{/).test(contents)) {
              contents = contents.replace(/require[^\{]+\{/, '');
              contents = contents.replace(/\}\);\s*$/,'');
            }
            return contents;
          },
          modules: [
            {
              "name" : "head",
              "include" : [
                "fontscom.inline",
                "html5elements.inline",
                "googleanalytics.inline"
              ],
              "create" : true
            }
          ]
        }
      }
    },
    concat: {
      options : {
        banner: '<%= banner.normal %>'
      },
      modules: {
        files : {
          'js/dev/modules.js' : [
            'js/dev/module/*.js',
            'js/dev/module/hyphenator/Hyphenator.js'
          ]
        }
      },
      plugins: {
        files : {
          'js/dev/plugins.js' : [
            'js/dev/plugin/*.js'
          ]
        }
      },
      prod: {
        files : {
          'js/prod/main-<%= pkg.version %>.js' : [
            'js/dev/plugins.js',
            'js/dev/modules.js',
            'js/dev/main.js'
          ]
        }
      }
    },
    stripdefine: {
      inline: [
        'js/dev/inline/**/*.js'
      ]
    },
    uglify: {
      plugins: {
        options : {
          banner: '<%= banner.normal %>',
          sourceMapRoot: '.',
          sourceMap: 'plugins.js.map',
          beautify: {
            width: 80,
            beautify: true
          }
        },
        files: {
          'js/dev/plugins.js' : [
            'js/dev/vendor/jquery-migrate-1.1.1.js',
            'js/dev/plugin/*.js'
          ]
        }
      },
      modules: {
        options : {
          banner: '<%= banner.normal %>',
          sourceMapRoot: '.',
          sourceMap: 'modules.js.map',
          beautify: {
            width: 80,
            beautify: true
          }
        },
        files: {
          'js/dev/modules.js' : [
            'js/dev/module/*.js'
          ]
        }
      },
      prod: {
        options : {
          banner: '<%= banner.normal %>'
        },
        files: [
          { dest: 'js/prod/plugins.js', src: [ 'js/dev/plugins.js' ] },
          { dest: 'js/prod/modules.js', src: [ 'js/dev/modules.js' ] },
          { dest: 'js/prod/main-<%= pkg.version %>.min.js', src: [ 'js/prod/main-<%= pkg.version %>.js' ] }
          /*{
            expand: true,
            cwd: 'js/dev/inline',
            src: [ '*.js' ],
            dest: 'js/prod/inline/'
          }*/
        ]
      },
      inline: {
        options : {
          banner: '<%= banner.inlineHead %>'
        },
        files: [
          { src: [ 'js/dev/inline/head.js' ], dest: 'js/prod/inline/head.js' }
          /*{
            expand: true,
            cwd: 'js/dev/inline',
            src: [ '*.js' ],
            dest: 'js/prod/inline/'
          }*/
        ]
      },
      requirejs : {
        options : {
          banner : '<%= banner.normal %>'
        },
        files : {
          'js/prod/main-<%= pkg.version %>.min.js' : [ 'js/prod/main.js' ]
        }
      }
    },
    compress: {
      css: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'css/prod/',
        src: [ '**/*.css' ],
        dest: 'css/prod/'
      },
      jsmain: {
        options: {
          mode: 'gzip',
          archive: 'js/prod/main-<%= pkg.version %>.min.js.gz'
        },
        files: [
          { src: [ 'js/prod/main-<%= pkg.version %>.min.js' ], dest: 'js/prod/main-<%= pkg.version %>.min.js' }
        ]
      },
      jsmodules : {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'js/prod/',
        src: [ 'module/*.js', 'plugin/**/*.js' ],
        dest: 'js/prod/'
      }
    },
    imagemin: {
      img: {
        options: {
          optimizationLevel: 3
        },
        files: [
          {
            expand: true,
            cwd: 'dev/img/',
            src: [ '**/*.jpg', '**/*.png' ],
            dest: 'img/',
            filter: 'isFile'
          }
        ]
      }
    },
    copy: {
      inline: {
        files: [
          { src: [ 'build/head.js' ], dest: 'js/dev/inline/head.js' },
        ]
      },
      img: {
        files: [
          {
            expand: true,
            cwd: 'dev/img/',
            src: ['**/*.gif', '**/*.svg' ],
            dest: 'img/'
          }
        ]
      },
      vendor: {
        files: [
          {
            expand: true,
            cwd: 'dev/bower_components/',
            src: [
              'accessifyhtml5-amd/module/accessifyhtml5.js',
              'requirejs/require.js',
              'almond/almond.js',
              'html5shiv/dist/html5shiv-printshiv.js',
              'html5shiv/dist/html5shiv.js'
            ],
            dest: 'js/dev/vendor/'
          },
          {
            expand: true,
            cwd: 'dev/bower_components/',
            src: [
              'normalize-css/normalize.css'
            ],
            dest: 'dev/sass/framework/',
            rename: function(dest, src) {
              var newFileName;
              newFileName = src.replace(/\.css$/, ".scss");
              newFileName = newFileName.replace(/\/([^\/]+)$/, "/_$1");
              return dest + newFileName;
            }
          }
        ]
      }
    },
    watch: {
      dev: {
        files: [
          'Gruntfile.js',
          'dev/coffee/**/*.coffee',
          'dev/sass/**/*.scss'
        ],
        tasks: [ 'dev' ]
      },
      prod: {
        files: [
          'Gruntfile.js',
          'dev/coffee/**/*.coffee',
          'dev/sass/**/*.scss'
        ],
        tasks: [ 'prod' ]
      }
    }
  });

  // Load grunt-compass plugin
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-string-replace');

  // Strip define fn
  grunt.registerMultiTask('stripdefine', "Strip define call from dist file", function() {
    this.filesSrc.forEach(function(filepath) {
      // Remove `define("modernizr-init" ...)` and `define("modernizr-build" ...)`
      var mod = grunt.file.read(filepath).replace(/define\(".*"\, function\(\)\{\}\);/g, '');

      // Hack the prefix into place. Anything is way too big for something so small.
      /*if ( modConfig && modConfig.classPrefix ) {
        mod = mod.replace("classPrefix : '',", "classPrefix : '" + modConfig.classPrefix.replace(/"/g, '\\"') + "',");
      }*/
      grunt.file.write(filepath, mod);
    });
  });

  grunt.registerTask('img', [
    'clean:img',
    'imagemin:img',
    'copy:img'
  ]);

  grunt.registerTask('version', [
    'string-replace:version'
  ]);

  grunt.registerTask('vendor', [
    'copy:vendor'
  ]);

  grunt.registerTask('inline', [
    'requirejs:inline',
    'copy:inline',
    'stripdefine:inline',
    'uglify:inline',
    'clean:inline'
  ]);

  grunt.registerTask('dev', [
    'clean:dev',
    'string-replace:version',
    'compass:dev',
    //'coffee',
    'jshint'
  ]);

  /* with RequireJS */
  grunt.registerTask('prod', [
    'string-replace:version',
    'clean:prod',
    'compass:prod',
    'coffee',
    'jshint',
    'requirejs:project',
    'uglify:requirejs',
    'inline'
  ]);

  /* without RequireJS
  grunt.registerTask('prod', [
    'clean:prod',
    'compass:prod',
    'coffee',
    'jshint',
    'concat',
    'uglify:prod',
    'compress'
  ]);
  */

  grunt.registerTask('default', 'watch:dev');
};
