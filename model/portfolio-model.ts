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
	"you", "your", "yourself",
]);

const MINIMUM_SIMILARITY = 0.16;
const GREETINGS = ["hello", "hi", "hey", "howdy"];
const GREETING_SMALL_TALK = new Set(["are", "doing", "good", "how", "morning", "today", "there", "you"]);

function tokenize(text: string) {
	return (text.toLowerCase().match(/[a-z0-9+#]{2,}/g) ?? [])
		.filter((term) => !STOP_WORDS.has(term));
}

function editDistance(left: string, right: string) {
	const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
	for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
		const current = [leftIndex];
		for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
			current[rightIndex] = Math.min(
				current[rightIndex - 1] + 1,
				previous[rightIndex] + 1,
				previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
			);
		}
		previous.splice(0, previous.length, ...current);
	}
	return previous[right.length];
}

function isGreeting(question: string) {
	const words = question.toLowerCase().match(/[a-z]+/g) ?? [];
	const [opening, ...rest] = words;
	if (!opening) return false;
	return GREETINGS.some((greeting) => editDistance(opening, greeting) <= 1) &&
		rest.every((word) => GREETING_SMALL_TALK.has(word));
}

function isAboutThePortfolioOwner(question: string) {
	const normalized = question.toLowerCase();
	return /\b(yourself|who are you|who am i talking to|who am i|what is my name|about you|about me|about yourself|about toshal|about the owner|my profile)\b/.test(normalized);
}

function cleanMarkdown(text: string) {
	return text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[#>*_`~-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function createPassages(project: PortfolioDocument) {
	const excerpts = [project.description];
	let heading = project.title;

	for (const sourceBlock of project.content.split(/\n\s*\n/)) {
		let block = sourceBlock.trim();
		const headingBlock = block.match(/^#{1,6}\s+([^\n]+)(?:\n([\s\S]*))?$/);
		if (headingBlock) {
			heading = cleanMarkdown(headingBlock[1]);
			block = headingBlock[2]?.trim() ?? "";
			if (!block) continue;
		}
		const lines = block.split("\n").filter((line) => line.trim());
		const isList = lines.length > 1 && lines.every((line) => /^\s*[*+-]\s/.test(line));
		if (isList) {
			const items = lines.map(cleanMarkdown).filter(Boolean);
			if (items.length) {
				excerpts.push(`${heading}: ${items.join("; ")}`);
				excerpts.push(...items.map((item) => `${heading}: ${item}`));
			}
		} else {
			const cleaned = cleanMarkdown(block);
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
			if (isAboutThePortfolioOwner(question)) {
				const profile = passages
					.filter((passage) => passage.slug === "resume")
					.sort((a, b) => b.text.length - a.text.length)
					.slice(0, 2);
				if (profile.length) {
					const excerpt = profile.map((passage) => passage.text).join(" ");
					return {
						message: "I’m a portfolio assistant for Toshal Kumbhar. Here’s a short profile from his resume:",
						results: [{
							slug: profile[0].slug,
							title: profile[0].title,
							excerpt: excerpt.length > 600
								? `${excerpt.slice(0, 597)}...`
								: excerpt,
						}],
					};
				}
			}

			if (isGreeting(question)) {
				return {
					message: "Hi! I’m Toshal’s portfolio assistant. Ask me about his projects, skills, or experience.",
					results: [],
				};
			}

			const terms = tokenize(question);
			const knownTerms = Array.from(new Set(terms))
				.filter((term) => documentFrequency.has(term));

			if (!knownTerms.length) {
				return {
					message: "I’m a portfolio-only assistant, so I can answer questions about Toshal’s projects, skills, and experience. I couldn’t find information about that here.",
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
				if (matchedTerms === 0 || score < MINIMUM_SIMILARITY) continue;

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
					: "I’m a portfolio-only assistant, so I can answer questions about Toshal’s projects, skills, and experience. I couldn’t find information about that here.",
				results,
			};
		},
	};
}
