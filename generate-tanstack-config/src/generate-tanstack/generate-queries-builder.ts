import type { ClassDetails, ParamDetails } from "../ast/extract-metadata";
import { writeFormattedFile } from "../helper/writer";
import { generateQueryPathValue } from "./generate-query-keys";

export async function generateClientQueries(
  astObj: ClassDetails[],
  folderName: string,
  clientName: string
) {
  // Generate Imports
  let content = `import { useQueryBuilder } from "~base/composables/useQueryBuilder"; import {`;

  if (astObj.length > 0) {
    content += astObj.map((obj) => generateClientObj(obj.className)).join(",");
    // content += `} from "~mig/utils/${clientName.replace(".", "/")}";`;
    content += `} from ".";`;
  }

  if (astObj.length > 0) {
    content += "import type {";

    content += astObj
      .map((classDetail) => {
        const methodParams = classDetail.methods
          .filter((method) => method.methodType === "GET")
          .map((method) => method.params)
          .flatMap((params) => params.map((param) => param.paramType))
          .join(",");
        return methodParams;
      })
      .filter((params) => params.length > 0)
      .join(",");

      // content += `} from "~mig/utils/${clientName.replace(".", "/")}/${clientName}";`;
    content += `} from "../${clientName.replace(".", "/")}.client";`;
  }
  const queryKeysName = `${clientName.split(".")[0].toUpperCase()}_QUERY_KEYS`;
  // content += `import {${queryKeysName}} from "~mig/utils/${clientName.replace(".", "/")}/${clientName.split(".")[0]}-query-keys";\n\n`;
  content += `import {${queryKeysName}} from "./${clientName.split(".")[0]}-query-keys";\n\n`;

  // Generate Client Queries
  content += astObj
    .map((classDetail) => {
      return classDetail.methods
        .filter((method) => method.methodType === "GET")
        .map((method) => {
          const className = classDetail.className.replace("Client", "");
          const methodName = method.name.replace("get", "");
          const clientNameUpdated = clientName.split(".")[0].toUpperCase();

          return `export const useGet${className}${methodName} =
           (${generateQueryFunctionParams(method.params)}) => 
             useQueryBuilder({
              prefix:"get${className}${methodName}",
              defaultOptions: {
                queryKey:[${clientNameUpdated}_QUERY_KEYS.${generateQueryPathValue(classDetail, method)},${generateQueryKeyParams(method.params)}],
                queryFn:()=>${generateClientObj(classDetail.className)}.${method.name}(${generateQueryFnAssignParams(method.params)})
              },
            });
          `;
        })
        .join("\n");
    })
    .join("\n");

  // Generate File
  await writeFormattedFile(
    folderName,
    `useQuery${clientName.split(".")[0].charAt(0).toUpperCase() + clientName.split(".")[0].slice(1)}.ts`,
    content
  );
}

function generateQueryKeyParams(params: ParamDetails[]) {
  return params.map((param) => `${param.paramName}?.value`).join(",");
}
function generateQueryFunctionParams(params: ParamDetails[]) {
  return `${params.map((param) => `${param.paramName}: Ref<${param.paramType}>`).join(",")}`;
}

function generateQueryFnAssignParams(params: ParamDetails[]) {
  let content = "";
  if (params.length > 0) {
    content += `{${params.map((param) => `...${param.paramName}.value`).join(",")}}`;
  }
  return content;
}

export function generateClientObj(className: string) {
  return className.charAt(0).toLowerCase() + className.slice(1);
}
