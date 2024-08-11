/**
 *----------------------------------------------------------------------------
 * (c) Patrick Seuret, 2023
 * ----------------------------------------------------------------------------
 * gruntfile.js
 * ----------------------------------------------------------------------------
 * This is the declaration for grunt automation used for package building
 * with webpack.
 * Source: https://gruntjs.com/
 * 
 *
 * Versions:
 *   2024-08-10: First version
 *
 */

 //this is no typescript file!
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const webpackConfig = require("./webpack.config.cjs");

module.exports = (grunt) => {

	const jsDir  = "dist/";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		
        clean: [jsDir],

        copy: {
			main: {
				files: [
					{ expand: true, cwd: "./resources",  src: ["**/*.css"],        dest: jsDir + "/css/"},
					{ expand: true,                      src: ["./README.md"],     dest: jsDir },
					{ expand: true,                      src: ["./LICENSE.md"],    dest: jsDir },
				],
			},
		},

	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");

	//tasks
    // grunt.registerTask("clean", ["clean"]);
    // grunt.registerTask("copy", ["copy"]);
    
};