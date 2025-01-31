# Simple Clouflare Powered AI Web
这个项目可以帮助你通过Cloudflare Workers免费搭建一个自己的AI问答网页。


## 使用方法
### Wrangler (推荐)
首先, 你需要先安装Wrangler. 请访问 [cloudflare的文档](https://developers.cloudflare.com/workers/wrangler/install-and-update/)以获取更多信息.

```bash
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

nvm install 22

npm install wrangler --save-dev
```

然后，克隆项目，并使用wrangler部署
```bash
git clone https://github.com/huonwe/simple-cf-ai.git
cd simple-cf-ai
npm install
npx wrangler login # you will need to open a url to finish your login
npx wrangler deploy
```

你可以根据src/index.ts里的提示来自定义某些选项。重新运行`npx wrangler deploy`来使改变生效。

随后，你可以打开你的Cloudflare控制台，并找到这个worker，点击访问即可开始使用。

### 直接部署
若要使用此方法，你需要先在Cloudflare控制台手动创建一个worker，创建完成后点击编辑代码，将[deploy/worker.js](https://github.com/huonwe/simple-cf-ai/blob/main/deploy/worker.js)中的内容全部覆盖进去，点击部署。

然后，回到该workers页面，点击`设置`，在`绑定`项中添加名称为`AI`的Workers AI 绑定项。之后，便可以开始使用

## 关于价格
每个账户都有Cloudflare提供的免费配额，并且在配额用尽后会暂停服务，不会产生费用，[详情查看这里](https://developers.cloudflare.com/workers-ai/platform/pricing/)。但是如果你不小心或因各种原因产生了费用，这不关我事。
