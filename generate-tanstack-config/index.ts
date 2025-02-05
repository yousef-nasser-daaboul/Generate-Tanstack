import { generateTanstack } from "./src/generate-tanstack/index";
import { generateClient } from "./src/generate-clients/generate-clients";
import { generateFolderNameWithDateNow } from "./src/helper/generate-folder-name";
import SevenZip from "node-7z";
import { promisify } from "util";
import { rimraf } from "rimraf";

const args = process.argv.slice(2);
const moduleFlag = args.findIndex((arg) => arg === "--module");
const moduleName = moduleFlag !== -1 ? args[moduleFlag + 1] : null;

if (!moduleName) {
  console.error("Please provide a module name using --module flag");
  process.exit(1);
}

const rimrafAsync = promisify(rimraf);

generateConfig(
  "../tmp/downloads/" + moduleName + "Client.ts",
  moduleName.toLowerCase()
);

export async function generateConfig(inputPath: string, clientName?: string) {
  const folderName = "/" + generateFolderNameWithDateNow();
  const outputPath = "../tmp/output" + folderName + "/";

  if (clientName) {
    await generateClient(inputPath, outputPath, clientName);

    const outputPathTanstack = "../tmp/output" + folderName + "/tanstack/";
    await generateTanstack(
      outputPath + `${clientName}.client.ts`,
      outputPathTanstack,
      clientName
    );

    // Compress the folder using 7z
    const archivePath = `../tmp/output${folderName}.7z`;

    console.log(`ARCHIVE_PATH:${archivePath}`);

    const myStream = SevenZip.add(archivePath, outputPath, {
      recursive: true,
    });

    await new Promise((resolve, reject) => {
      myStream.on("end", resolve);
      myStream.on("error", reject);
    });

    // Delete the original folder
    await rimrafAsync(outputPath, {});

    // Return the path to the 7z file
    return archivePath;
  }
}
