module.exports = ( grunt ) ->
  require('load-grunt-tasks')(grunt)
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffee:
      source:
        files: [
          expand: true
          cwd: 'src'
          src: ['**/*.coffee']
          dest: 'dist'
          ext: '.js'
        ]

    sass:
      source:
        options:
          sourceMap: true
        files: [
          expand: true
          cwd: 'stylesheets'
          src: ['**/*.sass', '**/*.scss']
          dest: 'stylesheets'
          ext: '.css'
        ]

    watch:
      all:
        files: ['src/**/*.coffee', 'stylesheets/**/*.sass', 'stylesheets/**/*.scss']
        tasks: ['build']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['watch']
  grunt.registerTask 'build',   ['coffee:source', 'sass:source']
