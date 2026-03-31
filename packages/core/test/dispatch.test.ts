import { describe, test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";

import { resolveSessionCommand } from "../index.ts";

process.env.HOME = path.join(os.tmpdir(), `kompass-test-home-${process.pid}-core-dispatch`);

describe("resolveSessionCommand", () => {
  test("expands known slash commands and infers their default agent", async () => {
    const result = await resolveSessionCommand(process.cwd(), { command: "review", body: "auth bug" });

    assert.equal(result.agent, "reviewer");
    assert.equal(result.command, "review");
    assert.equal(result.body, "auth bug");
    assert.equal(result.expanded, true);
    assert.match(result.prompt, /<arguments>\s*auth bug\s*<\/arguments>/);
  });

  test("preserves explicit agent routing when present", async () => {
    const result = await resolveSessionCommand(process.cwd(), {
      agent: "planner",
      command: "ticket/plan",
      body: "auth bug",
    });

    assert.equal(result.agent, "planner");
    assert.equal(result.command, "ticket/plan");
    assert.equal(result.body, "auth bug");
    assert.equal(result.expanded, true);
  });

  test("allows a dispatch-tag agent override at tool level", async () => {
    const { createSessionCommandTool } = await import("../index.ts");
    const tool = createSessionCommandTool(process.cwd());
    const output = await tool.execute(
      { command: "review", body: "auth bug", agent: "worker" },
      { worktree: process.cwd(), directory: process.cwd() },
    );
    const result = JSON.parse(output);

    assert.equal(result.agent, "worker");
    assert.equal(result.command, "review");
  });

  test("keeps unknown slash commands dispatchable without expansion", async () => {
    const result = await resolveSessionCommand(process.cwd(), { command: "unknown", body: "auth bug" });

    assert.deepEqual(result, {
      command: "unknown",
      body: "auth bug",
      prompt: "/unknown\nauth bug",
      expanded: false,
    });
  });

  test("rejects missing commands", async () => {
    await assert.rejects(
      resolveSessionCommand(process.cwd(), { command: "   ", body: "auth bug" }),
      /requires a command/,
    );
  });
});
