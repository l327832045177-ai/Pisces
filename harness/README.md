# Pisces Marine Ecology Harness

English | [中文](README.zh.md)

The marine ecology Web profile uses the dsh runtime built from the Pisces repository. The Pisces interface includes the workspace, conversation, and plugin management views. The initial profile has no marine ecology plugins.

## Start the shell

After cloning, use Node.js 24.9 or later and pnpm 11.28.5 to run `pnpm install` and `pnpm run build` from the repository root. On Windows, double-click `Pisces.cmd` in this directory or run the following command from the repository root.

```powershell
.\harness\start.ps1
```

The launcher opens the local sign-in URL in your browser and listens on `127.0.0.1:3086` by default. Press Ctrl+C in the launch window to stop the service. Pass `-Port 3087` to use another port or `-DshRoot <source-directory>` to select another checkout.

## Plugins and runtime data

The product uses a dedicated `marine-ecology` profile. dsh handles startup, plugin composition, and session lifecycle. It reads two product files on each launch.

| File | Purpose |
| --- | --- |
| `home/profiles/marine-ecology/package.json` | Declares the ordered bundles, currently `dsh-base` and `dsh-web-app` |
| `home/profiles/marine-ecology/cordis.patch.yml` | Registers product plugins or adjusts bundle settings, initially `[]` |

The shell stores credentials, settings, and sessions under `home/`. Git tracks only the two profile files listed above within that directory. `home/agents/` holds the instance's shared agent configuration.

Run `.\harness\start.ps1 -DumpConfig` from the repository root to inspect the composed plugin tree. The initial Pisces baseline is dsh `0.2.2-rc.5`, with the local Pisces customizations.
