import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import OpenAI from "openai";

dotenv.config();

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const app: Application = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

interface FileRequest extends Request {
  file?: Express.Multer.File;
}

app.post(
  "/api/openai-responses",
  upload.single("file"),
  async (req: FileRequest, res: Response): Promise<void> => {
    try {
      const message = req.body.message || "What's inside this file?";
      const uploadedFile = req.file;

      let response: any;

      if (uploadedFile) {
        response = await openai.responses.create({
          model: "gpt-4.1",
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: message },
                {
                  type: "input_file",
                  file_data: {
                    name: uploadedFile.originalname,
                    mime_type: uploadedFile.mimetype,
                    data: uploadedFile.buffer.toString("base64"),
                  },
                },
              ],
            },
          ] as any,
        });
      } else {
        response = await openai.responses.create({
          model: "gpt-4.1",
          input: [
            {
              role: "user",
              content: [{ type: "input_text", text: message }],
            },
          ],
        });
      }

      res.json({ reply: response.output_text });
    } catch (error) {
      console.error("Error communicating with OpenAI:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

app.get("/", (_: Request, res: Response): void => {
  res.json({ msg: "Welcome to Express server" });
});

app.get("/widget", (_: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "..", "public", "widget.html"));
});

app.get("/demo", (_: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "..", "public", "demo.html"));
});

app.get("/embed.js", (_: Request, res: Response): void => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    (function () {
      let iframe = document.createElement('iframe');
      iframe.src = 'http://localhost:${PORT}/widget';
      iframe.style.width = "400px";
      iframe.style.height = "400px";
      iframe.style.border = "none";
      iframe.style.position = "fixed";
      iframe.style.bottom = "20px";
      iframe.style.right = "20px";
      iframe.style.zIndex = "9999";
      document.body.appendChild(iframe);
    })()
  `);
});

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
