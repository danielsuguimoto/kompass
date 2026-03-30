import { resolveCommands } from "../commands/index.ts";
import { stringifyJson, type ToolDefinition, type ToolExecutionContext } from "./shared.ts";

export type SessionCommandResolution = {
  input: string;
  agent?: string;
  command: string;
  arguments: string;
  body: string;
  expanded: boolean;
};

type ResolveSessionCommandOptions = {
  rewriteBody?: (body: string) => string;
};

type ParsedSlashCommand = {
  agent?: string;
  command: string;
  arguments: string;
};

function parseSlashCommand(value: string): ParsedSlashCommand | undefined {
  const match = value.trim().match(/^(?:@(\S+)\s+)?\/([^\s]+)(?:\s+([\s\S]*))?$/);

  if (!match) return;

  return {
    agent: match[1],
    command: match[2],
    arguments: match[3]?.trim() ?? "",
  };
}

function expandCommandTemplate(template: string, commandArguments: string) {
  const trimmedArguments = commandArguments.trim();
  const positionalArguments = trimmedArguments ? trimmedArguments.split(/\s+/) : [];

  let expandedTemplate = template.replaceAll("$ARGUMENTS", trimmedArguments);

  for (const [index, argument] of positionalArguments.entries()) {
    expandedTemplate = expandedTemplate.replaceAll(`$${index + 1}`, argument);
  }

  return expandedTemplate;
}

export async function resolveSessionCommand(
  projectRoot: string,
  input: string,
  options?: ResolveSessionCommandOptions,
): Promise<SessionCommandResolution> {
  const normalizedInput = input.trim();
  const parsedCommand = parseSlashCommand(input);

  if (!parsedCommand) {
    throw new Error("session_command requires slash-command input");
  }

  const commands = await resolveCommands(projectRoot);
  const definition = commands[parsedCommand.command];

  if (!definition) {
    return {
      input: normalizedInput,
      ...(parsedCommand.agent ? { agent: parsedCommand.agent } : {}),
      command: parsedCommand.command,
      arguments: parsedCommand.arguments,
      body: normalizedInput,
      expanded: false,
    };
  }

  let body = expandCommandTemplate(definition.template, parsedCommand.arguments);

  if (options?.rewriteBody) {
    body = options.rewriteBody(body);
  }

  return {
    input: normalizedInput,
    agent: parsedCommand.agent ?? definition.agent,
    command: parsedCommand.command,
    arguments: parsedCommand.arguments,
    body,
    expanded: true,
  };
}

export function createSessionCommandTool(
  projectRoot: string,
  options?: ResolveSessionCommandOptions,
) {
  return {
    description: "Resolve a slash command for same-session queuing",
    args: {
      input: {
        type: "string",
        description: "Raw slash command to resolve",
      },
      agent: {
        type: "string",
        optional: true,
        description: "Optional agent override from the dispatch tag",
      },
    },
    async execute(
      args: { input: string; agent?: string },
      _ctx: ToolExecutionContext,
    ) {
      const resolved = await resolveSessionCommand(projectRoot, args.input, options);

      return stringifyJson({
        ...resolved,
        agent: args.agent?.trim() || resolved.agent,
      });
    },
  } satisfies ToolDefinition<{ input: string; agent?: string }>;
}
