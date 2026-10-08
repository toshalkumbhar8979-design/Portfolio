import { allProjects } from "contentlayer/generated";
import { trainPortfolioModel } from "../../../model/portfolio-model";

export const runtime = "edge";

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

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
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
