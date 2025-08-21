# Chat Widget

> **Tagline:** Embed GPT-powered conversations into any website — simple, lightweight, and extensible.

## Project Description

**Chat Widget** is an embeddable AI chat widget built with TypeScript and Node.js that uses OpenAI's **Responses API** (gpt-4.1) to power conversational experiences. It supports sending text messages and uploading files (PDF/DOCX) which are sent to the OpenAI API (Base64-encoded) for processing. The widget can be dropped into any website using `embed.js` and comes with a small demo in `public/`.

---

## Features

* Real-time chat with GPT (Responses API — `gpt-4.1`).
* Send text messages and receive AI responses.
* Upload files (PDF, DOCX) — files are Base64-encoded and forwarded to the Responses API along with `mime_type`.
* Embeddable widget (`embed.js`) — copy-and-paste into any webpage.
* Demo page (in `public/demo.html`) to try the widget locally.
* Clean TypeScript backend (`src/server.ts`) with Multer file uploads and Express routing.

---

## Tech Stack

| Layer        | Technology                             | Why used                                                     |
| ------------ | -------------------------------------- | ------------------------------------------------------------ |
| Language     | TypeScript                             | Static types, better DX and fewer runtime errors             |
| Backend      | Node.js + Express                      | Lightweight server and routing for handling widget requests  |
| File uploads | Multer                                 | Proven middleware for handling `multipart/form-data` uploads |
| OpenAI SDK   | `openai` npm package                   | Official SDK for calling the Responses API                   |
| Frontend     | HTML, CSS, JavaScript                  | Simple, embeddable widget UI served from `public/`           |
| Build        | `tsc` (compiled from `/src` → `/dist`) | Keep runtime JS separate from TypeScript source              |

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/ExploitEngineer/OpenAI-chat-widget.git
cd OpenAI-chat-widget

# 2. Install dependencies
npm install
```

### Environment

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env
# then open .env and set
# OPENAI_API_KEY=sk-...
```

Required env variables:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000        # optional, defaults to 3000 in many setups
```

### Run (Development)

```bash
npm run dev
# Launches TS watcher and starts the dev server
```

### Build (Production)

```bash
npm run build
npm start
```

* `npm run build` compiles TypeScript from `/src` into `/dist`.
* `npm start` runs the production server using compiled code.

---

## Usage

### Open the Demo

1. Start the server (`npm run dev` or `npm start`).
2. Open your browser and go to `http://localhost:3000/demo.html` (or whichever port you configured).

The demo page hosts `widget.html` and a small page-level control so you can try chatting and uploading files.

### Embedding the Widget

To embed the widget into any HTML page, include `embed.js` from your hosted location:

```html
<script src="https://your-server.example.com/embed.js" async></script>
```

`embed.js` will automatically mount the widget into the default container when included on your page.

---

## OpenAI Responses API Integration

### What is the Responses API?

The Responses API is OpenAI's unified API for model-powered responses. Instead of the older Chat Completions format, the Responses API provides a flexible request/response system that supports multimodal inputs (including files) and structured outputs. We used it because it maps well to sending user text + uploaded files together and receiving high-quality conversational results (we use `gpt-4.1` in this project).

> *Why this API for the widget?* Because the widget needs to accept (a) short conversational inputs, and (b) optional files that should be read and considered by the model. The Responses API supports including file content (Base64 encoded) alongside text and metadata, which makes it a natural fit.

*Note: For complete, up-to-date reference see the official Responses API docs.*

### How the server calls the Responses API

The backend (`src/server.ts`) accepts either a text-only message or a message + file. When a file is uploaded, it is read and converted to a Base64 string and the `mime_type` is included in the request payload.

Here is a representative TypeScript snippet (using the official `openai` package) showing how a request is formed:

```ts
import fs from 'fs';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askWithOptionalFile(message: string, filePath?: string) {
  const input: any = { type: 'text', text: message };

  const request: any = {
    model: 'gpt-4.1',
    input: [input]
  };

  if (filePath) {
    const buffer = fs.readFileSync(filePath);
    request.input.push({
      type: 'input_file',
      filename: path.basename(filePath),
      mime_type: 'application/pdf', // or application/vnd.openxmlformats-officedocument.wordprocessingml.document
      data: buffer.toString('base64')
    });
  }

  const response = await client.responses.create(request);
  return response;
}
```

**Notes:**

* Files are included in the `input` array as objects with `type: 'input_file'`, `mime_type`, and `data` fields containing Base64.
* The project uses `gpt-4.1` by default; you can change to another supported model in the server configuration.

### Sample Request Payload (JSON-ish)

```json
{
  "model": "gpt-4.1",
  "input": [
    { "type": "text", "text": "Summarize the attached document and list 3 action items." },
    {
      "type": "input_file",
      "filename": "example.pdf",
      "mime_type": "application/pdf",
      "data": "JVBERi0xLjQKJcfs..."  // Base64
    }
  ]
}
```

### Sample Response (abridged)

The Responses API returns a structured response object. A simplified example:

```json
{
  "id": "resp_...",
  "object": "response",
  "model": "gpt-4.1",
  "output": [
    {
      "id": "o-...",
      "type": "message",
      "content": [
        { "type": "output_text", "text": "Here is the summary: ..." }
      ]
    }
  ]
}
```

The server extracts `output` content and forwards text back to the widget UI.

---

## Project Structure

```
OpenAI-chat-widget/
├─ public/
│  ├─ widget.html         # Widget UI
│  ├─ demo.html           # Demo/test page
│  └─ embed.js            # Script to inject the widget into other websites
├─ src/
│  ├─ server.ts           # Express server + Responses API integration
│  └─ utils/              # helper functions (file handling, encoding)
├─ dist/                  # compiled JS (output of tsc)
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## Future Improvements

* Add user authentication and rate-limiting (JWT, OAuth).
* Persist chat history and uploaded files to a database (MongoDB/Postgres) for auditing and playback.
* Add WebSocket / SSE for realtime updates and typing indicators.
* Add a configurable dashboard to manage API keys, models, and widget appearance (colors, brand).
* Add support for streaming responses where the UI shows partial tokens as they arrive.
* Add moderation, logging, and safety checks for uploaded files and content.

---

## License

This project is released under the **MIT License**. See the `LICENSE` file for details.

---

## Credits & References

* Built with the official OpenAI Node.js SDK (`openai`).
* Official Responses API documentation: [https://platform.openai.com/docs/api-reference/responses](https://platform.openai.com/docs/api-reference/responses)
* Repository: [https://github.com/ExploitEngineer/OpenAI-chat-widget](https://github.com/ExploitEngineer/OpenAI-chat-widget)

---

*If you want, I can also generate a `LICENSE` file or add a CONTRIBUTING.md with contribution guidelines.*
