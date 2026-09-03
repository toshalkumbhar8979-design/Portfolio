import { execSync } from "node:child_process";

/**
 * Unified build entry point used by the `build` npm script.
 *
 * - Locally (`npm run build` / `pnpm build`): runs the plain Next.js build.
 * - In CI (e.g. Cloudflare Workers Builds): runs the full
 *   `opennextjs-cloudflare build` pipeline so `.open-next/worker.js` is
 *   produced and `wrangler deploy` can deploy the app.
 * - When invoked by `opennextjs-cloudflare build` itself (it internally
 *   re-runs this script via `npm run build`), only the plain Next.js build
 *   runs, avoiding infinite recursion.
 */
const isChildInvocation = process.env.OPEN_NEXT_BUILD_CHILD === "1";
const isCI = ["CI", "CF_PAGES", "CLOUDFLARE"].some((name) =>
	["1", "true", "yes"].includes(String(process.env[name])),
);

if (isChildInvocation || !isCI) {
	console.log("> next build");
	execSync("npx next build", { stdio: "inherit" });
} else {
	console.log("> opennextjs-cloudflare build");
	execSync("npx opennextjs-cloudflare build", {
		stdio: "inherit",
		env: { ...process.env, OPEN_NEXT_BUILD_CHILD: "1" },
	});
}
