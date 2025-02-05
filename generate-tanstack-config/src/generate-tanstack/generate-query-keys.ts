import type { ClassDetails, MethodDetails } from "../ast/extract-metadata";
import { writeFormattedFile } from "../helper/writer";

export async function generateQueryKeys(
  astObj: ClassDetails[],
  folderName: string,
  clientName: string
) {
  const clientNameUpdated = clientName.split(".")[0].toUpperCase();
  let content = `export const ${clientNameUpdated}_QUERY_KEYS = {`;
  astObj.forEach((classDetail) => {
    // Start object for this class
    content += `${generateClassQueryKeyName(classDetail)}: {`;

    // Add methods that are GET type
    classDetail.methods.forEach((method) => {
      if (method.methodType === "GET") {
        const clientNameUpdated = clientName.split(".")[0].toUpperCase();
        content += `${generateMethodQueryKeyName(method)}: '${clientNameUpdated}.${generateQueryPathValue(classDetail, method)}',`;
      }
    });

    content += "},";
  });

  content += "};";

  await writeFormattedFile(
    folderName,
    `${clientName.split(".")[0]}-query-keys.ts`,
    content
  );
}

export function generateQueryPathValue(
  classDetail: ClassDetails,
  method: MethodDetails
) {
  return `${generateClassQueryKeyName(classDetail)}.${generateMethodQueryKeyName(method)}`;
}

export function generateClassQueryKeyName(classDetail: ClassDetails) {
  return classDetail.className
    .replace(/Client$/, "") // Remove 'Client' suffix
    .split(/(?=[A-Z])/) // Split on capital letters
    .join("_") // Join with underscores
    .toUpperCase(); // Convert to uppercase
}
export function generateMethodQueryKeyName(method: MethodDetails) {
  return method.name
    .split(/(?=[A-Z])/)
    .join("_")
    .toUpperCase();
}
