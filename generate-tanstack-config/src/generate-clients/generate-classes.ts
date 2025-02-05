import {
  extractClassDetails,
} from "../ast/extract-metadata";
import { generateMethods } from "./generate-methods";
import { generateParamsInterfaces } from "./generate-params-interfaces";

export function generateClasses(fileContent: string): string {
  let content = `
    import axios from "axios";
    import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
  `;
  const astObject = extractClassDetails(fileContent);
  for (const classInfo of Object.values(astObject)) {
    let classContent = `
        export class ${classInfo.className} {
            protected instance: AxiosInstance;
            protected baseUrl: string;

            constructor(baseUrl?: string, instance?: AxiosInstance) {
                this.instance = instance || axios.create();

                this.baseUrl = baseUrl ?? "";
            }
            
            ${generateMethods(classInfo.methods, classInfo.className)}
        }
        ${generateParamsInterfaces(classInfo.methods, classInfo.className)}
    `;
    content += classContent;
  }

  return content;
}
