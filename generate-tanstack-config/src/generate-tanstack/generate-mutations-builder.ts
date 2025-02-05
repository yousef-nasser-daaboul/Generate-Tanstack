import type {
  ClassDetails,
  MethodDetails,
  ParamDetails,
} from "../ast/extract-metadata";
import { writeFormattedFile } from "../helper/writer";
import {
  generateClassQueryKeyName,
  generateMethodQueryKeyName,
  generateQueryPathValue,
} from "./generate-query-keys";

export async function generateMutateQueries(
  astObj: ClassDetails[],
  folderName: string,
  clientName: string
) {
  // Generate Imports
  let content = `import { useMutationBuilder } from "~base/composables/useMutationBuilder"; import {`;

  // Generate Clients
  if (astObj.length > 0) {
    content += astObj.map((obj) => generateClientObj(obj.className)).join(",");
    // content += `} from "~mig/utils/${clientName.replace(".", "/")}";`;
    content += `} from ".";`;
  }

  // Generate Types
  if (astObj.length > 0) {
    if (astObj.length > 0) {
      content += "import type {";

      const uniqueParamTypes = new Set<string>();

      astObj.map((classDetail) => {
        classDetail.methods
          .filter((method) => method.methodType !== "GET")
          .map((method) => method.params)
          .flatMap((params) =>
            params
              .filter(
                (param) => param.paramType && param.paramType !== "undefined"
              )
              .forEach((param) => uniqueParamTypes.add(param.paramType))
          );
      });
      content += Array.from(uniqueParamTypes).join(",");

      // content += `} from "~mig/utils/${clientName.replace(".", "/")}/${clientName}";`;
      content += `} from "../${clientName.replace(".", "/")}.client";`;
    }

    // Generate Query Keys
    const queryKeysName = `${clientName.split(".")[0].toUpperCase()}_QUERY_KEYS`;
    // content += `import {${queryKeysName}} from "~mig/utils/${clientName.replace(".", "/")}/${clientName.split(".")[0]}-query-keys";\n\n`;
    content += `import {${queryKeysName}} from "./${clientName.split(".")[0]}-query-keys";\n\n`;

    // Generate Mutate Queries
    content += astObj
      .map((classDetail) => {
        return classDetail.methods
          .filter((method) => method.methodType !== "GET")
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            const methodName =
              method.name.charAt(0).toUpperCase() + method.name.slice(1);
            const clientNameUpdated = clientName.split(".")[0].toUpperCase();

            return `export const use${methodName}${className} = () => 
             useMutationBuilder({
              prefix:"${method.name}${className}",
              mutationOptions: {
                mutationFn:(${generateMQueryFunctionParams(method.params)})
                    =>${generateClientObj(classDetail.className)}.${method.name}(${generateMQueryFnAssignParams(method.params)}),
              },
              keysToInvalidate:${generateMQueryPaths(classDetail, classDetail.methods, clientNameUpdated)},
            });
          `;
          })
          .join("\n");
      })
      .join("\n");

    // Generate File
    await writeFormattedFile(
      folderName,
      `useMutate${clientName.split(".")[0].charAt(0).toUpperCase() + clientName.split(".")[0].slice(1)}.ts`,
      content
    );
  }
}

export function generateMQueryPaths(
  classDetail: ClassDetails,
  methods: MethodDetails[],
  clientNameUpdated: string
) {
  const listMethods = methods.filter(
    (method) =>
      method.name.toLowerCase().includes("list") && method.methodType === "GET"
  );

  if (listMethods.length === 0) {
    return `[]`;
  }

  return `[${listMethods.map((method) => `${clientNameUpdated}_QUERY_KEYS.${generateClassQueryKeyName(classDetail)}.${generateMethodQueryKeyName(method)}`).join(",")}]`;
}

function generateMQueryFunctionParams(params: ParamDetails[]) {
  return `${params.map((param) => `${param.paramName}: ${param.paramType}`).join(",")}`;
}

function generateMQueryFnAssignParams(params: ParamDetails[]) {
  let content = "";
  if (params.length > 0) {
    content += `${params.map((param) => `${param.paramName}`).join(",")}`;
  }
  return content;
}

export function generateClientObj(className: string) {
  return className.charAt(0).toLowerCase() + className.slice(1);
}
