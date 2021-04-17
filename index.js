const core = require('@actions/core');
const github = require('@actions/github');

const gitToken = core.getInput('githubToken');
const githubContext = github.context;
const oktokit = github.getOctokit(gitToken);

// In case the check is not running on a pull request
if (githubContext.payload.pull_request) {
  return core.setOutput('passed', true);
}

const hasOneOfInput = core.getInput('hasOneOf');

const failMessages = [];

const { labels: prLabels = [] } = githubContext.payload.pull_request;

console.log(prLabels, hasOneOfInput);

const hasOneOfCheck =
  !hasOneOfInput || hasOneOfInput.some((label) => prLabels.includes(label));

console.log({ hasOneOfCheck });

if (!hasOneOfCheck) {
  failMessages.push(
    `This PR needs to have one of the following labels to pass this check: ${hasOneOfInput.join(
      ', '
    )}`
  );
}

async function runCheck() {
  const checks = await oktokit.checks.listForRef({
    ...githubContext.repo,
    ref: githubContext.payload.pull_request.head.ref || 'noRef'
  });

  const checkIds = checks.data.check_runs
    .filter((check) => check.name === githubContext.job)
    .map((check) => check.id);

  if (failMessages.length) {
    for (const id of checkIds) {
      await octokit.checks.update({
        ...githubContext.repo,
        check_run_id: id,
        conclusion: 'failure',
        output: {
          title: 'Labels did not pass provided rules',
          summary: failMessages.join('. ')
        }
      });
    }

    core.setFailed(failMessages.join('. '));
  } else {
    for (const id of checkIds) {
      await octokit.checks.update({
        ...context.repo,
        check_run_id: id,
        conclusion: 'success',
        output: {
          title: 'Labels follow all the provided rules',
          summary: ''
        }
      });
    }

    core.setOutput('passed', true);
  }
}

runCheck();
