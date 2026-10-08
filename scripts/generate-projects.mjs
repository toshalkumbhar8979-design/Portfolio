import { readdir, readFile, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const rootDirectory = process.cwd();
const projectDirectory = path.join(rootDirectory, "content", "projects");
const generatedDirectory = path.join(rootDirectory, "generated");

function readProject(source, filename) {
	const normalizedSource = source.replace(/\r\n/g, "\n");
	if (!normalizedSource.startsWith("---\n")) {
		throw new Error(`${filename} must begin with YAML frontmatter.`);
	}

	const closingDelimiter = normalizedSource.indexOf("\n---", 4);
	if (closingDelimiter < 0) {
		throw new Error(`${filename} has no closing frontmatter delimiter.`);
	}

	const metadata = parse(normalizedSource.slice(4, closingDelimiter));
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
		throw new Error(`${filename} frontmatter must be a YAML object.`);
	}
	if (typeof metadata.title !== "string" || typeof metadata.description !== "string") {
		throw new Error(`${filename} must define string title and description fields.`);
	}

	const date = metadata.date === undefined
		? undefined
		: new Date(metadata.date).toISOString();
	const optionalFields = ["category", "url", "repository"];
	const project = {
		slug: path.basename(filename, ".mdx"),
		title: metadata.title,
		description: metadata.description,
		published: metadata.published === true,
		body: { raw: normalizedSource.slice(closingDelimiter + 4).replace(/^\n/, "") },
	};

	if (date) project.date = date;
	for (const field of optionalFields) {
		if (metadata[field] !== undefined) {
			if (typeof metadata[field] !== "string") {
				throw new Error(`${filename} field ${field} must be a string.`);
			}
			project[field] = metadata[field];
		}
	}

	return project;
}

export async function generateProjects() {
	const filenames = (await readdir(projectDirectory))
		.filter((filename) => filename.endsWith(".mdx"))
		.sort();
	const slugs = new Set();
	const projects = [];

	for (const filename of filenames) {
		const slug = path.basename(filename, ".mdx");
		if (!/^[a-z0-9-]+$/.test(slug) || slugs.has(slug)) {
			throw new Error(`Invalid or duplicate project slug: ${slug}`);
		}
		slugs.add(slug);
		const source = await readFile(path.join(projectDirectory, filename), "utf8");
		projects.push(readProject(source, filename));
	}

	await mkdir(generatedDirectory, { recursive: true });
	const outputPath = path.join(generatedDirectory, "projects.json");
	const temporaryPath = `${outputPath}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(projects, null, 2)}\n`);
	await rename(temporaryPath, outputPath);
}

await generateProjects();
