import type { MethodDetails } from "../ast/extract-metadata";
import { getFirstLetterUpperCase } from "../helper/helper";

export function generateParamsInterfaces(
  methods: MethodDetails[],
  className: string
) {
  return methods
    .map((method) => {
      if (method.methodType === "GET" || method.methodType === "DELETE") {
        return `
            export interface I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Params {
                ${method.params
                  .filter(
                    (param) =>
                      !["branchIdHeader", "signal"].includes(param.paramName)
                  )
                  .map(
                    (param) =>
                      `${param.paramName}${checkIfParamNullable(param.paramType)}: ${param.paramType.replace("| undefined", "")}`
                  )
                  .join(", ")}
            }
        `;
      } else if (!method.params.some((param) => param.paramName === "body")) {
        return `
            export interface I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Dto {
                ${method.params
                  .filter(
                    (param) =>
                      !["branchIdHeader", "signal"].includes(param.paramName)
                  )
                  .map(
                    (param) =>
                      `${param.paramName}${checkIfParamNullable(param.paramType)}: ${param.paramType.replace("| undefined", "")}`
                  )
                  .join(", ")}
            }
        `;
      }
    })
    .join("\n");
}

function checkIfParamNullable(paramType: string) {
  return paramType.includes("undefined") ? "?" : "";
}
