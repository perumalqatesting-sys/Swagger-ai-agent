export type McpTool = (input: any) => Promise<any>;

export class McpToolRegistry {
  private tools: Map<string, McpTool> = new Map();

  register(name: string, tool: McpTool) {
    this.tools.set(name, tool);
  }

  async run(name: string, input: any) {
    const t = this.tools.get(name);
    if (!t) throw new Error(`Tool not found: ${name}`);
    return t(input);
  }
}

export default McpToolRegistry;
