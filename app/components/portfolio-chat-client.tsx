"use client";

import { ArrowUpRight, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type SearchResult = {
	slug: string;
	title: string;
	excerpt: string;
};

type PortfolioAnswer = {
	message: string;
	results: SearchResult[];
};

function isSearchResult(value: unknown): value is SearchResult {
	return typeof value === "object" &&
		value !== null &&
		"slug" in value &&
		typeof value.slug === "string" &&
		"title" in value &&
		typeof value.title === "string" &&
		"excerpt" in value &&
		typeof value.excerpt === "string";
}

type ChatMessage = {
	id: number;
	role: "user" | "assistant";
	text: string;
	results?: SearchResult[];
	isThinking?: boolean;
	isError?: boolean;
};

function isPortfolioAnswer(value: unknown): value is PortfolioAnswer {
	if (typeof value !== "object" || value === null) return false;
	if (!("message" in value) || typeof value.message !== "string") return false;
	if (!("results" in value) || !Array.isArray(value.results)) return false;

	return value.results.every(isSearchResult);
}

export function PortfolioChatClient() {
	const [isOpen, setIsOpen] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const [question, setQuestion] = useState("");
	const pathname = usePathname();
	const isHomePage = pathname === "/";
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: 0,
			role: "assistant",
			text: "Ask about my projects, skills, or experience. I’ll search the portfolio and show the matching details.",
		},
	]);
	const inputRef = useRef<HTMLInputElement>(null);
	const messageListRef = useRef<HTMLDivElement>(null);
	const positionClass = isHomePage
		? "left-36 top-14 sm:left-[9.5rem] sm:top-14"
		: "bottom-5 right-5 sm:bottom-8 sm:right-8";

	useEffect(() => {
		if (isOpen) inputRef.current?.focus();
	}, [isOpen]);

	useEffect(() => {
		messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: "smooth" });
	}, [messages, isOpen]);

	async function sendQuestion(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const text = question.trim();
		if (!text || isThinking) return;

		const nextId = messages.length;

		setMessages((current) => [
			...current,
			{ id: nextId, role: "user", text },
			{
				id: nextId + 1,
				role: "assistant",
				text: "Thinking...",
				isThinking: true,
			},
		]);
		setQuestion("");
		setIsThinking(true);
		window.dispatchEvent(new CustomEvent("portfolio-chat-thinking", { detail: true }));

		const startedAt = Date.now();
		try {
			const response = await fetch("/api/portfolio-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: text }),
			});
			if (!response.ok) throw new Error(`Portfolio model returned HTTP ${response.status}.`);

			const payload: unknown = await response.json();
			if (!isPortfolioAnswer(payload)) throw new Error("Portfolio model returned an invalid response.");

			const remainingThinkingTime = 350 - (Date.now() - startedAt);
			if (remainingThinkingTime > 0) {
				await new Promise((resolve) => window.setTimeout(resolve, remainingThinkingTime));
			}
			setMessages((current) => current.map((message) => message.id === nextId + 1
				? {
					...message,
					text: payload.message,
					results: payload.results,
					isThinking: false,
				}
				: message));
		} catch (error) {
			console.error("Portfolio model request failed:", error);
			setMessages((current) => current.map((message) => message.id === nextId + 1
				? {
					...message,
					text: "I couldn’t reach the portfolio model. Please try again.",
					isThinking: false,
					isError: true,
				}
				: message));
		} finally {
			setIsThinking(false);
			window.dispatchEvent(new CustomEvent("portfolio-chat-thinking", { detail: false }));
		}
	}

	return (
		<div className={`fixed z-50 ${positionClass}`}>
			{isOpen ? (
				<section
					role="region"
					aria-label="Portfolio Q and A"
					className={`flex w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950/95 text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur ${
						isHomePage ? "max-h-[calc(100dvh-12rem)]" : "max-h-[min(72vh,38rem)]"
					}`}
				>
					<header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
						<div className="flex items-center gap-3">
							<CrtAvatar />
							<div>
								<h2 className="text-sm font-semibold text-zinc-100">Ask about my portfolio</h2>
								<p className="mt-0.5 text-xs text-zinc-500">Answers are found in this site</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
							aria-label="Close portfolio chat"
						>
							<X size={18} />
						</button>
					</header>

					<div
						ref={messageListRef}
						aria-live="polite"
						aria-busy={isThinking}
						className="flex min-h-28 max-h-[calc(72vh-8rem)] flex-col gap-3 overflow-y-auto p-4"
					>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex max-w-[96%] items-start gap-2 ${
									message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
								}`}
							>
								{message.role === "assistant" && <CrtAvatar thinking={message.isThinking} />}
								<div
									className={`min-w-0 rounded-lg px-3 py-2 text-sm leading-6 ${
										message.role === "user"
											? "bg-zinc-800 text-zinc-100"
											: message.isError
												? "bg-rose-950/60 text-rose-200"
												: "bg-zinc-900 text-zinc-300"
									}`}
								>
									<p>{message.text}</p>
									{message.results?.map((result) => (
										<article key={`${message.id}-${result.slug}`} className="mt-3 border-t border-zinc-700 pt-2">
											<Link
												href={`/projects/${result.slug}`}
												className="inline-flex items-center gap-1 font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-200"
											>
												{result.title}
												<ArrowUpRight size={14} aria-hidden="true" />
											</Link>
											<p className="mt-1 text-xs leading-5 text-zinc-400">{result.excerpt}</p>
										</article>
									))}
								</div>
							</div>
						))}
					</div>

					<form onSubmit={sendQuestion} className="flex items-center gap-2 border-t border-zinc-800 p-3">
						<input
							ref={inputRef}
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
							disabled={isThinking}
							maxLength={400}
							placeholder="Ask about projects or skills..."
							aria-label="Ask a question about the portfolio"
							className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
						/>
						<button
							type="submit"
							disabled={!question.trim() || isThinking}
							className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-200 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-zinc-400"
							aria-label="Search portfolio"
						>
							<Send size={18} />
						</button>
					</form>
				</section>
			) : (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					aria-expanded={false}
					aria-label="Open portfolio Q and A"
					className={`relative flex w-max max-w-[calc(100vw-9rem)] items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-center text-xs font-medium leading-4 text-zinc-200 shadow-lg shadow-black/30 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:border-y-[0.45rem] before:border-y-transparent before:border-r-[0.55rem] before:border-r-zinc-700 before:content-[''] after:absolute after:-left-[0.35rem] after:top-1/2 after:-translate-y-1/2 after:border-y-[0.35rem] after:border-y-transparent after:border-r-[0.45rem] after:border-r-zinc-950 after:content-[''] ${
						isHomePage ? "min-h-11" : ""
					}`}
				>
					<span>Ask me anything</span>
				</button>
			)}
		</div>
	);
}

function CrtAvatar({ thinking = false }: { thinking?: boolean }) {
	return (
		<span
			aria-hidden="true"
			className={`relative mt-0.5 h-7 w-7 shrink-0 rounded-full border border-zinc-700 bg-zinc-900 bg-no-repeat ${
				thinking ? "animate-pulse" : ""
			}`}
			style={{
				backgroundImage: "url('/mascots/crt-reactions.webp')",
				backgroundSize: "300% 300%",
				backgroundPosition: thinking ? "50% 100%" : "0% 0%",
			}}
		/>
	);
}
