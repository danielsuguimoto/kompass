import { resolveCommands } from "../commands/index.ts";
import { stringifyJson, type ToolDefinition, type ToolExecutionContext } from "./shared.ts";

export type SessionCommandResolution = {
  agent?: string;
  command: string;
  body: string;
  prompt: string;
  expanded: boolean;
};

type ResolveSessionCommandOptions = {
  rewriteBody?: (body: string) => string;
};

type SessionCommandInput = {
  command: string;
  body?: string;
  agent?: string;
};

function renderSlashCommand(command: string, body: string) {
  const trimmedBody = body.trim();
  return trimmedBody ? `/${command}\n${trimmedBody}` : `/${command}`;
}

function expandCommandTemplate(template: string, commandBody: string) {
  const trimmedBody = commandBody.trim();
  const positionalArguments = trimmedBody ? trimmedBody.split(/\s+/) : [];

  let expandedTemplate = template.replaceAll("$ARGUMENTS", trimmedBody);

  for (const [index, argument] of positionalArguments.entries()) {
    expandedTemplate = expandedTemplate.replaceAll(`$${index + 1}`, argument);
  }

  return expandedTemplate;
}

export async function resolveSessionCommand(
  projectRoot: string,
  input: SessionCommandInput,
  options?: ResolveSessionCommandOptions,
): Promise<SessionCommandResolution> {
  const normalizedCommand = input.command.trim();
  const normalizedBody = input.body?.trim() ?? "";

  if (!normalizedCommand) {
    throw new Error("session_command requires a command");
  }

  const commands = await resolveCommands(projectRoot);
  const definition = commands[normalizedCommand];

  if (!definition) {
    return {
      ...(input.agent?.trim() ? { agent: input.agent.trim() } : {}),
      command: normalizedCommand,
      body: normalizedBody,
      prompt: renderSlashCommand(normalizedCommand, normalizedBody),
      expanded: false,
    };
  }

  let prompt = expandCommandTemplate(definition.template, normalizedBody);

  if (options?.rewriteBody) {
    prompt = options.rewriteBody(prompt);
  }

  return {
    agent: input.agent?.trim() || definition.agent,
    command: normalizedCommand,
    body: normalizedBody,
    prompt,
    expanded: true,
  };
}

export function createSessionCommandTool(
  projectRoot: string,
  options?: ResolveSessionCommandOptions,
) {
  return {
    description: "Resolve a delegated command body for same-session async queuing",
    args: {
      command: {
        type: "string",
        description: "Command name to resolve, without the leading slash",
      },
      body: {
        type: "string",
        optional: true,
        description: "Literal body content from the session_command block",
      },
      agent: {
        type: "string",
        optional: true,
        description: "Optional agent override from the session_command tag",
      },
    },
    async execute(
      args: { command: string; body?: string; agent?: string },
      _ctx: ToolExecutionContext,
    ) {
      return stringifyJson(await resolveSessionCommand(projectRoot, args, options));
    },
  } satisfies ToolDefinition<{ command: string; body?: string; agent?: string }>;
}
