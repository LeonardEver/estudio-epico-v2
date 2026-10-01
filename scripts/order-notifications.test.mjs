import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Exercise the real payment transition with local stand-ins for Sheets/email.
// No payment, email or Google API is contacted.
const source = readFileSync(new URL("../src/lib/server/orders.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function orderBook(notificationMode) {
  const row = { orderId: "MUS-QA", rowNumber: 2, values: Array(23).fill("") };
  row.values[0] = row.orderId;
  row.values[11] = "AWAITING_PAYMENT";
  const state = { writes: 0, emails: 0, failEmail: false };
  const dependencies = {
    "./env": {
      env: (name) => (name === "ORDER_EMAIL_NOTIFICATIONS" ? notificationMode : "configured"),
      missingOrderEnvVars: () => [],
    },
    "./google-sheets": {
      readOrderRows: async () => [row],
      updateOrderRow: async (rowNumber, updates) => {
        assert.equal(rowNumber, row.rowNumber);
        state.writes += 1;
        for (const { column, value } of updates) row.values[column.charCodeAt(0) - 65] = value;
      },
    },
    "./order-id": {},
    "./email": {
      sendOwnerOrderEmail: async () => {
        state.emails += 1;
        if (state.failEmail) throw new Error("Simulated email failure");
      },
    },
  };
  const exports = {};
  runInNewContext(
    compiled,
    {
      exports,
      require: (name) => {
        assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
        return dependencies[name];
      },
      console: { error: () => {} },
    },
    { filename: "orders.ts" },
  );
  return { row, state, markOrderPaid: exports.markOrderPaid };
}

for (const mode of [undefined, "false"]) {
  test(`manual email mode (${mode ?? "default"}) records payment and ignores duplicate webhooks`, async () => {
    const { row, state, markOrderPaid } = orderBook(mode);
    assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "paid");
    assert.equal(row.values[11], "PAID");
    assert.equal(row.values[12], "transaction-qa");
    assert.ok(!Number.isNaN(Date.parse(row.values[13])));
    assert.equal(row.values[16], "DISABLED");
    assert.equal(state.emails, 0);
    const paidAt = row.values[13];
    assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "duplicate");
    assert.equal(state.writes, 1);
    assert.equal(state.emails, 0);
    assert.equal(row.values[13], paidAt);
  });
}

test("manual mode does not retry an old failed notification", async () => {
  const { row, state, markOrderPaid } = orderBook("false");
  row.values[11] = "PAID";
  row.values[13] = "2026-09-30T12:00:00.000Z";
  row.values[16] = "FAILED";
  assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "duplicate");
  assert.equal(state.emails, 0);
  assert.equal(state.writes, 0);
});

test("owner notifications require explicit opt-in and send once", async () => {
  const { row, state, markOrderPaid } = orderBook("true");
  assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "paid");
  assert.equal(row.values[16], "SENT");
  assert.equal(state.emails, 1);
  assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "duplicate");
  assert.equal(state.emails, 1);
});

test("optional email failure preserves payment; retry preserves its original timestamp", async () => {
  const { row, state, markOrderPaid } = orderBook("true");
  state.failEmail = true;
  assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "paid");
  assert.equal(row.values[11], "PAID");
  assert.equal(row.values[16], "FAILED");
  const paidAt = "2026-09-30T12:00:00.000Z";
  row.values[13] = paidAt;
  state.failEmail = false;
  assert.equal(await markOrderPaid(row.orderId, "transaction-qa"), "paid");
  assert.equal(row.values[16], "SENT");
  assert.equal(row.values[13], paidAt);
  assert.equal(state.emails, 2);
});
