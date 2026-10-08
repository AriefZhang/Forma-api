const { spawn } = require("node:child_process");
const { watch } = require("node:fs");
const path = require("node:path");
let server,
  compiling = false,
  pending = false,
  timer;
function compile() {
  if (compiling) {
    pending = true;
    return;
  }
  compiling = true;
  const build = spawn(
    process.execPath,
    [require.resolve("typescript/bin/tsc")],
    { stdio: "inherit" },
  );
  build.on("exit", (code) => {
    compiling = false;
    if (code === 0) {
      if (server) server.kill();
      server = spawn(process.execPath, ["dist/main.js"], { stdio: "inherit" });
    }
    if (pending) {
      pending = false;
      compile();
    }
  });
}
watch(path.join(__dirname, "../src"), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(compile, 300);
});
compile();
process.on("SIGINT", () => {
  if (server) server.kill();
  process.exit();
});
