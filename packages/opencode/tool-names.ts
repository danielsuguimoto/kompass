export function getOpenCodeToolName(toolName: string) {
  return toolName.startsWith("kompass_") ? toolName : `kompass_${toolName}`;
}

export function getConfiguredOpenCodeToolName(
  toolName: string,
  configuredName?: string,
) {
  return configuredName ?? getOpenCodeToolName(toolName);
}
