import McpToolRegistry from "./McpToolRegistry";

export class McpServer {
  private registry: McpToolRegistry;

  constructor(registry?: McpToolRegistry) {
    this.registry = registry || new McpToolRegistry();
  }

  registerTool(name: string, fn: (input: any) => Promise<any>) {
    this.registry.register(name, fn);
  }

  async invokeTool(name: string, input: any) {
    return this.registry.run(name, input);
  }
}

export default McpServer;
