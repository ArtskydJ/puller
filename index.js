var path = require('path')
var exec = require('child_process').exec
var fs = require('fs')
var each = require('each-series')
var config = require('./config.json')
config.exclude = config.exclude || []
var repoPath = (process ? (process.argv[2] ||  process.cwd()) : './')
var resolve = path.resolve.bind(null, repoPath)
var errorMessages = {
	1: 'No remote repository specified',
	128: 'Not a git repository',
	'ENOENT': 'Not found',
	null: '',
	undefined: ''
}

function noop() {}

function execGitPull(relativeDir, cb) {
	function end(err) { cb(err); cb = noop }
	exec('git pull -q', { cwd: resolve(relativeDir) }, end) //.on('error', end)
}

function gitPullDir(relativeDir, i, done) {
	execGitPull(relativeDir, function (err, text) {
		var errLikeObj = err || {message:''}
		var message = errorMessages[errLikeObj.code] || errLikeObj.message
		console.log(relativeDir, (message ? '\n\t' + message : ''))
		done(err)
	})
}

function includedDirs(filesAndDirs) {
	return filesAndDirs.filter(function (fileOrDir) {
		return fs.statSync(resolve(fileOrDir)).isDirectory()
	}).filter(function (dir) {
		return config.exclude.indexOf(dir) === -1
	})
}

var finish = noop //don't handle errors

fs.readdir(repoPath, function (err, filesAndDirs) {
	if (err) finish(err)
	else each(includedDirs(filesAndDirs), gitPullDir, finish)
})
