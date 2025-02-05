import type { InterfaceDetails } from "../ast/extract-metadata";

export function generateInterfaces(interfaces: InterfaceDetails[]) {
  let content = "";

  interfaces.map((interfaceInfo) => {
    let interfaceContent = `export interface ${interfaceInfo.interfaceName} {
        ${interfaceInfo.attributes
          .map(
            (attribute) =>
              `${attribute.isReadonly ? "readonly" : ""} ${attribute.name}${checkIfNullable(attribute.type)}: ${attribute.type.replace(/\|\s*(undefined|null)/g, "")}`
          )
          .join(";")}
    }`;
    content += interfaceContent;
  });
  return content;
}

function checkIfNullable(type: string) {
  return type.includes("null") || type.includes("undefined") ? "?" : "";
}
