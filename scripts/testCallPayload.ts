import buildPayloadFromSchema from "../src/application/llm/buildPayloadFromSchema.usecase";

async function run() {
  const schema = { type: "object", properties: { id: { type: "number" } }, required: ["id"] };
  try {
    const payload = await buildPayloadFromSchema(schema as any);
    console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
  } catch (err: any) {
    console.error("ERROR:", err?.message || err);
    process.exit(1);
  }
}

run();
