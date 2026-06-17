const fs = require("fs");
const path = require("path");

const dep = process.argv[2];
const cwd = process.cwd();
const pkgPath = dep
  ? fs.existsSync(path.join(cwd, dep, "package.json"))
    ? path.join(cwd, dep, "package.json")
    : path.join(cwd, "node_modules", dep, "package.json")
  : "";

if (!dep || !fs.existsSync(pkgPath)) {
  console.log(JSON.stringify({ dependencies: {} }));
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
console.log(JSON.stringify({
  dependencies: {
    [dep]: {
      version: pkg.version
    }
  }
}));
