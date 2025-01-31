# Simple Clouflare Powered AI Web
[中文文档](https://github.com/huonwe/simple-cf-ai/blob/main/doc/README.zh-cn.md)

This project uses cloudflare Workers to host a AI website, where you can communicate with [various LLM models in cloudflare workers AI](https://developers.cloudflare.com/workers-ai/models/).

## How to use
### Wrangler (Recommended)
First, you need to install wrangler. Please follow [cloudflare's documents](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for details.

```bash
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

nvm install 22

npm install wrangler --save-dev
```

Then, clone this repo, and deploy
```bash
git clone https://github.com/huonwe/simple-cf-ai.git
cd simple-cf-ai
npm install
npx wrangler login # you will need to open a url to finish your login
npx wrangler deploy
```

In this method, you can change some options by editing src/index.ts. Please read the infomation in index.ts .

You will need to run `npx wrangler deploy` again to let it work.

After that, locate the worker in your cloudflare account, and find the url of the worker, then enjoy!

### Directly deploy to your workers
In this method, you need to create a worker in your cloudflare account first. After that,edit its code in the webpage into [this](https://github.com/huonwe/simple-cf-ai/blob/main/deploy/worker.js) , then click deploy.

Then, you need add a Workers AI bind to your worker. Enter the settings page of this worker, find `bindings`, and add a Workers AI bind by the name of `AI`.

## About pricing
You can see it in cloudflare's document, [here](https://developers.cloudflare.com/workers-ai/platform/pricing/).

You will have a FREE allocation even if you don't have a Workers Paid plan. But please be careful, if you upgrade to Workers Paid plan, and incurred some expenses, there is none of my business.
