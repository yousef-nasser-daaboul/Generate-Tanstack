import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { rename, writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const execAsync = promisify(exec);

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    console.log("query", query);

    if (query.module) {
      await downloadModule(query.module as string);
      const archivePath = await executeGenerate(query.module as string);
      await moveFileToPublic(archivePath);
      return {
        success: true,
        message: "Commands executed successfully",
        archivePath: archivePath,
      };
    }

    return {
      success: true,
      message: "Commands executed successfully",
    };
  } catch (error) {
    console.error("Error executing commands:", error);
    return {
      success: false,
      message: "Error executing commands",
      error: error,
    };
  }
});

async function downloadModule(module: string) {
  try {
    const response = await fetch(`https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`);
    
    if (!response.ok) {
      throw new Error(`Failed to download module: ${response.statusText}`);
    }

    const fileContent = await response.arrayBuffer();
    
    // Ensure downloads directory exists
    await mkdir('downloads', { recursive: true });
    
    // Write the file as binary data
    await writeFile(`downloads/${module}Client.ts`, Buffer.from(fileContent));
    
    console.log(`Successfully downloaded ${module} module to downloads/${module}Client.ts`);
  } catch (error) {
    console.error('Error downloading module:', error);
    throw error;
  }
}

async function executeGenerate(module: string) {
  const { stdout, stderr } = await execAsync(
    `cd generate-tanstack-config && bun dev --module ${module}`
  );
  
  // if (stderr) {
  //   console.error('stderr:', stderr);
  // }
  
  // Extract archive path from stdout
  const archivePathMatch = stdout.match(/ARCHIVE_PATH:(.+)/);
  const archivePath = archivePathMatch ? archivePathMatch[1].trim() : null;

  if (archivePath) {
    console.log('Generated archive at:', archivePath);
    return archivePath.replace("../", "./");
  } else {
    throw new Error('Archive path not found in output');
  }
}

async function moveFileToPublic(archivePath: string) {
  const publicPath = join(process.cwd(), 'public', 'generated.7z');
  await rename(archivePath, publicPath);
}