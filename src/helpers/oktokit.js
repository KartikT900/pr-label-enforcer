const { github } = require('./git-client');

module.exports = (token) => github.getOctokit(token);
