# Hello world javascript action

This action checks for a PR to have labels specified in `hasOneOf` and blocks merging of the PR, if respective label(s) are not available.

## Inputs

### `hasOneOf`

**Required** The labels that will be checked against each PR

## Outputs

### `passed`

true if label check has passed

## Example usage

uses: actions/sample-github-action@v1.6
with:
hasOneOf: enhancement,bug,help
