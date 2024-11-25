const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootPackage = require("./package.json");

const packages = fs
  .readdirSync("./packages")
  .filter((dir) => fs.statSync(path.join("./packages", dir)).isDirectory());

packages.forEach((packageDir) => {
  const packagePath = path.join(
    __dirname,
    "./packages",
    packageDir,
    "package.json"
  );

  console.log(packagePath);

  const packageJson = require(packagePath);

  packageJson.version = rootPackage.version;

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  execSync(`git add ${packagePath}`, { stdio: "inherit" });
});
