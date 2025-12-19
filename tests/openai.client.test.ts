import OpenAIClient from "../src/infrastructure/llm/OpenAIClient";

describe("OpenAIClient", () => {
  it("returns mock response when no API key", async () => {
    const client = new OpenAIClient("");
    const resp = await client.generate("hello world");
    expect(resp.text).toMatch(/MOCK_RESPONSE/);
  });

  it("uses SDK when LLM_API_KEY is set (mocked)", async () => {
    process.env.LLM_API_KEY = "test-key";
    const client = new OpenAIClient(process.env.LLM_API_KEY);
    const resp = await client.generate("make json");
    expect(resp.text).toContain("{");
    delete process.env.LLM_API_KEY;
  });
});
