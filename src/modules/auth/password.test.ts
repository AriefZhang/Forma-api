import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password";
test("salted password hashes reject incorrect passwords", () => {
  const a = hashPassword("secure-test-password");
  const b = hashPassword("secure-test-password");
  assert.notEqual(a, b);
  assert.equal(verifyPassword("secure-test-password", a), true);
  assert.equal(verifyPassword("wrong-password", a), false);
  assert.equal(verifyPassword("password", "malformed"), false);
});
