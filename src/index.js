const githubCore = require('./helpers/core');
const { githubContext } = require('./helpers/git-client');

const token = githubCore.getInput('githubToken');
const oktokit = require('./helpers/oktokit')(token);

// In case the check is not running on a pull request
if (!githubContext.payload.pull_request) {
  return githubCore.setOutput('passed', true);
}

const hasLabelInput = githubCore.getInput('hasLabel').split(',');

const errorMessages = [];

const { labels: prLabels = [] } = githubContext.payload.pull_request;
const prlabelNames = prLabels.map((prLabel) => prLabel.name);

const hasLabelCheck =
  !hasLabelInput || hasLabelInput.some((label) => prlabelNames.includes(label));

if (!hasLabelCheck) {
  errorMessages.push(
    `This PR needs to have one of the following labels to pass this check: ${hasLabelInput.join(
      ', '
    )}`
  );
}

async function runCheck() {
// Gets all the status checks running on a PR
  const statusChecks = await oktokit.checks.listForRef({
    ...githubContext.repo,
    ref: githubContext.payload.pull_request.head.ref || 'noRef'
  });

  const statusCheckIds = statusChecks.data.check_runs
    .filter((check) => check.name === githubContext.job)
    .map((check) => check.id);

  if (errorMessages.length) {
    statusCheckIds.forEach((checkId) => {
        async (await oktokit.checks.update({
            ...githubContext.repo,
            check_run_id: checkId,
            conclusion: 'failure',
            output: {
              title: 'Labels did not pass outlined rule',
              summary: errorMessages.join('. ')
            }
          }));
    });

    githubCore.setFailed(errorMessages.join('. '));

  } else {
    statusCheckIds.forEach(checkId => {
        async (await oktokit.checks.update({
            ...context.repo,
            check_run_id: checkId,
            conclusion: 'success',
            output: {
              title: 'Labels follow all the outlined rule',
              summary: ''
            }
          }));
    });
      
    githubCore.setOutput('passed', true);
  }
}

module.exports = runCheck;
