
# attachment-previewer

## Overview

A Azure DevOps extension for previewing a number of files directly inside of
Azure DevOps without downloading it. Works for both the Azure DevOps Server and
Azure DevOps Services. The changelog can be found [here](changelog.md).

## Usage

Attachments for tests inside of releases can be previewed, for this a test case
needs to be selected, there the `Attachments Previewer` tab will allow the user
to preview attachments.

![release-tests-no-selection.png](screenshots/release-tests-no-selection.png)

![release-tests-mp4-preview.png](screenshots/release-tests-mp4-preview.png)

## Development

```bash
npm install
```

> Install all required dependencies.

```bash
npm run test
```

> Create a development build of the extension.

```bash
npm run build:dev
```

> Create a development build of the extension.

## Maintainers

  - [@shawnfunke](https://github.com/shawnfunke)
