module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        src: ["src/*.ts", "!node_modules/**/*.ts"],
        out: 'tmp/popup.js',   
      }
    },
    less: {
      default: {
        files: {
          "tmp/style.css": "src/style.less"
        }
      }
    },
    copy: {
      default: {
        files: [
          {expand: true, cwd: 'src', src: ['popup.html', 'manifest.json', 'jquery-2.1.3.min.js'], dest: 'dist/'},
          {expand: true, cwd: 'src', src: ['images/*'], dest: 'dist/'},
          {expand: true, cwd: 'tmp', src: ['popup.js.map'], dest: 'dist/'},
        ]
      }
    },
    uglify: {
      default: {
        files: {
          'dist/popup.js': ['tmp/popup.js']
        }
      }
    },
    cssmin: {
      default: {
        files: {
          'dist/style.min.css': ['tmp/style.css']
        }
      }
    },
    zip: {
      default: {
        cwd: 'dist/',
        src: ['dist/**'],
        dest: 'registersi-domain-whois.zip'
      }
    },
    clean: ["tmp"]
  });
  
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask("default", ["ts", "less", "uglify", "cssmin", "copy", "clean"]);
  grunt.registerTask("release", ["default", "zip"]);
};