# 解忧小卖部前端

uni-app + Vue 3 + TypeScript + Vite，一套源码构建微信小程序与 H5。页面按上一级目录的 `design.md` 和 `定稿/生成素材` 实现；塔罗及起卦规则从上一级原生小程序迁入 `src/domain`。

## 开发与构建

```powershell
pnpm install
pnpm run dev:h5
pnpm run build:h5
pnpm run build:mp-weixin
python scripts/verify_build.py
```

微信开发者工具打开 `dist/build/mp-weixin`。H5 静态文件在 `dist/build/h5`。两端都需真机或浏览器检查安全区、字体与触控。项目的微信 AppID 已写入 `src/manifest.json`。

本地浏览器走查截图在 `qa/`。塔罗三主题的入场、选牌、处境选择、解读和追问可运行 `node qa/smoke-tarot.cjs` 检查。

## 图片与包体

`npm run assets:optimize` 生成首页、主题、82 张牌面牌背和塔罗场景素材。塔罗按 `定稿/抽塔罗-分层素材/layout.json` 的三主题六状态合成：每个主题一张场景底图，每个状态一张固定装饰层；真实牌面、文案、输入和触控仍由 Vue 绘制。18 张透明装饰层合计约 0.61 MiB，原始素材不进入构建。此命令需要 Python、Pillow 和本地 Chrome；构建后运行 `python scripts/verify_build.py` 检查小程序包体。

## 模型解读接口

复制 `.env.example` 为 `.env.local`，将 `VITE_READING_ENDPOINT` 设为自有后端的 HTTPS 地址。后端接收 `{system,user}`，返回 `{summary,details,actions,sourceNote}`。模型密钥只存后端，微信小程序还需在管理后台配置 request 合法域名。未配置接口时仍可完成抽牌、处境选择、基于牌义的本地解读、追问与起卦。

打卡和阅读记录暂存当前设备的本地存储。`记录`页展示最近 20 次结果；当前版本不提供账号同步。
