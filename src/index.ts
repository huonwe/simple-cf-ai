import { Hono } from "hono";
import { cors } from 'hono/cors'
import { streamText } from "hono/streaming";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { Ai } from "@cloudflare/workers-types";
import { html } from "hono/html";

type Bindings = {
  AI: Ai;
};

// !!!
// 自定义你的AI
// 你可以在本代码中搜索(Ctrl+F)所有的 !!!，以查找所有可供你修改的项
// Custom your AI
// Find all your can custom by search !!! in this code. 
const PROMPT = "你是一个AI助手, 你会尽全力回答别人问你的问题";
// Find text generation models in https://developers.cloudflare.com/workers-ai/models/
// You do can use @cf/meta/llama-3.1-70b-instruct, although it throw errors in local, but still works.
// @cf/meta/llama-3.1-70b-instruct
// @cf/meta/llama-3.1-8b-instruct
// @cf/qwen/qwen1.5-14b-chat-awq
// qwen is best choice for chinese speakers
const AI_MODEL_NAME = "@cf/qwen/qwen1.5-14b-chat-awq";
const app = new Hono<{ Bindings: Bindings }>();
app.use(
  cors({
    // !!!
    // 将*改为你的域名
    // Change the * to your domain
    origin: ['http://localhost', '*'],
    allowHeaders: ['Origin', 'Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    maxAge: 600,
    credentials: true,
  })
)

app.get("/", async (c) => {
  return c.html(
    html`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/markdown.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/c.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/cpp.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.2/markdown-it.min.js"
        integrity="sha512-ohlWmsCxOu0bph1om5eDL0jm/83eH09fvqLDhiEdiqfDeJbEvz4FSbeY0gLJSVJwQAp0laRhTXbUQG+ZUuifUQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <style>
        body {
            // !!!
            // 你可以设置页面的背景图片, 取消下行注释, 并在url()内填入你的图片链接
            // background-image: url(...);
            background-repeat: no-repeat;
            background-size: cover;
            background-attachment: fixed;
            
            // padding-left: 100px;
            // padding-right: 100px;
            
            overflow: hidden;
        }

        .box {
            height: 100vh;
            /* margin-bottom: 1rem; */
        }

        .user-input {
            margin-top: 1rem;
            width: 100%;
            min-height: 1rem;
            max-height: 5rem;
            /* border: 1px solid saddlebrown; */
            /* left: 0;
      top: 0; */
            display: flex;
        }

        .user-input textarea {
            word-break: break-all;
            resize: none;
            flex: 4;
            border-radius: 15px;
            border: 1px solid rgb(135, 181, 241);
            background-color: #ffffffcd;
            color: dodgerblue;
            font-size: 1rem;
        }

        .user-input textarea:hover {
            border: 1px solid dodgerblue;
        }

        .user-input textarea:focus {
            border: 1px solid dodgerblue;
        }

        .user-input button {
            margin-left: 1rem;
            /* color: pink; */
            background-color: #ffffff7a;
            border: 1px solid rgb(135, 181, 241);
            border-radius: 15px;
            font-size: 2rem;
            padding: 1rem;
            flex: 0.5;

            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .user-input button:hover {
            background-color: #ffffffcd;
            border: 1px solid dodgerblue;
        }

        .history-box {
            height: 80%;
            width: 100%;
            background-color: rgba(240, 248, 255, 0.942);

            overflow-y: auto;
            overflow-x: auto;

            word-wrap: break-word;

            border-radius: 15px;
            font-size: medium;
        }

        .chat-history {
            display: flex;
            flex-direction: column;
            max-height: 80vh;
        }

        .chat-history .message-user {
            /* width: 70%; */
            background-color: rgba(171, 150, 255, 0.6);
            text-align: right;

            margin-top: 1rem;
            margin-bottom: 1rem;

            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0.3rem;

            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;

            border-top-right-radius: 15px;
            border-bottom-right-radius: 0px;
        }

        .chat-history .message-user::before {
            content: "You";
            color: green;
        }

        .chat-history .message-assistant {
            /* min-height: 3rem; */
            background-color: rgba(190, 85, 255, 0.6);

            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0.3rem;

            border-top-left-radius: 15px;
            border-bottom-left-radius: 0px;

            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
        }

        .red_backg {
            background-color: rgba(255, 100, 100, 0.558);
        }

        .chat-history .message-assistant::before {
            height: 2rem;
            width: 2rem;
            // background-image: url(...);
            // background-size: contain;
            display: block;
            content: "AI";
            border-radius: 15px;
            color: rgb(155, 100, 100);
        }

        .chat-history .special-btn {
            color: rgba(255, 100, 100, 0.74);
            display: block;
            background-color: #ffffffec;
            border-radius: 10px;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            /* width: 3rem;
  height: 2rem; */
        }

        .chat-history .special-btn:hover {
            color: rgba(255, 100, 100, 0.914);
            background-color: #ffffff;
        }

        .message-assistant pre {
            /* background-color: rgba(255, 251, 240, 0.986); */
            border-radius: 15px;
            overflow-y: auto;

            padding: 0.5rem;
        }

        /* .message-assistant pre code {
  border-radius: 15px;
} */

        .message-assistant * img {
            height: 3rem;
            display: inline;
        }
        #in {
            font-size: 1.5rem;
        }
        #btn-send {
            font-size: 1.5rem;
        }
        button.busying {
            background-image: url(/icons/loading-Ellipsis@1x-1.0s-200px-200px-transp.svg);
        }

        button.availiable {
            /* height: 100%;
  width: 100%; */
            /* object-fit: contain; */
        }
        button.availiable:hover {
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="box">
        <div id="history-box" class="history-box">
            <div id="chat-hello" class="chat-history"></div>
            <div id="chat-history" class="chat-history"></div>
        </div>

        <div class="user-input">
            <textarea id="in" type="text"></textarea>
            <!-- <button id="btn-img-upload" onclick="add_img()">上传<input id="img-input" type="file" accept="image/*" style="display:none"></button> -->
            <button id="btn-send" class="availiable" onclick="ask_ai()">发送</button>
        </div>

    </div>
</body>
<script>
    const domReady = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    var md;
    function markdownit_init() {
        md = markdownit() || md;
        // console.log("Ready")
        md.set({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                            '</code></pre>';
                    } catch (__) { }
                }

                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });
        set_send_btn(btn_status.availiable)
    }
      
    const default_chat_model = "/api/chat";
    const spark_chat_model = "/api/spark_chat"

    /**
     * @description 转换文件成base64数据
     * @param {Object} file - 文件对象
     */
    function changeFileIntoBase64(file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = (result) => {
                const base64Str = result.currentTarget.result;
                resolve(base64Str);
            };
        });
    }

    domReady(() => {
        set_send_btn(btn_status.busying)
        try {
            markdownit_init()
        } catch {
            setTimeout(markdownit_init, 100)
        }
    })
    function text2emo(text) {
        // let text_n = text.replace(/<em>rolls eyes<\/em>/gi, "<img src=/exprs/rolls-eyes.png>");
        // text_n = text_n.replace(/<em>smirk<\/em>/gi, "😏");
        // text_n = text_n.replace(/<em>sigh<\/em>/gi, "😮‍💨");
        // text_n = text_n.replace(/<em>crosses arms and raises an eyebrow<\/em>/gi, "<img src=/exprs/crossing-arms.png>");
        // text_n = text_n.replace(/<em>crosses arms<\/em>/gi, "<img src=/exprs/crossing-arms.png>");
        // text_n = text_n.replace(/<em>folding arms<\/em>/gi, "<img src=/exprs/folding-arms.png>");

        // text_n = text_n.replace(/<em>pouts<\/em>/gi, "<img src=/exprs/pouts.png>");
        // text_n = text_n.replace(/<em>ahem<\/em>/gi, "ahem😤");
        // text_n = text_n.replace(/<em>huff<\/em>/gi, "<img src=/exprs/huff.gif>");
        // text_n = text_n.replace(/<em>scoff<\/em>/gi, "<img src=/exprs/scoff.png>");
        return text
    }

    function highlightCode(content) {
        const codeEls = [...content.querySelectorAll("code")];
        for (const codeEl of codeEls) {
            hljs.highlightElement(codeEl);
        }
    }
    function createChatMessageElement(msg) {
        const div = document.createElement("div");
        div.className = "message-"+msg.role;
        if (msg.role === "assistant") {
            const response = document.createElement("div");
            response.className = "response";
            // const html = md.render(msg.content);
            const html = msg.content;
            response.innerHTML = html;
            div.appendChild(response);
            highlightCode(div);
            // const modelDisplay = document.createElement("p");
            // modelDisplay.className = "message-model";
            // const settings = retrieveChatSettings();
            // modelDisplay.innerText = settings.model;
            // div.appendChild(modelDisplay);
        } else {
            const userMessage = document.createElement("p");
            userMessage.innerText = msg.content;
            div.appendChild(userMessage);
        }
        // 通用部分 如果消息中有image，则额外添加child
        const img = msg.image;
        if (img) {
            const _img = document.createElement("img");
            _img.src = img;
            div.appendChild(_img);
        }
        return div;
    }

    function retrieveMessages() {
        const msgJSON = localStorage.getItem("messages");
        if (!msgJSON) {
            return [];
        }
        return JSON.parse(msgJSON);
    }

    function storeMessages(msgs) {
        localStorage.setItem("messages", JSON.stringify(msgs));
    }

    async function ask_ai() {
        // const btn_send = document.querySelector("#btn-send")
        set_send_btn(btn_status.busying)
        const config = {};
        const historyBox = document.querySelector("#history-box")
        const chatHistory = document.getElementById("chat-history");
        const input = document.querySelector("#in");
        if (input.value == "") {
            set_send_btn(btn_status.availiable)
            return
        }

        // let image = await changeFileIntoBase64(document.querySelector("#img-input").files[0])

        const userMsg = { role: "user", content: input.value, image: "" };
        chatHistory.append(createChatMessageElement(userMsg));
        historyBox.scrollTop = historyBox.scrollHeight;
        const messages = retrieveMessages();
        messages.push(userMsg);
        const payload = { messages, config };
        input.value = "";

        let assistantMsg = { role: "assistant", content: "" };
        const assistantMessage = createChatMessageElement(assistantMsg);
        chatHistory.append(assistantMessage);
        // Scroll to the latest message
        historyBox.scrollTop = historyBox.scrollHeight;
        const assistantResponse = assistantMessage.lastChild;

        // !!!
        // 如果你使用讯飞星火大模型, 请将default_chat_model改为spark_chat_model
        const response = await fetch(default_chat_model, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }).catch(e => {
            console.error(e);
            assistantResponse.innerHTML = "There may be some errors."
            set_send_btn(btn_status.availiable)
        });

        ///////////////
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let haveResponse = true
        while (true) {
            const { value, done } = await reader.read();
            // console.log(value)
            if (done) {
                // console.log("Stream done");
                if (assistantMsg.content == "") {
                    haveResponse = false;
                    console.log("无法获取模型输出");
                }
                break;
            }
            assistantMsg.content += value;
            // Continually render the markdown => HTML
            // Do not wipe out the model display
            // console.log(assistantMsg.content)
            assistantResponse.innerHTML = md.render(assistantMsg.content);
            assistantResponse.innerHTML = text2emo(assistantResponse.innerHTML);
            // highlightCode(assistantResponse)
            historyBox.scrollTop = historyBox.scrollHeight;
            // assistantResponse.innerHTML = assistantMsg.content
        }
        /////////////////
        if (haveResponse) {
            messages.push(assistantMsg);
            storeMessages(messages);
        } else {
            assistantResponse.innerHTML = "There may be some errors."
        }
        historyBox.scrollTop = historyBox.scrollHeight;
        set_send_btn(btn_status.availiable)
    }

    const btn_status = {
        "availiable": 0,
        "busying": 1
    }
    function set_send_btn(status) {
        const btn_send = document.querySelector("#btn-send")
        switch (status) {
            case btn_status.busying:
                btn_send.disabled = true
                // btn_send.setAttribute("class","busying")
                btn_send.className = "busying"
                break
            case btn_status.availiable:
                btn_send.disabled = false
                btn_send.className = "availiable"
            // btn_send.setAttribute("class","availiable")
        }
        // console.log(btn_send.className)
    }


    function add_img() {
        document.querySelector("#img-input").click()
    }

    function handleImgChange(e) {
        let file = e.target.files[0];
        console.log(file)
    }

    localStorage.clear();
    const user_input = document.querySelector("#in");
    user_input.onkeyup = (e) => {
        var key = e.which;
        if (key == 13) {
            ask_ai()
        }
    };

    md = markdownit();
    // console.log(md)
    init_hello();

    function init_hello() {
        const chatHello = document.getElementById("chat-hello");
        chatHello.innerHTML = "";
        let assistantMsg = {
            // !!!
            // hello words
            role: "assistant", content: "你好，请问有什么可以帮助你？"
        };
        let assistantMessage = createChatMessageElement(assistantMsg);
        chatHello.prepend(assistantMessage);
    }

    function get_selected_chat_model() {
        let now_selected = localStorage.getItem("NowSelectedModel");
        if (now_selected == null) {
            localStorage.setItem("NowSelectedModel", 0)
            now_selected = 0;
        }
        return parseInt(now_selected, 10);
    }

    function change_chat_model() {
        localStorage.setItem("NowSelectedModel", (get_selected_chat_model() + 1) % TOTAL_MODEL);
        console.log(get_selected_chat_model())
        if (localStorage.getItem("NowSelectedModel") == "0") {
            document.querySelector(".response").innerHTML = "aaa";
        } else
            if (localStorage.getItem("NowSelectedModel") == "1") {
                document.querySelector(".response").innerHTML = "bbb";
            }
    }

    // let img_input = document.querySelector("#img-input")
    // img_input.onchange = function (e) {
    //     let file = e.target.files[0];
    //     console.log(file)
    // }
</script>

</html>
    `
  )
})

// !!!
// 你可以接入讯飞星火大模型，将下段代码取消注释，并填入你的Authorization
// 完成后你需要将上面html中的default_chat_model改为spark_chat_model

// app.post("/api/spark_chat", async (c) => {
//   // console.log("comming");
//   const payload = await c.req.json();
//   const messages = [...payload.messages];
  
//   messages.unshift({ role: "system", content: PROMPT });

//   const url = "https://spark-api-open.xf-yun.com/v1/chat/completions";
//   let data = {
//     "model": "generalv3.5",
//     "messages": messages,
//     "stream": true
//   }
//   // console.log(data)
//   let header = {
//     // !!!
//     // 填入你的密钥
//     "Authorization": "Bearer ..."
//   }

//   // console.log("start fetch")
//   let resp = await fetch(new Request(url, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: header,
//   }));
//   // return new Response(resp.body);
//   if (!resp.body){
//     throw("spark response body undefined")
//   }
//   const tokenStream = resp.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());
//     return streamText(c, async (stream) => {
//     for await (const msg of tokenStream) {
//       if (msg.data !== "[DONE]") {
//         const data = JSON.parse(msg.data);
//         // console.log(data)
//         for (let choice of data.choices) {
//           stream.write(choice.delta.content);
//           // console.log(choice.delta.content)
//         }
//       }
//     }
//   });
// })

app.post("/api/chat", async (c) => {
  const payload = await c.req.json();
  const messages = [...payload.messages];
  // Prepend the systemMessage
  // if (payload?.config?.systemMessage) {
  messages.unshift({ role: "system", content: PROMPT });
  // }
  //console.log("Model", payload.config.model);
  // console.log("Messages", JSON.stringify(messages));
  let eventSourceStream;
  let retryCount = 0;
  let successfulInference = false;
  let lastError;
  const MAX_RETRIES = 3;
  while (successfulInference === false && retryCount < MAX_RETRIES) {
    try {
      // c.env.AI.run(payload.config.model, {
      eventSourceStream = (await c.env.AI.run(AI_MODEL_NAME, {
        messages,
        stream: true,
      })) as ReadableStream;
      successfulInference = true;
    } catch (err) {
      lastError = err;
      retryCount++;
      console.error(err);
      console.log(`Retrying #${retryCount}...`);
    }
  }
  if (eventSourceStream === undefined) {
    if (lastError) {
      throw lastError;
    }
    throw new Error(`Problem with model`);
  }
  // EventSource stream is handy for local event sources, but we want to just stream text
  const tokenStream = eventSourceStream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream());

  return streamText(c, async (stream) => {
    for await (const msg of tokenStream) {
      if (msg.data !== "[DONE]") {
        const data = JSON.parse(msg.data);
        stream.write(data.response);
        // console.log("RES: ",data.response);
        // await delay(1000);
        // break;
      }
    }
  });
});

export default app;