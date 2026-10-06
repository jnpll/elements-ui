import { copyFile, cp } from "node:fs/promises";

await copyFile(new URL("../src/styles.css", import.meta.url), new URL("../dist/styles.css", import.meta.url));
await cp(new URL("../src/collections", import.meta.url), new URL("../dist/collections", import.meta.url), { recursive: true });
