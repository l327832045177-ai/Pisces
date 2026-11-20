# Pisces — 基于 DeepSeek Harness 开源代码的自有桌面壳

海洋生态 Web 壳随本仓库一起开发。启动入口和插件配置见[海洋生态 Harness](harness/README.zh.md)。

本目录是 `github.com/deepseek-ai/deepseek-harness` 的 fork，用于产出**你自己品牌（Pisces）的桌面应用**，并把账号与模型后端替换为自有服务。

---

## 1. 结论：官网安装包和 GitHub 是同一套代码

| | 官网下载版 | GitHub 仓库 |
|---|---|---|
| 壳 | `DeepSeek Harness.exe` + `resources/app.asar`（209 MB） | `apps/desktop` |
| 桌面运行时 | `@deepseek-ai/dsh-desktop-runtime@0.2.2-rc.5` | `@deepseek-ai/dsh-desktop@0.2.2-rc.5` |
| Electron | 44.7.0 | `^44.7.0` |
| npm 包 | — | `@deepseek-ai/dsh@0.2.2-rc.5`，MIT，`repository.directory = apps/cli` |

仓库里 `apps/` 下有 `cli`、`desktop`、`desktop-host`、`desktop-publisher`、`web`、`plugin-market-generator`。**登录、自动更新、打包、签名、发布全在开源代码里**（`electron-updater`、`@deepseek-ai/dsh-deepseek-account`、`dsh-host-authentication-desktop`、`dsh-desktop-publisher`、`upload:win:x64`）。

真正没有开源的是**服务与凭据**，不是代码：

- DeepSeek 账号/OAuth 服务端、更新清单与下载站（`download.deepseek.com/dsh-desk/feeds/win-x64/`）、强更策略接口 `/api/v0/check_client_update`、模型 API；
- Windows EV 代码签名证书、COS 上传凭据、发布产物。

所以「做一个自己的壳」= 复用它全部代码 + 自备这些服务。本仓库用的就是这条路。

---

## 2. 本 fork 改了什么

| 位置 | 改动 | 目的 |
|---|---|---|
| `apps/desktop/scripts/electron-builder-config.mjs` | `productName` / `artifactName` / 协议名 / 麦克风说明 → `Pisces` | 安装包与窗口身份 |
| `apps/desktop/src/locale.ts` | 88 处 `DeepSeek Harness` → `Pisces`（8 语言） | 菜单、托盘、关于、退出确认、欢迎页标题 |
| `apps/desktop/installer/locales/*.json` | 24 处 → `Pisces` | NSIS 安装器文案 |
| `apps/desktop/resources/icon-*.{svg,png}`、`tray-windows.ico` | 换成 Pisces 双鱼标记（1024 方形，含 `tray-glyph` 分组） | 应用/安装器/托盘图标 |
| `apps/desktop/renderer/assets/welcome-brand.svg` | 换成 `PISCES` 字标，沿用原文件的 `prefers-color-scheme` 变量 | 欢迎页品牌 |
| `packages/client/ui-brand-official/src/client/{Brand.tsx,index.ts}` | 侧栏品牌槽改为 Pisces 标记与字标，去掉 `DSH_CLIENT_BUILD_PROFILE === 'official'` 门禁 | 应用内品牌 |
| `packages/util/home-paths/src/index.ts` | `DSH_HOME_DIR_NAME` `.dsh` → `.pisces` | **数据目录隔离**，不与官方 DSH 抢 `~/.dsh` |
| `apps/desktop/.env.windows` | 新建（Git 忽略）：`DSH_DESKTOP_APP_ID=com.pisces.desktop`、策略源站占位 `https://pisces.invalid` | 打包设置 |

`~/.pisces` 下会存放会话、设置、凭据、插件与 `profiles/desktop`；官方 DSH 继续用 `~/.dsh`，两者互不影响。

---

## 3. 构建与运行

环境：Node ≥ 24.9、pnpm 11.28.5（仓库 `packageManager` 固定，低版本会拒绝）。

```powershell
cd E:\1yuehai\AI\dsh-shell
pnpm install                                        # 418 个工作区项目
pnpm run build                                      # 10 道 gate，约 4 分钟
pnpm --filter @deepseek-ai/dsh-desktop exec install-electron
```

开发模式（自建壳，独立开发数据目录）：

```powershell
pnpm run dev:desktop        # Harness 状态在 apps/desktop/.desktop-dev/home
```

打包未签名 Windows 应用目录：

```powershell
cd apps\desktop
pnpm exec tsx scripts/package-target.ts win-x64 --dir --unsigned
```

出 NSIS 安装包把 `--dir` 去掉即可（`--unsigned` 保留，否则会去找代码签名证书）。
产物在 `apps/desktop/.desktop-build/targets/win-x64/`。

> 打包会按需从 npm 补装运行时依赖。国内网络建议在 `apps/desktop/.env.windows` 里加
> `DSH_DESKTOP_NPM_REGISTRY=https://registry.npmmirror.com`，否则可能因 `TypeError: terminated` 失败（可重试）。
>
> 未签名构建不写入更新源（`publish: null`），装完不会有「检查更新」。

---

## 4. 自建账号体系

`../pisces-auth/` 是一个零依赖的最小认证服务，严格实现桌面端 `@deepseek-ai/dsh-deepseek-account` 期望的 Platform 协议：

```
POST /auth-api/v0/dsh/auth_init      -> { authorize_url, authorize_id, expires_in }
GET  /dsh/authorize                  -> 登录页（PKCE S256）
POST /auth-api/v0/dsh/auth_exchange  -> { token, authorized_url, user }
POST /auth-api/v0/dsh/auth_cancel
POST /auth-api/v0/users/logout
GET  /auth-api/v0/users/current      x-dsh-auth-token -> 资料
GET  /api/v0/users/get_user_summary  -> 钱包
GET  /api/v0/users/notifications/*
```

启动：

```powershell
cd E:\1yuehai\AI\pisces-auth
node server.mjs                     # 127.0.0.1:8787，用户见 users.json
node test-protocol.mjs              # 协议自检，应输出 PROTOCOL TEST PASSED
```

让壳指向它——编辑 `%USERPROFILE%\.pisces\profiles\desktop\cordis.patch.yml`（首次启动后生成）：

```yaml
- id: deepseek-account
  config:
    platformOrigin: http://127.0.0.1:8787
    allowLoopbackHttp: true
```

`allowLoopbackHttp` 是回环 HTTP 的显式开关，生产环境请换成 HTTPS 域名。

---

## 5. 自有 OpenAI 兼容网关

不需要改代码：`llm-pi-ai` 插件本来就是多提供方适配器，路由由设置文档决定（Web 的「模型」页写的也是同一份）：

```yaml
- id: llm-pi-ai
  config:
    providers:
      pisces:
        displayName: Pisces 网关
        api: openai-completions
        baseURL: https://your-gateway.example/v1
        apiKeyEnv: PISCES_GATEWAY_API_KEY
        models:
          - id: your-model-id
            contextWindow: 128000
```

密钥走凭证服务（`apiKeyEnv` 只是引用名，配置文件里不写明文），可用「模型」设置页或 `$DSH_HOME/.credentials.yaml` 写入。

---

## 6. 尚未完成 / 建议下一步

1. **代码签名**：未签名包首次运行会有 SmartScreen 提示。正式分发需要 Windows EV 证书，配 `DSH_DESKTOP_WINDOWS_*` 四个变量后去掉 `--unsigned`。
2. **自动更新**：需要自建 `generic` 更新源（静态文件服务器即可）并配置 `DSH_DESKTOP_MANDATORY_UPDATE_PROD_ORIGIN` 与发布上传；当前是 `publish: null`。
3. **品牌美术**：`icon-windows.svg` 是可用的占位线稿；`conversation.hero.frame` 的像素鲸鱼仍是上游彩蛋，可在 `packages/client/ui-brand-official/src/client/index.ts` 里删掉该 `slots.inject`。
4. **多语言**：非中英文案已随原文替换，但语序可能需要母语者过一遍。
5. **上游升级**：本 fork 基于 dsh `0.2.2-rc.5`。上游破坏性变更频繁，建议只 cherry-pick 需要的提交，不要整包 merge。

---

## 7. 上游仓库结构速查

| 路径 | 内容 |
|---|---|
| `apps/desktop` | Electron 壳：主进程、欢迎页、更新、安装器、packaging/publishing/windows-signing 指南 |
| `apps/cli` | `dsh` 命令行（profile、插件、配置） |
| `apps/desktop-host` | 桌面私有 Host 包 |
| `packages/bundle/base/cordis.patch.yml` | 基础插件行（`deepseek-account`、`llm-pi-ai`、`llm-deepseek` 等 id 在此） |
| `packages/boot/app-boot` | profile、`cordis.patch.yml` 用户层、启动 |
| `packages/account/deepseek-account` | 账号协议实现（本文第 4 节的依据） |
| `packages/llm/llm-pi-ai` | 多提供方适配器 |
| `packages/util/home-paths` | `DSH_HOME` 解析与默认目录名 |
| `docs/`、`website/` | 文档站源码；`apps/desktop/README.zh.md` 最详细 |

---

## 8. 验证记录

已验证（有证据）：

- `pnpm install` 1437 个包，exit 0；`pnpm run build` 10 道 gate 全过，381 个产物。
- `pnpm run dev:desktop` 起窗，主窗口标题 `Pisces`（欢迎窗 616×708）。
- 欢迎页显示 `PISCES` 字标与「欢迎使用 Pisces」；工作区侧栏显示 Pisces 双鱼标记。
- 点「登录」后自建认证服务收到完整链路：`auth_init → /dsh/authorize → auth_exchange → /dsh/authorized → get_user_summary → users/current`，随后工作区打开。
- 数据隔离生效：状态写在 `apps/desktop/.desktop-dev/home`，`~/.dsh` 无新增写入。

待解决：

- **模型提供方未注册**：工作区模型选择器显示「暂无可用模型」。
  已查明：`$DSH_HOME/settings.yaml` 是**旧格式**，只在启动时导入一次，导入后改名为 `settings.yaml.imported`，内容被写进 `profiles/desktop/cordis.patch.yml` 的 `llm-pi-ai` 行（实测确认写入成功，形状为 `providers.<id>.{displayName,api,baseURL,apiKeyEnv,models}`）。配置到位但路由仍未出现，下一次应读 `packages/llm/llm-pi-ai/src/config.ts` 的 zod schema 确认必填字段，或改走「设置 → 模型 → 添加模型提供商」（页面用 `settings.mutate` 写正确结构）。
- 未签名安装包按用户要求跳过；打包流程已验证到 electron-builder 打包阶段。打包标识已用配置工厂实测：`appId=com.pisces.desktop`、`productName=Pisces`、`artifactName=pisces-<version>-<os>-<arch>-unsigned.<ext>`、`publish=null`。


### 启动时两个必踩的坑

1. `ELECTRON_RUN_AS_NODE=1` 会从本会话继承，electron 会把 Chromium 参数当脚本参数（`bad option: --remote-debugging-port`）→ 启动前 `Remove-Item Env:ELECTRON_RUN_AS_NODE`。
2. `DSH_HOME` 会从本会话继承为 `C:\Users\<用户>\.dsh`，开发版会写官方 DSH 的 profile → 显式指到 `.desktop-dev\home`。


---

## 9. 海洋生态视觉层

一次点击空白首页触发的像素动画，机制沿用上游（图集 R 通道=点半径、G=透明度，颜色取自 CSS），只换了主角与配色：

| 位置 | 改动 |
|---|---|
| `ui-brand-official/src/client/assets/reef-atlas.webp` | 重新生成的 137 帧图集（2304×1296，12 列）：双鱼环游 + 海藻摆动 + 珊瑚 + 上浮气泡 + 海床 |
| `ui-brand-official/.../home-whale/artwork.ts` | 文字填充改为生态监管语汇（水质监测、生态修复、岸线整治、湿地恢复…） |
| `ui-brand-official/.../home-whale/PixelWhale.module.css` | 去掉 `grayscale(1)`，点阵与文字改为淡蓝 `#67d4f5` / `#38bdf8`，透明度 0.5 |
| `ui-conversation/src/client/skeleton/EmptyHero.tsx` | 标题前的鲸鱼 SVG 换成双鱼标记，保留 hover 摆动（`animateTransform`） |
| `ui-conversation/src/client/locales.ts` | `hero.headline` 八种语言改为「双鱼守望，山河复绿」及对应译文 |
| `locale/src/locales/*.ts` | `brand.localBuild` 由「DSH 本地构建」改为 `Pisces`（窗口标题与侧栏回退标签） |
| `ui-theme/src/styles/design-platform.css` | 追加海洋配色：暗色底 `#061a2b`、青色强调 `#38bdf8`、悬浮/选中青色微光；亮色主题为浅水 `#eff9ff`；html 叠加水体径向渐变 |
| `ui-sidebar/src/client/SidebarRoot.module.css` | 侧栏改为 58% 透明 + `backdrop-filter: blur(24px) saturate(1.25)` 的毛玻璃 |

图集用 `E:\1yuehai\AI\pisces-tools\gen-reef-atlas.mjs` 生成，改参数后重跑即可：

```powershell
cd E:\1yuehai\AI\pisces-tools
node gen-reef-atlas.mjs     # 输出到 ui-brand-official/src/client/assets/
```
