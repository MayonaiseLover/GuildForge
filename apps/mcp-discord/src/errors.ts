export class MCPDiscordError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly recoverable: boolean = false
  ) {
    super(message);
    this.name = 'MCPDiscordError';
  }
}
