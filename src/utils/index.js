/**
 * Author : Shobhit Chittora
 * Date: 15 Aug 2018
 * Description: Utilities for the project
 */


/* eslint-disable no-console */
const util = require('util')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const exec = util.promisify(require('child_process').exec)
const fetch = require('node-fetch')

const extensions = require('../extensions');
const repoRoot = path.resolve('./repos')

/**
 * Goto the repos root dir
 */
function createReposRoot() {
	if (!(fs.existsSync(repoRoot))) {
		fs.mkdirSync(repoRoot)
	}
}

function cleanUp() {
	console.log('Clean up in progress ... 🔥🔥🔥')
	rimraf.sync(repoRoot)
	console.log('Cleaned up! 🛀🏼')
}

/**
 * 
 * @param {object} language 
 * TODO - Look into improving fetch times
 */
function cloneRepo(language, callback) {
	const { repo } = language
	createReposRoot()
	exec(`cd ${repoRoot} && git clone ${repo}`, (err) => {
		if (err) {
			console.error(`Exec error: ${err}`)
			return
		}
		callback()
	})
}

function gotoDirExec(path, command) {
	return exec(`cd ${path} && ${command}`, { maxBuffer: 5000 * 1024 })
}

function getRepoPath(repoName) {
	return path.join(repoRoot, repoName)
}

function getFirstCommit(repoPath) {
	return gotoDirExec(repoPath, 'git log --reverse --oneline --pretty=format:"%h" | head -1')
}

function getLastCommit(repoPath) {
	return gotoDirExec(repoPath, 'git log --oneline --pretty=format:"%h" | head -1')
}

function resetToMaster(repoPath) {
	return gotoDirExec(repoPath, 'git checkout master -f')
}

function checkoutCommit(repoPath, commitID) {
	return gotoDirExec(repoPath, `git checkout ${commitID}`)
}

function searchFileExtension(repoPath, extPattern) {
	// return gotoDirExec(repoPath, `find . -type f -name ${ext} | wc -l`)
	return gotoDirExec(repoPath, `find . -type f -name ${extPattern} | xargs stat -f%z  | paste -sd+ - | bc`)
}

function getAllLangueges(owner, repoName) {
	return fetch(`https://api.github.com/repos/${owner}/${repoName}/languages?access_token=${process.env.GITHUB_TOKEN}`)
		.then(res => res.json())
		.then(body => body)
}

function normalizeSize(sizes) {
	return sizes.filter(x => x).reduce((acc, val) => (acc + Number(val)), 0)
}

function getTotalSize(repoPath) {
	// return gotoDirExec(repoPath, 'ls -lR | grep -v \'^d\' | awk \'{total += $5} END {print total}\'')
	return gotoDirExec(repoPath, 'find . | xargs stat -f%z  | paste -sd+ - | bc')
}

function getLanguagePerc(repoPath, totalSize) {
	return Promise.all(
		Object.keys(extensions).map((language) =>
			Promise.all(
				extensions[language].map((extPattern) =>
					searchFileExtension(repoPath, extPattern).then(({ stdout: size }) => size)
				)
			).then(res => ({ language, size: (normalizeSize(res)), total: totalSize }))
		))
}

function sortBySize(list) {
	return list.sort((a, b) => b.size - a.size)
}

async function getCommits(language) {
	console.log(language.name)
	const repoPath = getRepoPath(language.repoName)
	await resetToMaster(repoPath)

	const { stdout: firstCommit } = await getFirstCommit(repoPath)
	const { stdout: lastCommit } = await getLastCommit(repoPath)


	await checkoutCommit(repoPath, lastCommit)
	const { stdout: totalSizeNow } = await getTotalSize(repoPath)
	console.log(sortBySize(await getLanguagePerc(repoPath, Number(totalSizeNow))))
	console.log('\n')
	await resetToMaster(repoPath)

	await checkoutCommit(repoPath, firstCommit)
	const { stdout: totalSizeThen } = await getTotalSize(repoPath)
	console.log(sortBySize(await getLanguagePerc(repoPath, Number(totalSizeThen))))

}

module.exports = { cloneRepo, cleanUp, getCommits, getAllLangueges }