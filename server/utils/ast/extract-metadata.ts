export interface ParamDetails {
  paramName: string;
  paramType: string;
}
export interface MethodDetails {
  name: string;
  params: ParamDetails[];
  returnType: string;
  methodType: string;
  url: string;
}

export interface ClassDetails {
  className: string;
  methods: MethodDetails[];
}

export interface InterfaceDetails {
  interfaceName: string;
  code: string;
  attributes: AttributeDetails[];
}

export interface AttributeDetails {
  name: string;
  type: string;
  isReadonly: boolean;
}

export interface EnumDetails {
  name: string;
  code: string;
  values: string[];
}

import { createRequire } from "module";

export function extractClassDetails(fileContent: string): ClassDetails[] {
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  const sourceFile = ts.createSourceFile(
    "source.ts",
    fileContent,
    ts.ScriptTarget.Latest
  );

  const classes: ClassDetails[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      const className = node.name?.text || "";
      //   console.log(`Found class: ${className}`);

      const methods: MethodDetails[] = [];

      // Extracting methods
      ts.forEachChild(node, (classNode) => {
        if (ts.isMethodDeclaration(classNode)) {
          const methodName = classNode.name.getText(sourceFile);
          const params: { paramName: string; paramType: string }[] =
            classNode.parameters.map((param) => {
              return {
                paramName: param.name.getText(sourceFile),
                paramType: param.type?.getText(sourceFile) || "unknown",
              };
            });

          const returnType = classNode.type
            ? classNode.type.getText(sourceFile)
            : "void";

          // Extract method type from the method body
          let methodType = "Unknown";
          if (classNode.body) {
            const bodyText = classNode.body.getFullText(sourceFile);
            const methodMatch = bodyText.match(
              /method:\s*["'](GET|POST|PUT|DELETE|PATCH)["']/i
            );
            if (methodMatch) {
              methodType = methodMatch[1];
            }
          }

          // Extract url from the method body in :  let url_ = this.baseUrl + "/api/Remittance/TransferableCurrency/Delete?";
          let url = "";
          if (classNode.body) {
            const bodyText = classNode.body.getFullText(sourceFile);
            const urlMatch = bodyText.match(
              /let url_ = this.baseUrl \+ "(.+)"/
            );
            url = urlMatch ? urlMatch[1] : "";
          }

          methods.push({
            name: methodName,
            params,
            returnType,
            methodType,
            url,
          });
        }
      });

      classes.push({ className, methods });
    }
  });

  return classes;
}

export function extractInterfaceDetails(
  fileContent: string
): InterfaceDetails[] {
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  const sourceFile = ts.createSourceFile(
    "source.ts",
    fileContent,
    ts.ScriptTarget.Latest
  );

  const interfaces: InterfaceDetails[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name?.text || "";
      const attributes: AttributeDetails[] = [];

      ts.forEachChild(node, (interfaceNode) => {
        if (ts.isPropertySignature(interfaceNode)) {
          const attributeName = interfaceNode.name.getText(sourceFile);
          const attributeType =
            interfaceNode.type?.getText(sourceFile) || "unknown";
          attributes.push({
            name: attributeName,
            type: attributeType,
            isReadonly:
              interfaceNode.modifiers?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.ReadonlyKeyword
              ) || false,
          });
        }
      });

      interfaces.push({
        interfaceName,
        attributes,
        code: node.getFullText(sourceFile),
      });
    }
  });

  return interfaces;
}

export function extractEnumDetails(fileContent: string): EnumDetails[] {
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  const sourceFile = ts.createSourceFile(
    "source.ts",
    fileContent,
    ts.ScriptTarget.Latest
  );

  const enums: EnumDetails[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isEnumDeclaration(node)) {
      const enumName = node.name?.text || "";
      const enumValues = node.members.map((member) =>
        member.name.getText(sourceFile)
      );

      enums.push({
        name: enumName,
        values: enumValues,
        code: node.getFullText(sourceFile),
      });
    }
  });

  return enums;
}
