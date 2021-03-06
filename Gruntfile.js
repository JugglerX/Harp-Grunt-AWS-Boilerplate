module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var jsLibs = [
    // "public/assets/js/vendor/jquery-1.12.4.js", 
    "public/assets/js/foundation/foundation.js",
    // "public/assets/js/foundation/foundation.tooltip.js",
    // "public/assets/js/foundation/foundation.reveal.js",
    // "public/assets/js/foundation/foundation.equalizer.js",
    "public/assets/js/scripts/foundation-init.js",
    "public/assets/js/scripts/push-menu.js",
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('aws-keys.json'),

    // adds a .html extension to all <a> tags
    dom_munger: {
      htmllinks: {
        options: {
          suffix: {selector:'a',attribute:'href',value:'.html'},
        },
        src: 'www/**/*.html' //could be an array of files
      }
    },

    sass: {
      options: {
        outputStyle: 'expanded',
        sourceComments: true,
        sourceMap: false // cant get them to work
      },
      style: {
        files: {
          'public/assets/css/style.css': 'public/assets/css/style.scss'
        }
      }
    }, 

    uglify: {
      dev: {
        options: {
          sourceMap: true,
          compress: true,
          beautify: false,
          preserveComments: false,
          mangle: false
        },
        files: {
          'public/assets/js/libs.min.js': [jsLibs]
        }
      },
      prod: {
        options: {
          sourceMap: false,
          compress: true,
          beautify: false,
          preserveComments: false,
          mangle: false
        },
        files: {
          'www/assets/js/libs.min.js': [jsLibs]
        }
      }
    },

    watch: {
      js: {
        files: [
          jsLibs,
          'Gruntfile.js' 
        ],
        tasks: ['uglify:dev']
      },
      scss: {
        files: 'public/assets/**/*.scss',
        tasks: ['sass:style']
      }
    },

    copy: {
      assets: {
        files: [
          { expand: true, cwd: 'public/assets/fonts', src: ['*.*'], dest: 'www/assets/fonts/'},
          { expand: true, cwd: 'public/assets/images', src: ['*.*'], dest: 'www/assets/images/'},
          { expand: true, cwd: 'public/assets/css', src: ['*.*'], dest: 'www/assets/css/'}
        ]
      },
      cleanurls: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'www',
            dest: 'www/',
            src: [
              '**/*.html'
            ],
            rename: function(dest, src) {
              return dest + src.replace('.html','');
            }
          }
        ]
      }
    },

    aws_s3: {
      options: {
          accessKeyId: '<%= aws.AWSAccessKeyId %>',
          secretAccessKey: '<%= aws.AWSSecretKey %>',
          region: '<%= aws.AWSRegion %>',
          uploadConcurrency: 5, // 5 simultaneous uploads
          downloadConcurrency: 5 // 5 simultaneous downloads
      },
      production: {
          options: {
              bucket: '<%= aws.AWSBucket %>'
          },
          files: [
              {dest: '/', cwd: 'www', action: 'delete',  differential: true},
              {action: "upload", expand: true, cwd: 'www', src: ['**'], dest: '/', differential: true}
          ]
      }
    },

    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      target: {
        files: [{
          expand: true,
          cwd: 'www/assets/css',
          src: ['*.css', '!*.min.css'],
          dest: 'www/assets/css',
          ext: '.css'
        }]
      }
    },

    clean: {
      js: ['www/assets/js/'],
      html: ['www/**/*.html']
    },

    cleanempty: {
      options: {
        folders: true,
        noJunk: true
      },
      src: ['www/assets/css/*']
    }

  });

  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-aws-s3');

  // var target = grunt.option('target') || dev;

  grunt.registerTask('compile', ['dom_munger','cssmin','clean:js','cleanempty','uglify:prod']);
  grunt.registerTask('compilecleanurls', ['copy:cleanurls','cssmin','cleanempty','clean:html']);
  grunt.registerTask('deploy', ['aws_s3']);

};
