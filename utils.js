/**
 * Author : Shobhit Chittora
 * Date: 15 Aug 2018
 * Description: Utilities for the project
 */

const util = require('util')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const exec = util.promisify(require('child_process').exec)

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
 */
function cloneRepo(language, callback) {
  const { repo } = language
  createReposRoot()
  exec(`cd ${repoRoot} && git clone ${repo}`, (err) => {
    if (err) {
      console.error(`Exec error: ${err}`);
      return;
    }
    callback()
  })
}

module.exports = { cloneRepo, cleanUp }