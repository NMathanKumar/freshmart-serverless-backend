const { execFileSync } = require("child_process");

try {
  const out = execFileSync(
    "npm.cmd",
    ["-v"],
    {
      stdio: "pipe"
    }
  );

  console.log(out.toString());

} catch (e) {
  console.log(e);
}