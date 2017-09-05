module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['js/formez.js', 'js/test.js', 'css/**', 'index.php', 'server/**'],
                    dest: 'dev/'
                }]
            },
            dist: {
                files: [{
                    src: 'src/js/formez.js',
                    dest: 'dist/formez.js'
                }]
            }
        },
        uglify: {
            options: {
            },
            files: {
                'dist/formez.min.js': 'dist/formez.js'
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            files: {
                'dist/style.css': 'src/css/**'
            }
        },
        php: {
            dev: {
                options: {
                    base: 'dev',
                    port: 5000,
                    livereload: 35730,
                    keepalive: false,
                    open: true
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            files: ['src/**'],
            tasks: ['copy:dev']
        },
        shell: {
            dev: {
                command: [
                    'cd dev/css',
                    'curl -O https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css',
                    'curl -O https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css',
                ].join('&&')
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-php');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-shell');


    grunt.registerTask('default', ['dev']);
    grunt.registerTask(
        'dev', [
            'copy:dev',
            'shell',
            'php',
            'watch'
        ]
    );
    grunt.registerTask(
        'dist', [
            'copy:dist',
            'cssmin',
            'uglify'
        ]
    );
};