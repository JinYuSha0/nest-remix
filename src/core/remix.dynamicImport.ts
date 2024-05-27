import * as fs from "fs";
import * as path from "path";

// Dynamically import all remix backend code under the directory (default: './dist/routes/server')
// to collect the providers required by nestjs, You can configure the environment variable
// "REMIX_SERVER_RELATIVE_PATH" to modify the default folder path
export const dynamicImportRemixBackend = (remixServerDirPath?: string) => {
  const directoryPath = remixServerDirPath ?? path.join(
    process.cwd(), "./dist/routes/server"
  );

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    if (path.extname(filePath) === ".js") {
      try {
        require(filePath);
      } catch (err) {
        console.log(`Import file ${filePath} failed:`, err);
      }
    }
  }
};

export default dynamicImportRemixBackend;
