import * as fs from "fs";
import { writeFormattedFile } from "../helper/writer";
import {
  extractClassDetails,
  extractInterfaceDetails,
} from "../ast/extract-metadata";
import { extractEnumDetails } from "../ast/extract-metadata";
import { clientFunctionsGenerated } from "../helper/client-functions-generated";
import { generateInterfaces } from "./generate-interfaces";
import { generateClasses } from "./generate-classes";

export async function generateClient(
  inputPath: string,
  outputPath: string,
  clientName: string
): Promise<void> {
  const fileContent = fs.readFileSync(inputPath, "utf8");

  let content = ``;

  const classes = extractClassDetails(fileContent);
  content += generateClasses(classes);

  const interfaces = extractInterfaceDetails(fileContent);

  content += generateInterfaces(interfaces);

  const enums = extractEnumDetails(fileContent);

  for (const enumInfo of enums) {
    content += enumInfo.code;
  }

  content += clientFunctionsGenerated;

  await writeFormattedFile(outputPath, `${clientName}.client.ts`, content);
}
