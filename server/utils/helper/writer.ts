import * as fs from "fs";
import * as path from "path";
import prettier from "prettier";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function writeFormattedFile(
  dirName: string,
  fileName: string,
  content: string,
  withFormat: boolean = true
): Promise<void> {
  try {
    if (typeof content !== "string") {
      throw new TypeError("Content must be a string.");
    }

    const currentFilePath = __dirname;
    const rootPath = path.resolve(currentFilePath, "../../"); // Navigate up to `/src`
    const outputPath = path.join(rootPath, dirName);

    // Resolve the full path
    const fullPath = path.join(outputPath, fileName);

    // Format the content using Prettier
    const formattedContent = withFormat
      ? await prettier.format(content, {
          parser: "typescript", // Adjust the parser based on your file type
          singleQuote: true,
          trailingComma: "all",
        })
      : content;

    // Ensure the directory exists
    fs.mkdirSync(outputPath, { recursive: true });

    // Write the formatted content to the file
    fs.writeFileSync(fullPath, formattedContent, "utf8");

    console.log(`File successfully written to: ${fullPath}`);
  } catch (error) {
    console.error("Error writing file:", error);
  }
}
