import { allProjects } from "@/lib/projects";
import { trainPortfolioModel } from "../../../model/portfolio-model";

const MAX_REQUEST_BODY_BYTES = 8 * 1024;

const model = trainPortfolioModel(
	allProjects
		.filter((project) => project.published)
		.map((project) => ({
			slug: project.slug,
			title: project.title,
			description: project.description,
			content: project.body.raw,
		})),
);

function isQuestionRequest(value: unknown): value is { question: string } {
	return typeof value === "object" &&
		value !== null &&
		"question" in value &&
		typeof value.question === "string";
}

function jsonResponse(body: object, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}

async function readRequestBody(request: Request) {
	const reader = request.body?.getReader();
	if (!reader) return "";

	const chunks: Uint8Array[] = [];
	let totalBytes = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			totalBytes += value.byteLength;
			if (totalBytes > MAX_REQUEST_BODY_BYTES) {
				await reader.cancel();
				return null;
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}

	const body = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(body);
}

export async function POST(request: Request) {
	const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
	if (contentType !== "application/json") {
		return jsonResponse({ error: "Content-Type must be application/json." }, 415);
	}

	const contentLength = Number(request.headers.get("content-length"));
	if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
		return jsonResponse({ error: "Request body must be 8 KB or smaller." }, 413);
	}

	let rawBody: string;
	try {
		const body = await readRequestBody(request);
		if (body === null) return jsonResponse({ error: "Request body must be 8 KB or smaller." }, 413);
		rawBody = body;
	} catch {
		return jsonResponse({ error: "Request body could not be read." }, 400);
	}

	let body: unknown;
	try {
		body = JSON.parse(rawBody);
	} catch {
		return jsonResponse({ error: "Request body must be valid JSON." }, 400);
	}

	if (!isQuestionRequest(body)) {
		return jsonResponse({ error: "A question is required." }, 400);
	}

	const question = body.question.trim();
	if (!question) return jsonResponse({ error: "A question is required." }, 400);
	if (question.length > 400) {
		return jsonResponse({ error: "Questions must be 400 characters or fewer." }, 413);
	}

	return jsonResponse(model.answer(question));
}
