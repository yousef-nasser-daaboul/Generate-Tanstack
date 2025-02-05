import {
  extractClassDetails,
  type ClassDetails,
} from "../ast/extract-metadata";
import { generateFolderNameWithDateNow } from "../helper/generate-folder-name";
import { generateClientQueries } from "./generate-queries-builder";
import { generateIndex } from "./generate-index";
import { generateMutateQueries } from "./generate-mutations-builder";
import { generateQueryKeys } from "./generate-query-keys";
import { generateMutations } from "./generate-mutations";
import { generateQueries } from "./generate-queries";
import * as fs from "fs";
import * as path from "path";

export async function generateTanstack(
  inputPath: string,
  outputPath: string,
  clientName: string
) {
  const fileContent = fs.readFileSync(inputPath, "utf8");
  const astObj = extractClassDetails(fileContent);

  // Display the result
  // console.log("Extraction complete. Results:");
  // console.log(JSON.stringify(astObj, null, 2));

  await generateIndex(astObj, outputPath, clientName);
  await generateQueryKeys(astObj, outputPath, clientName);
  await generateClientQueries(astObj, outputPath, clientName);
  await generateMutateQueries(astObj, outputPath, clientName);
  await generateMutations(astObj, outputPath, clientName);
  await generateQueries(astObj, outputPath, clientName);
}
