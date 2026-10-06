import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { afterEach, test } from "node:test";
import { mapSavePlugin } from "./map-save-plugin.mjs";

const roots = [];

function makeRoute() {
  const root = mkdtempSync(join(tmpdir(), "ember-map-save-test-"));
  roots.push(root);
  let middleware;
  mapSavePlugin().configureServer({
    config: { root },
    middlewares: { use(handler) { middleware = handler; } },
    moduleGraph: { getModulesByFile() { return []; } },
  });
  return {
    root,
    post(value) {
      const req = Readable.from([Buffer.from(JSON.stringify(value), "utf8")]);
      req.url = "/__map-save";
      req.method = "POST";
      return new Promise((resolveResult) => {
        const res = {
          statusCode: 200,
          setHeader() {},
          end(body) { resolveResult({ status: this.statusCode, body: JSON.parse(body) }); },
        };
        middleware(req, res, () => resolveResult({ passedThrough: true }));
      });
    },
  };
}

afterEach(() => {
  const tempRoot = resolve(tmpdir());
  for (const root of roots.splice(0)) {
    const target = resolve(root);
    assert.ok(target.startsWith(`${tempRoot}${sep}`), "test cleanup stays inside the OS temp directory");
    rmSync(target, { recursive: true, force: true });
  }
});

test("map save reports success only after the project file reads back as the saved draft", async () => {
  const route = makeRoute();
  const draft = { id: "save-check", title: "Persistence check", cols: 1, rows: 1, tiles: ["plains"] };
  const result = await route.post(draft);

  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  const saved = JSON.parse(readFileSync(join(route.root, "src", "game", "maps", "save-check001.json"), "utf8"));
  assert.equal(saved.serial, result.body.serial);
  assert.deepEqual(saved.draft, draft);
});

test("map save rejects an unsafe id instead of claiming it was saved", async () => {
  const route = makeRoute();
  const result = await route.post({ id: "../outside", title: "Invalid" });

  assert.equal(result.status, 400);
  assert.equal(result.body.ok, false);
  assert.match(result.body.error, /id inválido/);
});
