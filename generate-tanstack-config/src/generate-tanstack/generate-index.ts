import type { ClassDetails } from "../ast/extract-metadata";
import { writeFormattedFile } from "../helper/writer";

export async function generateIndex(
  astObj: ClassDetails[],
  outputPath: string,
  clientName: string
) {
  // Generate Imports
  let content = `import { clientsProp } from "~user-management/utils/axios.config";`;
  if (astObj.length > 0) {
    content += "import {";
    content += astObj.map((obj) => obj.className).join(",");
    content += `} from "../${clientName}.client";`;
  }

  content += "\n\n";
  //Generate Objects
  astObj.forEach((classObj) => {
    content += `const ${classObj.className.charAt(0).toLowerCase() + classObj.className.slice(1)} = new ${classObj.className}(clientsProp.baseUrl,clientsProp.instance);`;
    content += "\n\n";
  });

  content += "\n";
  if (astObj.length > 0) {
    content += "export {";
    content += astObj
      .map(
        (obj) => obj.className.charAt(0).toLowerCase() + obj.className.slice(1)
      )
      .join(",");
    content += `};`;
  }
  await writeFormattedFile(outputPath, "index.ts", content);
}
