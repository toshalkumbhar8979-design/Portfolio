import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { generateProjects } from "./generate-projects.mjs";

const projectWatcher = watch("content/projects", { recursive: true }, (_event, filename) => {
	if (!filename?.toString().endsWith(".mdx")) return;

	clearTimeout(regenerationTimer);
	regenerationTimer = setTimeout(() => {
		generateProjects().catch((error) => {
			console.error("Failed to regenerate project content:", error);
		});
	}, 150);
});

let regenerationTimer;
const next = spawn(
	process.execPath,
	["node_modules/next/dist/bin/next", "dev", ...process.argv.slice(2)],
	{ stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => next.kill(signal));
}

next.on("exit", (code) => {
	clearTimeout(regenerationTimer);
	projectWatcher.close();
	process.exitCode = code ?? 1;
});
