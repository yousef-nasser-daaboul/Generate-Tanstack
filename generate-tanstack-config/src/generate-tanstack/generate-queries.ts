import type { ClassDetails } from "../ast/extract-metadata";
import { writeFormattedFile } from "../helper/writer";

export async function generateQueries(
  astObj: ClassDetails[],
  folderName: string,
  clientName: string
) {
  // Generate Types
  if (astObj.length > 0) {
    let content = "";

    // Generate Queries
    content += astObj
      .map((classDetail) => {
        return classDetail.methods
          .filter((method) => method.methodType === "GET")
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            const methodName = method.name.replace("get", "");

            return `const {
              get${className}${methodName}Data,
              get${className}${methodName}Refetch,
              get${className}${methodName}IsLoading,
              get${className}${methodName}IsFetching
            } = useGet${className}${methodName}()();
            `;
          })
          .join("\n");
      })
      .join(`\n // ${clientName.split(".")[0].charAt(0).toUpperCase() + clientName.split(".")[0].slice(1)}\n`);

    // Generate File
    await writeFormattedFile(
      folderName,
      `${clientName.split(".")[0]}-queries.ts`,
      content
    );
  }
}
