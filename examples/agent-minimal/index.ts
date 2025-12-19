import createApp from "../../src/core/app";
import http from "http";

const app = createApp();
const server = http.createServer(app);
const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Example agent running on http://localhost:${PORT}`);
});

// This example doesn't call a real LLM; use /api/spec/import to upload a sample spec when testing.
