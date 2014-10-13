module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: [
          'public/client/*.js'
        ],
        dest: 'public/dist/production.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: { //minifies the jsavascript
      build: {  //you want to build these files
        src: 'public/dist/production.js', //this is the source
        dest: 'public/dist/production.min.js' //and the destination
      }
    },

    jshint: {  //this file lints the file
      files: [
        'public/client/*.js'  //lints all the files in the directory the * just means any file with .js
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js', // ** means any folders
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
    },

    watch: {   //this allows grunt to automatically update the following files in order to do the tasks
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [  //this is what you want grunt to watch so that you can do these tasks to them
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {   //this will produce the server
        command: 'git push azure master'  //since we setup azure to automatically update once you push to the azure remote
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [   //if you call 'grunt build', you will do the tasks listed below
    'mochaTest', 'concat', 'uglify', 'jshint', 'server-dev' //notice it starts the server here, instead of starting azure
  ]);

  grunt.registerTask('upload', function() {
    if(grunt.option('prod')) {    
      grunt.task.run(['shell']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [  //this has the shell task, which will push the changes to azure
    'mochaTest', 'concat', 'uglify', 'jshint', 'shell'
  ]);


};
