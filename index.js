var resolve = require('path').resolve
var exec = require('child_process').exec
var readdir = require('fs').readdir
var config = require('./config.json')

function gitPull(path, cb) {
	return exec('git pull -q', { cwd: path }, cb)
}

function gitPullDir(dir, cb) {
	console.log( dir )
	var errMessages = {
		1: 'No remote repository specified\n',
		128: 'Not a git repository\n',
		'ENOENT': 'Not a folder\n',
		null: ''
	}
	gitPull(dir, function (err, text) {
		console.log( errMessages[ err && err.code] )
		cb()
	})
	.on('close', console.log.bind(console, 'close'))
	.on('exit', console.log.bind(console, 'exit'))
	.on('error', console.log.bind(console, 'error'))
}

function createLoop() {
	var i=0
	return function loop(cb) {
		var dir = resolve(gitPath, contents[i++])
		gitPullDir(dir, function () {
			(i < contents.length) ? loop(cb) : cb()
		})
	}
}

var gitPath = resolve( process.argv[2] || process.cwd() || '.')
readdir( gitPath, function (err, contents) {
	console.log(gitPath)
	console.log(contents.length)
	contents = contents.filter(function (content) {
		return config.exclude.indexOf(content) === -1 //keep if it is not excluded
	})
	console.log(contents.length)

	createLoop()(function done() {
		console.log('done')
	})
})
