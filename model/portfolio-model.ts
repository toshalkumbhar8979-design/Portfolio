export type PortfolioDocument = {
	slug: string;
	title: string;
	description: string;
	content: string;
};

export type PortfolioMatch = {
	slug: string;
	title: string;
	excerpt: string;
};

export type PortfolioAnswer = {
	message: string;
	results: PortfolioMatch[];
};

type Passage = {
	slug: string;
	title: string;
	text: string;
	frequencies: Map<string, number>;
	weights: Map<string, number>;
	norm: number;
};

const STOP_WORDS = new Set([
	"a", "about", "an", "and", "are", "can", "did", "do", "does", "for", "from",
	"give", "he", "her", "his", "how", "i", "in", "is", "it", "me", "my", "of",
	"on", "or", "please", "tell", "that", "the", "their", "them", "there", "they",
	"this", "to", "was", "what", "when", "where", "which", "who", "why", "with",
	"you", "your",
]);

const MINIMUM_SIMILARITY = 0.16;
const MINIMUM_TERM_COVERAGE = 0.75;

function tokenize(text: string) {
	return (text.toLowerCase().match(/[a-z0-9+#.-]{2,}/g) ?? [])
		.filter((term) => !STOP_WORDS.has(term));
}

function cleanMarkdown(text: string) {
	return text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[#>*_`~-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function createPassages(project: PortfolioDocument) {
	const excerpts = [project.description];
	let heading = project.title;

	for (const block of project.content.split(/\n\s*\n/)) {
		if (/^#{1,6}\s/.test(block)) {
			heading = cleanMarkdown(block);
			continue;
		}

		const lines = block.split("\n").filter((line) => line.trim());
		const isList = lines.length > 1 && lines.every((line) => /^\s*[*+-]\s/.test(line));
		for (const line of isList ? lines : [block]) {
			const cleaned = cleanMarkdown(line);
			if (cleaned) excerpts.push(`${heading}: ${cleaned}`);
		}
	}

	return excerpts.map((text) => ({
		slug: project.slug,
		title: project.title,
		text,
		frequencies: new Map<string, number>(),
		weights: new Map<string, number>(),
		norm: 0,
	}));
}

export function trainPortfolioModel(projects: PortfolioDocument[]) {
	const passages = projects.flatMap(createPassages);
	const documentFrequency = new Map<string, number>();

	for (const passage of passages) {
		for (const term of Array.from(new Set(tokenize(passage.text)))) {
			documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
		}
		passage.frequencies = new Map();
		for (const term of tokenize(passage.text)) {
			passage.frequencies.set(term, (passage.frequencies.get(term) ?? 0) + 1);
		}
	}

	for (const passage of passages) {
		let squaredNorm = 0;
		for (const [term, count] of Array.from(passage.frequencies.entries())) {
			const inverseDocumentFrequency =
				1 + Math.log((1 + passages.length) / (1 + (documentFrequency.get(term) ?? 0)));
			const weight = (1 + Math.log(count)) * inverseDocumentFrequency;
			passage.weights.set(term, weight);
			squaredNorm += weight * weight;
		}
		passage.norm = Math.sqrt(squaredNorm);
	}

	return {
		answer(question: string): PortfolioAnswer {
			const terms = tokenize(question);
			const knownTerms = Array.from(new Set(terms))
				.filter((term) => documentFrequency.has(term));

			if (!knownTerms.length) {
				return {
					message: "I couldn’t find a relevant match in the portfolio. Try asking about a project, skill, or technology.",
					results: [],
				};
			}

			const queryWeights = new Map<string, number>();
			let querySquaredNorm = 0;
			for (const term of knownTerms) {
				const weight = 1 + Math.log((1 + passages.length) / (1 + (documentFrequency.get(term) ?? 0)));
				queryWeights.set(term, weight);
				querySquaredNorm += weight * weight;
			}
			const queryNorm = Math.sqrt(querySquaredNorm);
			const bestByProject = new Map<string, { passage: Passage; score: number }>();

			for (const passage of passages) {
				let dotProduct = 0;
				let matchedTerms = 0;
				for (const [term, queryWeight] of Array.from(queryWeights.entries())) {
					const passageWeight = passage.weights.get(term);
					if (passageWeight !== undefined) {
						dotProduct += passageWeight * queryWeight;
						matchedTerms += 1;
					}
				}

				const score = passage.norm && queryNorm ? dotProduct / (passage.norm * queryNorm) : 0;
				if (
					matchedTerms < Math.ceil(knownTerms.length * MINIMUM_TERM_COVERAGE) ||
					score < MINIMUM_SIMILARITY
				) continue;

				const existing = bestByProject.get(passage.slug);
				if (!existing || score > existing.score) {
					bestByProject.set(passage.slug, { passage, score });
				}
			}

			const results = Array.from(bestByProject.values())
				.sort((a, b) => b.score - a.score)
				.slice(0, 4)
				.map(({ passage }) => ({
					slug: passage.slug,
					title: passage.title,
					excerpt: passage.text.length > 360
						? `${passage.text.slice(0, 357)}...`
						: passage.text,
				}));

			return {
				message: results.length
					? "Here’s what I found in the portfolio:"
					: "I couldn’t find a relevant match in the portfolio. Try asking about a project, skill, or technology.",
				results,
			};
		},
	};
}
