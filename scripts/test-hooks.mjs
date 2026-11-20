import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, extname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const url = pathToFileURL(join(root, "src", `${specifier.slice(2)}.ts`)).href;
    return { url, shortCircuit: true, format: "module-typescript" };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !extname(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      return nextResolve(specifier, context);
    }
  }
  return nextResolve(specifier, context);
}
