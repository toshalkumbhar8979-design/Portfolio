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
		? "left-3 top-36 sm:left-[9.5rem] sm:top-14"
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
					className={`flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[1.25rem] border border-sky-900 bg-[#111820] p-1 font-mono text-sky-100 shadow-[0_0_0_1px_#05080c,0_0_24px_rgba(56,189,248,0.16)] sm:w-[min(22rem,calc(100vw-2.5rem))] ${
						isHomePage ? "max-h-[calc(100dvh-12rem)]" : "max-h-[min(72vh,38rem)]"
					}`}
				>
					<header className="flex items-center justify-between rounded-t-[1rem] border-b border-sky-950 bg-[#111820] px-3 py-2.5">
						<div className="flex items-center gap-3">
							<CrtAvatar />
							<div>
								<h2 className="text-xs font-bold uppercase tracking-[0.12em] text-sky-200">Portfolio Terminal</h2>
								<p className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-sky-400">
									<span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.85)]" />
									Ready for input
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded-md p-2 text-sky-400 transition-colors hover:bg-sky-950 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
							aria-label="Close portfolio chat"
						>
							<X size={18} />
						</button>
					</header>

					<div
						ref={messageListRef}
						aria-live="polite"
						aria-busy={isThinking}
						className="crt-chat-screen flex min-h-28 max-h-[calc(72vh-8rem)] flex-col gap-3 overflow-y-auto rounded-md px-3 py-4 sm:px-4"
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
											? "border border-amber-900/70 bg-[#17140b]/90 text-amber-100"
											: message.isError
												? "border border-rose-900/70 bg-rose-950/80 text-rose-200"
												: "border border-sky-950 bg-[#071018]/80 text-sky-100 shadow-[inset_0_0_12px_rgba(56,189,248,0.045)]"
									}`}
								>
									<p>{message.text}</p>
									{message.results?.map((result) => (
										<article key={`${message.id}-${result.slug}`} className="mt-3 border-t border-sky-950 pt-2">
											<Link
												href={`/projects/${result.slug}`}
													className="inline-flex items-center gap-1 font-bold text-sky-300 underline decoration-sky-900 underline-offset-4 hover:text-sky-100 hover:decoration-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
											>
												{result.title}
												<ArrowUpRight size={14} aria-hidden="true" />
											</Link>
											{message.text !== result.excerpt && (
												<p className="mt-1 text-xs leading-5 text-sky-100/75">{result.excerpt}</p>
											)}
										</article>
									))}
								</div>
							</div>
						))}
					</div>

					<form onSubmit={sendQuestion} className="flex items-center gap-2 rounded-b-[1rem] border-t border-sky-950 bg-[#111820] p-2.5">
						<input
							ref={inputRef}
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
							disabled={isThinking}
							maxLength={400}
							placeholder="Ask about projects or skills..."
							aria-label="Ask a question about the portfolio"
							className="min-w-0 flex-1 rounded-md border border-sky-950 bg-[#050b10] px-3 py-2 text-xs text-sky-100 outline-none placeholder:text-sky-500 focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
						/>
						<button
							type="submit"
							disabled={!question.trim() || isThinking}
							className="rounded-md border border-sky-900 bg-sky-950/70 p-2 text-sky-300 transition-colors hover:bg-sky-900 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
					className={`relative flex w-max max-w-[calc(100vw-9rem)] items-center justify-center rounded-lg border border-sky-900 bg-[#071018] px-3 py-2.5 text-center font-mono text-xs font-medium leading-4 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.14)] transition-colors hover:border-sky-600 hover:text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:border-y-[0.45rem] before:border-y-transparent before:border-r-[0.55rem] before:border-r-sky-900 before:content-[''] after:absolute after:-left-[0.35rem] after:top-1/2 after:-translate-y-1/2 after:border-y-[0.35rem] after:border-y-transparent after:border-r-[0.45rem] after:border-r-[#071018] after:content-[''] ${
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
