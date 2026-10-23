const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});

test("protected interview endpoints require a login cookie", async () => {
    const response = await fetch(`${baseUrl}/api/interview/`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Token not provided." });
});

test("local Vite origins are allowed to make credentialed API requests", async () => {
    const origin = "http://127.0.0.1:5182";
    const response = await fetch(`${baseUrl}/api/auth/get-me`, {
        method: "OPTIONS",
        headers: {
            Origin: origin,
            "Access-Control-Request-Method": "GET",
        },
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
});
