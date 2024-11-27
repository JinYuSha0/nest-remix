import * as path from "path";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  // nest-react-router
  {
    input: path.resolve(__dirname, "src/index.ts"),
    output: {
      file: path.resolve(__dirname, "packages/nest-react-router/server.js"),
      format: "cjs",
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript()],
    external: (id) => /node_modules/.test(id),
  },
  {
    input: path.resolve(__dirname, "src/client/index.ts"),
    output: {
      file: path.resolve(__dirname, "packages/nest-react-router/client.mjs"),
      format: "esm",
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript()],
    external: (id) => /node_modules/.test(id),
  },
  // nestjs-remix
  {
    input: path.resolve(__dirname, "src/index.ts"),
    output: {
      file: path.resolve(__dirname, "packages/nestjs-remix/server.js"),
      format: "cjs",
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript()],
    external: (id) => /node_modules/.test(id),
  },
  {
    input: path.resolve(__dirname, "src/client/index.ts"),
    output: {
      file: path.resolve(__dirname, "packages/nestjs-remix/client.mjs"),
      format: "esm",
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript()],
    external: (id) => /node_modules/.test(id),
  },
];
