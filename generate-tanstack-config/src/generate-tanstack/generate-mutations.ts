import type {
  ClassDetails,
} from "../ast/extract-metadata";
import { writeFormattedFile } from "../helper/writer";

export async function generateMutations(
  astObj: ClassDetails[],
  folderName: string,
  clientName: string
) {
  // Generate Types
  if (astObj.length > 0) {
    let content = "";

    // Generate Mutate Queries
    content += astObj
      .map((classDetail) => {
        return classDetail.methods
          .filter((method) => method.methodType !== "GET")
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            const methodName =
              method.name.charAt(0).toUpperCase() + method.name.slice(1);

            return `const {${method.name}${className}MutateAsync:${method.name}${className},${method.name}${className}IsPending:${methodName}${className}IsLoading} 
            = use${methodName}${className}()({
                onSuccess:()=>{}
              })
            `;
          })
          .join("\n");
      })
      .join(
        `\n // ${clientName.split(".")[0].charAt(0).toUpperCase() + clientName.split(".")[0].slice(1)}\n`
      );

    // Generate File
    await writeFormattedFile(
      folderName,
      `${clientName.split(".")[0]}-mutations.ts`,
      content
    );
  }
}