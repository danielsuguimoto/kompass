import { resolveCommands } from "../commands/index.ts";
import type { AgentName, CommandName, ToolName } from "../lib/config.ts";
import type { ToolDefinition, ToolExecutionContext } from "./shared.ts";

export type CommandExpansion = {
  command: string;
  body: string;
  prompt: string;
  expanded: boolean;
};

type ResolveCommandExpansionOptions = {
  names?: {
    tools?: Partial<Record<ToolName, { name: string }>>;
    commands?: Partial<Record<CommandName, { name: string }>>;
    agents?: Partial<Record<AgentName, { name: string }>>;
  };
};

type CommandExpansionInput = {
  command: string;
  body?: string;
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

export async function resolveCommandExpansion(
  projectRoot: string,
  input: CommandExpansionInput,
  options?: ResolveCommandExpansionOptions,
): Promise<CommandExpansion> {
  const normalizedCommand = input.command.trim();
  const normalizedBody = input.body?.trim() ?? "";

  if (!normalizedCommand) {
    throw new Error("command_expansion requires a command");
  }

  const commands = await resolveCommands(projectRoot, { names: options?.names });
  const definition = commands[normalizedCommand];

  if (!definition) {
    return {
      command: normalizedCommand,
      body: normalizedBody,
      prompt: renderSlashCommand(normalizedCommand, normalizedBody),
      expanded: false,
    };
  }

  const prompt = expandCommandTemplate(definition.template, normalizedBody);

  return {
    command: normalizedCommand,
    body: normalizedBody,
    prompt,
    expanded: true,
  };
}

export function createCommandExpansionTool(
  projectRoot: string,
  options?: ResolveCommandExpansionOptions,
) {
  return {
    description: "Expand a delegated command body into a runnable prompt",
    args: {
      command: {
        type: "string",
        description: "Command name to resolve, without the leading slash",
      },
      body: {
        type: "string",
        optional: true,
        description: "Literal body content from the delegate block",
      },
    },
    async execute(
      args: { command: string; body?: string },
      _ctx: ToolExecutionContext,
    ) {
      const resolved = await resolveCommandExpansion(projectRoot, args, options);
      return resolved.prompt;
    },
  } satisfies ToolDefinition<{ command: string; body?: string }>;
}
