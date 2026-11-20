# Pisces 海洋生态 Harness

[English](README.md) | 中文

这是 Pisces 仓库的海洋生态 Web 开发壳。启动器直接使用本仓库构建的 dsh，界面沿用 Pisces 品牌。当前版本可打开工作区、会话界面和插件管理页，海洋生态业务插件清单为空。

## 启动

首次克隆后，在仓库根目录使用 Node.js 24.9 或以上版本和 pnpm 11.28.5 运行 `pnpm install` 和 `pnpm run build`。构建完成后，在 Windows 上双击本目录的 `Pisces.cmd`，或从仓库根目录运行以下命令。

```powershell
.\harness\start.ps1
```

浏览器会自动打开带本地登录令牌的入口，默认监听 `127.0.0.1:3086`。在启动窗口按 Ctrl+C 结束服务。端口已占用时可传 `-Port 3087`。源码位于其他位置时可传 `-DshRoot <源码目录>`。

## 插件与运行数据

产品使用独立的 `marine-ecology` profile。dsh 负责启动、插件装配和会话生命周期。两个产品配置文件直接参与每次启动。

| 文件 | 用途 |
| --- | --- |
| `home/profiles/marine-ecology/package.json` | 声明组合包及其顺序，目前为 `dsh-base` 和 `dsh-web-app` |
| `home/profiles/marine-ecology/cordis.patch.yml` | 在组合包之上注册产品插件或调整配置，初始值为 `[]` |

`home/` 是这个壳专属的 dsh 数据目录，包含凭据、设置和会话等本机状态。版本管理只收录上表的两份配置。`home/agents/` 是本实例的共享智能体配置目录。

从项目根目录运行 `.\harness\start.ps1 -DumpConfig` 可查看 dsh 合并后的插件树。当前开发基线为 `dsh-shell` 的 `0.2.2-rc.5`，另含本地 Pisces 定制。
