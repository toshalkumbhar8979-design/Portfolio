import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
	// `@upstash/redis` depends on `uncrypto`, which ships code for the "workerd"
	// build condition (`dist/crypto.web.mjs`) that Next.js does not trace. This
	// makes the worker bundling fail with: Could not resolve "uncrypto".
	// Bundling with the default (node) conditions avoids this; Node.js APIs are
	// still supported by the Workers runtime via the `nodejs_compat` flag.
	cloudflare: {
		useWorkerdCondition: false,
	},
	default: {
		override: {
			wrapper: "cloudflare-node",
			converter: "edge",
			proxyExternalRequest: "fetch",
			incrementalCache: "dummy",
			tagCache: "dummy",
			queue: "dummy",
		},
	},
	edgeExternals: ["node:crypto"],
	middleware: {
		external: true,
		override: {
			wrapper: "cloudflare-edge",
			converter: "edge",
			proxyExternalRequest: "fetch",
			incrementalCache: "dummy",
			tagCache: "dummy",
			queue: "dummy",
		},
	},
};

export default config;