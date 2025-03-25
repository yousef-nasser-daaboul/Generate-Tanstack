import { rename, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { generateClient } from "../utils/generate-clients/generate-clients";
import { generateFolderNameWithDateNow } from "../utils/helper/generate-folder-name";
import fs from "fs";
import archiver from "archiver";
import { rimraf } from "rimraf";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    console.log("query", query);

    if (query.module) {
      const module = query.module as string;
      const outputPath = await downloadModule(module);

      console.log("after downloaded ===>", outputPath);

      const folderName = generateFolderNameWithDateNow();

      console.log("folderName ==>", folderName);

      await generateClient(
        outputPath + "/" + module + "Client.ts", // input path
        "public/" + folderName,
        module.toLowerCase()
      );

      const archivePath = "public/generated.zip";
      archiveResult(archivePath, "public/" + folderName);

      return {
        success: true,
        message: "Commands executed successfully",
        archivePath: archivePath,
      };
    }

    return {
      success: false,
      message: "Commands executed Failed",
    };
  } catch (error) {
    console.error("Error executing commands:", error);
    return {
      success: false,
      message: "Error executing commands",
      error: error,
    };
  }

  async function archiveResult(archivePath: string, outputPath: string) {
    return new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(archivePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(
          `Archive created: ${archivePath} (${archive.pointer()} bytes)`
        );
        resolve();
      });

      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(outputPath, false);

      archive.finalize().catch(reject);
    }).then(() => rimraf(outputPath));
  }

  // try {
  //   const query = getQuery(event);
  //   console.log("query", query);

  //   if (query.module) {
  //     await downloadModule(query.module as string);
  //     const archivePath = await executeGenerate(query.module as string);
  //     await moveFileToPublic(archivePath);
  //     return {
  //       success: true,
  //       message: "Commands executed successfully",
  //       archivePath: archivePath,
  //     };
  //   }

  //   return {
  //     success: true,
  //     message: "Commands executed successfully",
  //   };
  // } catch (error) {
  //   console.error("Error executing commands:", error);
  //   return {
  //     success: false,
  //     message: "Error executing commands",
  //     error: error,
  //   };
  // }
});

async function downloadModule(module: string) {
  try {
    const response = await fetch(
      `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
    );

    if (!response.ok) {
      throw new Error(`Failed to download module: ${response.statusText}`);
    }

    const fileContent = await response.arrayBuffer();

    const outputPath = "downloads";

    // Ensure downloads directory exists
    await mkdir(outputPath, { recursive: true });

    // Write the file as binary data
    await writeFile(
      outputPath + `/${module}Client.ts`,
      Buffer.from(fileContent)
    );

    console.log(
      `Successfully downloaded ${module} module to downloads/${module}Client.ts`
    );
    return outputPath;
  } catch (error) {
    console.error("Error downloading module:", error);
    throw error;
  }
}

// async function executeGenerate(module: string) {
  // const { stdout, stderr } = await execAsync(
  //   `cd generate-tanstack-config && bun i && bun dev --module ${module}`
  // );

  // if (stderr) {
  //   console.error('stderr:', stderr);
  // }

  // Extract archive path from stdout
  // const archivePathMatch = stdout.match(/ARCHIVE_PATH:(.+)/);
  // const archivePath = archivePathMatch ? archivePathMatch[1].trim() : null;

  // if (archivePath) {
  //   console.log("Generated archive at:", archivePath);
  //   return archivePath.replace("../", "./");
  // } else {
  //   throw new Error("Archive path not found in output");
  // }
// }

// async function moveFileToPublic(archivePath: string) {
//   const publicPath = join(process.cwd(), "public", "generated.zip");
//   await rename(archivePath, publicPath);
// }
