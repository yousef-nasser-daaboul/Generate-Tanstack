import type { MethodDetails, ParamDetails } from "../ast/extract-metadata";
import { getFirstLetterUpperCase } from "../helper/helper";

export function generateMethods(methods: MethodDetails[], className: string) {
  return methods
    .filter((method) => !method.name.startsWith("process"))
    .map((method) => {
      if (method.methodType === "GET" || method.methodType === "DELETE") {
        return `
            ${method.name}(
                body${checkIfAllParamsNullable(method.params)}: I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Params
            ): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = addQueryParamsToUrl(url_, body);

                let options_: AxiosRequestConfig = {
                    method: "${method.methodType}",
                    url: url_,
                    headers: {
                        Accept: "text/plain",
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      } else {
        return `
            ${method.name}(${generateMutateParams(
              method.params,
              method.name,
              className
            )}): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = url_.replace(/[?&]$/, "");

                const content_ = JSON.stringify(body);

                let options_: AxiosRequestConfig = {
                    data: content_,
                    method: "${method.methodType}",
                    url: url_,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "text/plain",
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      }
    })
    .join("\n");
}

function checkIfAllParamsNullable(params: ParamDetails[]) {
  return params
    .filter((param) => !["branchIdHeader", "signal"].includes(param.paramName))
    .every((param) => param.paramType.includes("undefined"))
    ? "?"
    : "";
}

function checkIfParamNullable(paramType: string) {
  return paramType.includes("undefined") ? "?" : "";
}

function generateMutateParams(
  params: ParamDetails[],
  methodName: string,
  className: string
) {
  let content = "";
  if (params.find((param) => param.paramName === "body")) {
    content += `body${checkIfParamNullable(
      params.find((param) => param.paramName === "body")?.paramType ?? ""
    )}: ${params
      .find((param) => param.paramName === "body")
      ?.paramType?.replace("| undefined", "")}
          `;
  } else {
    content += `body${checkIfAllParamsNullable(params)}: I${className.replace("Client", "")}${getFirstLetterUpperCase(methodName)}Dto`;
  }
  return content;
}
