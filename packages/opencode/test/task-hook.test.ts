import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  getCommandExecution,
  getTaskToolExecution,
  removeSyntheticAgentHandoff,
} from "../index.ts";

describe("getTaskToolExecution", () => {
  test("keeps raw task prompts unchanged", async () => {
    const output = {
      args: {
        prompt: "/review auth bug",
        description: "Run review command",
        subagent_type: "reviewer",
        command: "@reviewer /review auth bug",
      },
    };
    const execution = await getTaskToolExecution(
      {
        tool: "task",
        sessionID: "session-1",
        callID: "call-1",
      },
      output,
    );

    assert.equal(execution?.prompt, "/review auth bug");
    assert.equal(execution?.raw_prompt, "/review auth bug");
    assert.equal(execution?.description, "Run review command");
    assert.equal(execution?.subagent_type, "reviewer");
    assert.equal(execution?.command, "@reviewer /review auth bug");
  });

  test("prefers the raw prompt over command metadata", async () => {
    const output = {
      args: {
        prompt: "/review auth bug with multiline\nextra context",
        description: "Run review command",
        subagent_type: "reviewer",
        command: "@reviewer /review auth bug",
      },
    };

    const execution = await getTaskToolExecution(
      {
        tool: "task",
        sessionID: "session-1",
        callID: "call-1",
      },
      output,
    );

    assert.equal(execution?.prompt, "/review auth bug with multiline\nextra context");
    assert.equal(execution?.command, "@reviewer /review auth bug");
  });

  test("ignores non-task tool calls", async () => {
    const execution = await getTaskToolExecution(
      {
        tool: "bash",
        sessionID: "session-1",
        callID: "call-1",
      },
      {
        args: {
          prompt: "should not be read",
        },
      },
    );

    assert.equal(execution, undefined);
  });

  test("ignores task tool calls without a prompt or command", async () => {
    const execution = await getTaskToolExecution(
      {
        tool: "task",
        sessionID: "session-1",
        callID: "call-1",
      },
      {
        args: {
          description: "Fix auth bug",
          subagent_type: "planner",
        },
      },
    );

    assert.equal(execution, undefined);
  });

  test("returns the raw task prompt when the command is unknown", async () => {
    const execution = await getTaskToolExecution(
      {
        tool: "task",
        sessionID: "session-1",
        callID: "call-1",
      },
      {
        args: {
          prompt: "/unknown auth bug",
          command: "/unknown auth bug",
        },
      },
    );

    assert.deepEqual(execution, {
      prompt: "/unknown auth bug",
      raw_prompt: "/unknown auth bug",
      command: "/unknown auth bug",
      description: undefined,
      subagent_type: undefined,
    });
  });

  test("falls back to command metadata when prompt is missing", async () => {
    const output = {
      args: {
        prompt: undefined,
        command: "/branch Branch naming guidance: fix login redirect",
        description: "Create feature branch",
        subagent_type: "worker",
      },
    };

    const execution = await getTaskToolExecution(
      {
        tool: "task",
        sessionID: "session-1",
        callID: "call-1",
      },
      output,
    );

    assert.equal(execution?.prompt, "/branch Branch naming guidance: fix login redirect");
    assert.equal(execution?.command, "/branch Branch naming guidance: fix login redirect");
    assert.equal(output.args.prompt, undefined);
  });
});

describe("getCommandExecution", () => {
  test("reads the expanded command prompt from text parts", () => {
    const execution = getCommandExecution(
      {
        command: "review",
        sessionID: "session-2",
        arguments: "auth bug",
      },
      {
        parts: [
          {
            id: "part-1",
            sessionID: "session-2",
            messageID: "message-1",
            type: "text",
            text: "expanded command prompt",
          },
        ],
      },
    );

    assert.deepEqual(execution, {
      command: "review",
      arguments: "auth bug",
      prompt: "expanded command prompt",
    });
  });

  test("ignores command executions without text parts", () => {
    const execution = getCommandExecution(
      {
        command: "review",
        sessionID: "session-2",
        arguments: "auth bug",
      },
      {
        parts: [
          {
            id: "part-1",
            sessionID: "session-2",
            messageID: "message-1",
            type: "subtask",
            prompt: "/review auth bug",
            description: "Run review command",
            agent: "general",
          },
        ],
      },
    );

    assert.equal(execution, undefined);
  });
});

describe("removeSyntheticAgentHandoff", () => {
  test("removes the legacy synthetic agent handoff text", () => {
    const output = {
      parts: [
        {
          id: "part-1",
          sessionID: "session-3",
          messageID: "message-1",
          type: "text",
          text: "Please generate a prompt and call the task tool with subagent: planner",
          synthetic: true,
        },
        {
          id: "part-2",
          sessionID: "session-3",
          messageID: "message-1",
          type: "text",
          text: "keep this",
        },
      ],
    };

    const removed = removeSyntheticAgentHandoff(output as never);

    assert.equal(removed, true);
    assert.equal(output.parts.length, 1);
    assert.equal(output.parts[0]?.text, "keep this");
  });

  test("keeps non-synthetic text untouched", () => {
    const output = {
      parts: [
        {
          id: "part-1",
          sessionID: "session-4",
          messageID: "message-1",
          type: "text",
          text: "Summarize the task tool output above and continue with your task.",
        },
      ],
    };

    const removed = removeSyntheticAgentHandoff(output as never);

    assert.equal(removed, false);
    assert.equal(output.parts.length, 1);
  });
});
