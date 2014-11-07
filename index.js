var path = require('path')
var exec = require('child_process').exec
var fs = require('fs')
var each = require('each-series')
var config = require('./config.json')
config.exclude = config.exclude || []
var gitPath = process.argv[2] || process.cwd() || './'
var resolve = path.resolve.bind(null, gitPath)
var errorMessages = {
	1: '\n\tNo remote repository specified',
	128: '\n\tNot a git repository',
	'ENOENT': '\n\tNot found',
	null: ''
}

function noop() {}

function gitPull(path, cb) {
	return exec('git pull -q', { cwd: path }, cb)
}

function gitPullDir(dir, i, done) {
	var fullDir = resolve(dir)
	gitPull(fullDir, function (err, text) {
		console.log( dir, errorMessages[ err && err.code] )
		done() //(err)
	})
	.on('error', console.log.bind(console, fullDir, 'error'))
}

fs.readdir( gitPath, function (err, filesAndDirs) {
	var dirs = filesAndDirs.filter(function (fileOrDir) {
		return (
			fs.statSync(resolve(fileOrDir)).isDirectory() && //keep it if it is a directory
			config.exclude.indexOf(fileOrDir) === -1 //keep it if it is not excluded
		)
	})

	each(dirs, gitPullDir, noop)
})
