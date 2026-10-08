/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: false,
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	productionBrowserSourceMaps: false,
	experimental: {
		mdxRs: true,
	},
};

export default nextConfig;
