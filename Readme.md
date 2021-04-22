# PR Label Checker

This action checks for a PR to have labels specified in `hasLabel` and blocks merging of the PR, if respective label(s) are not applied.

## Inputs

### `hasLabel`

**Required** The labels that will be checked against each PR

## Outputs

### `passed`

true if label check has passed

## Example usage

uses: actions/sample-github-action@v1.10
with:
hasLabel: enhancement,bug,help

Will check and block PR if either of three labels are not applied to the PR.
