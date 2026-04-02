import { describe, test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";

import { resolveCommandExpansion } from "../index.ts";

process.env.HOME = path.join(os.tmpdir(), `kompass-test-home-${process.pid}-core-dispatch`);

describe("resolveCommandExpansion", () => {
  test("expands known slash commands", async () => {
    const result = await resolveCommandExpansion(process.cwd(), { command: "review", body: "auth bug" });

    assert.equal(result.command, "review");
    assert.equal(result.body, "auth bug");
    assert.equal(result.expanded, true);
    assert.match(result.prompt, /<arguments>\s*auth bug\s*<\/arguments>/);
  });

  test("expands planner commands without carrying routing state", async () => {
    const result = await resolveCommandExpansion(process.cwd(), {
      command: "ticket/plan",
      body: "auth bug",
    });

    assert.equal(result.command, "ticket/plan");
    assert.equal(result.body, "auth bug");
    assert.equal(result.expanded, true);
  });

  test("returns the expanded prompt at tool level", async () => {
    const { createCommandExpansionTool } = await import("../index.ts");
    const tool = createCommandExpansionTool(process.cwd());
    const output = await tool.execute(
      { command: "review", body: "auth bug" },
      { worktree: process.cwd(), directory: process.cwd() },
    );

    assert.match(output, /## Goal/);
    assert.match(output, /auth bug/);
  });

  test("keeps unknown slash commands dispatchable without expansion", async () => {
    const result = await resolveCommandExpansion(process.cwd(), { command: "unknown", body: "auth bug" });

    assert.deepEqual(result, {
      command: "unknown",
      body: "auth bug",
      prompt: "/unknown\nauth bug",
      expanded: false,
    });
  });

  test("rejects missing commands", async () => {
    await assert.rejects(
      resolveCommandExpansion(process.cwd(), { command: "   ", body: "auth bug" }),
      /requires a command/,
    );
  });
});
