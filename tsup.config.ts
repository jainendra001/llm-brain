import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", "bin/llm-brain": "bin/llm-brain.ts" },
  format: ["esm"],
  target: "es2022",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
