const github = require('@actions/github');

module.exports = {
  github,
  githubContext: github.context
};
