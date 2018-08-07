const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getCommits() {
  const firstCommit = await exec('cd ~/Desktop/node && git rev-parse HEAD');
  const lastCommit = await exec('cd ~/Desktop/node && git rev-list --max-parents=0 HEAD');
  console.log('firstCommit -> ', firstCommit.stdout);
  console.log('lastCommit -> ', lastCommit.stdout);
}

getCommits();


