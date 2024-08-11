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

	const srcDir  = "src/";
	const distDir = "dist/";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		
        clean: [distDir],

        copy: {
			main: {
				files: [
					{ expand: true,
                      cwd: srcDir + "./resources",
                      src: ["**/*"],
                      dest: distDir + "/resources/"},
					{ expand: true,
                      cwd: srcDir,
                      src: ["**/*.html","**/*.css"],
                      dest: distDir},
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