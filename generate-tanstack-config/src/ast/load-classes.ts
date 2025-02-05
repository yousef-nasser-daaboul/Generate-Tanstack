import * as path from "path";

export async function readClassesFromFile(filePath: string): Promise<any[]> {
  const absolutePath = path.resolve(filePath);

  // Dynamically import the file as a module
  const module = await import(absolutePath);

  // Extract exported classes
  return Object.values(module).filter((exported) => typeof exported === "function");
}
