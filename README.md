# Simple Clouflare Powered AI Web
[中文文档](https://github.com/huonwe/simple-cf-ai/blob/main/doc/README.zh-cn.md)

This project uses cloudflare Workers to host a AI website, where you can communicate with [various LLM models in cloudflare workers AI](https://developers.cloudflare.com/workers-ai/models/).

Demo: [https://demo.howinee.workers.dev/](https://demo.howinee.workers.dev/)

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
In this method, you need to create a worker in your cloudflare account first. After that,edit its code in the webpage, then click deploy.
You can find this code in [deploy/worker.js](https://github.com/huonwe/simple-cf-ai/blob/main/deploy/worker.js)
