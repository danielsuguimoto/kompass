import {
  getEnabledToolNames,
  loadKompassConfig,
  mergeWithDefaults,
  resolveAgents,
  resolveCommands,
  type MergedKompassConfig,
  type ResolvedAgentDefinition,
  type ResolvedCommandDefinition,
} from "../core/index.ts";
import {
  getConfiguredOpenCodeToolName,
  prefixKompassToolReferences,
} from "./tool-names.ts";

const mergedConfigCache = new Map<string, Promise<MergedKompassConfig>>();
const configuredToolNamesCache = new Map<string, Promise<Record<string, string>>>();
const resolvedAgentsCache = new Map<string, Promise<Record<string, ResolvedAgentDefinition>>>();
const resolvedCommandsCache = new Map<string, Promise<Record<string, ResolvedCommandDefinition>>>();

function readThroughCache<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached;

  const pending = load().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, pending);
  return pending;
}

export function loadMergedKompassConfig(projectRoot: string): Promise<MergedKompassConfig> {
  return readThroughCache(mergedConfigCache, projectRoot, async () => {
    const userConfig = await loadKompassConfig(projectRoot);
    return mergeWithDefaults(userConfig);
  });
}

export function loadConfiguredToolNames(projectRoot: string): Promise<Record<string, string>> {
  return readThroughCache(configuredToolNamesCache, projectRoot, async () => {
    const config = await loadMergedKompassConfig(projectRoot);
    return Object.fromEntries(
      getEnabledToolNames(config.tools).map((toolName) => [
        toolName,
        getConfiguredOpenCodeToolName(toolName, config.tools[toolName].name),
      ]),
    );
  });
}

export async function rewriteKompassToolReferences(projectRoot: string, input: string): Promise<string> {
  const configuredToolNames = await loadConfiguredToolNames(projectRoot);
  return prefixKompassToolReferences(input, configuredToolNames);
}

export function loadResolvedAgents(projectRoot: string): Promise<Record<string, ResolvedAgentDefinition>> {
  return readThroughCache(resolvedAgentsCache, projectRoot, () => resolveAgents(projectRoot));
}

export function loadResolvedCommands(projectRoot: string): Promise<Record<string, ResolvedCommandDefinition>> {
  const ciKey = process.env.CI ? "ci" : "non-ci";
  const cacheKey = `${projectRoot}:${ciKey}`;
  return readThroughCache(resolvedCommandsCache, cacheKey, () => resolveCommands(projectRoot));
}
