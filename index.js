const util = require('util');
const exec = util.promisify(require('child_process').exec);

function goToDirAndExec(command) {
  return `cd ~/Desktop/node && ${command}`;
}

async function getCommits() {
  await exec(goToDirAndExec(`git checkout master`));

  const { stdout: firstCommit } = await exec(goToDirAndExec('git rev-list --max-parents=0 HEAD'));
  const { stdout: lastCommit } = await exec(goToDirAndExec('git rev-parse HEAD'));
  
  console.log(`first commit -> ${firstCommit}, last commit -> ${lastCommit}`);
  await exec(goToDirAndExec(`git checkout ${lastCommit}`));
  const { stdout: jsFilesNow } = await exec(goToDirAndExec('find . -type f -name "*.js" | wc -l'));


  await exec(goToDirAndExec(`git checkout master`));

  await exec(goToDirAndExec(`git checkout ${firstCommit}`));
  const { stdout: jsFilesThen } = await exec(goToDirAndExec('find . -type f -name "*.js" | wc -l'));

  console.log(`Then -> ${jsFilesThen}, Now -> ${jsFilesNow}`);
}

getCommits();