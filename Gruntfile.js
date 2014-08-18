module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Uglify Javascript
    // ======================================================
    uglify: {
      bowerlibs: {
        // files: [ { src: 'public/js/vendor/modernizr.js', dest:'public/js/vendor/modernizr.js' } ]
      }
    },

    // Copy all bower files into the public area
    // ======================================================
    copy: {
      js: {
        files: [
          { expand:true, cwd:'bower_components/foundation/js/', src:'foundation.min.js', dest: 'public/js/vendor/' },
          { expand:true, cwd:'bower_components/foundation/js/vendor/', src:'fastclick.js', dest: 'public/js/vendor/' },
          { expand:true, cwd:'bower_components/jquery/dist/',    src:'jquery.min.js', dest: 'public/js/vendor/' },
          { expand:true, cwd:'bower_components/modernizr/', src:'modernizr.js', dest: 'public/js/vendor/' },
          { expand:true, cwd:'bower_components/clndr/', src:'clndr.min.js', dest: 'public/js/vendor/' },
          { expand:true, cwd:'bower_components/moment/', src:'moment.js', dest: 'public/js/vendor/' },
          { expand:true, cwd:'bower_components/underscore/', src:'underscore.js', dest: 'public/js/vendor/' }
          ],
      },
      fonts: {
        files: [
          { expand:true, cwd:'bower_components/ionicons/fonts/', src:'ionicons.*', dest: 'public/fonts/' }
        ],
      },
      icons: {
        files: [
        ]
      }
    },

    // Watch and act based on file changes
    // ======================================================
    watch: {
      css: {
        files: ['public/css/**.css'],
        options: { livereload: true}
      },
      js: {
        files: ['public/js/**/*.js'],
        options: { livereload: true}
      },
      jade: {
        files: ['views/*.jade', 'views/*.html', 'views/*.md'],
        tasks: ['jekyll_build']
      },
      html: {
        files: ['app_node/views/*.html'],
        options: { livereload: true}
      },
      // Now let's handle the actual programmatic stuff
      angular: {
        files: ['app_angular/**/*.js'],
        tasks: ['concat:angular']
      },
    },

    // Do two things at once
    // ======================================================
    concurrent: {
        dev: ['watch', 'compass:dev' ],
        devlight: ['watch', 'compass:dev', 'exec:nodemon'],
        options: { logConcurrentOutput: true },
    },

    // Compile CSS
    // ======================================================
   compass: {
      options: {
        watch: false,
        environment: 'production',
        outputStyle: 'nested',
        cssDir: 'public/css',
        sassDir: 'scss',
        imagesDir: 'public/img',
        javascriptsDir: 'public/js',
        fontsDir: 'public/fonts',
        httpPath: '/',
        relativeAssets: true,
        importPath: [
          'bower_components/foundation/scss',
          'bower_components/ionicons/scss',
        ],
      },
      dist: {
        options: {
          watch: false,
          environment: 'production',
        },
      },
      dev: {
        options: {
          watch: true,
          environment: 'development',
          outputStyle: 'nested',
        },
      },
    },

    // Execute things like nodemon
    // ======================================================
    exec: {
      nodemon: {
        cmd: 'nodemon server.js',
      },
      jekyll_build: {
        cmd: 'jekyll build', // Run jekyll in the background...
        cwd: 'views'
      },
    },

    // Combine files
    // ======================================================
    concat: {
        options: {
          separator: ';' + grunt.util.linefeed + grunt.util.linefeed,
        },
        vendor: {
          src: [
            'public/js/vendor/modernizr.js',
            'public/js/vendor/jquery.min.js',
            'public/js/vendor/fastclick.js',
            'public/js/vendor/foundation.min.js',
            'public/js/vendor/moment.js',
            'public/js/vendor/underscore.js',
            'public/js/vendor/clndr.min.js'
          ],
          dest: 'public/js/_vendor.js',
        },
      },
  });

  // Load in all our  necessary grunt modules
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-env');

  // Define grunt tasks
  grunt.registerTask('default', ['start', 'build' ]);
  grunt.registerTask('start', ['copy:fonts', 'copy:js', 'uglify:bowerlibs']);
  grunt.registerTask('build', [ 'concat', 'compass:dist' ]);
  grunt.registerTask('dev', [ 'concurrent:dev' ]);
  grunt.registerTask('heroku:development', ['start', 'build']);
  grunt.registerTask('heroku:production', ['start', 'build']);
};