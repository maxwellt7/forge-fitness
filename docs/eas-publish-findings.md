# EAS Publish Findings

## Observed project state

- The project currently has no `eas.json` file at the repository root.
- The current `app.config.ts` does not define `extra.eas.projectId`.
- The user-provided build error indicates a non-interactive EAS build is being attempted before the project has been linked to an EAS project.

## Relevant Expo documentation findings

1. The Expo app version management documentation states that `cli.appVersionSource` is configured inside `eas.json` and determines whether versioning is managed remotely by EAS or locally in project files.
2. Expo documentation notes that the `remote` version source is the recommended behavior in current EAS CLI versions, while `local` remains available when version values should stay in project files.
3. The Expo `eas.json` documentation states that `eas.json` is the configuration file used by EAS CLI and services and is normally created the first time EAS build configuration is set up.
4. The same documentation confirms that build profiles such as `development`, `preview`, and `production` belong under the `build` key in `eas.json`.

## Root-cause hypothesis

The publish blocker is caused by missing EAS project configuration in the repo itself: specifically the absence of `eas.json` and the missing EAS project link in app config. Adding `eas.json` plus the EAS project identifier and explicit app version metadata should allow the project to be recognized as configured for EAS-compatible builds.
