"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type NavigationProps = {
	showCredits?: boolean;
};

export const Navigation: React.FC<NavigationProps> = ({ showCredits = false }) => {
	const ref = useRef<HTMLElement>(null);
	const creditsRef = useRef<HTMLDivElement>(null);
	const [isIntersecting, setIntersecting] = useState(true);
	const [creditsOpen, setCreditsOpen] = useState(false);

	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry]) =>
			setIntersecting(entry.isIntersecting),
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!creditsOpen) return;

		function closeCredits(event: MouseEvent) {
			if (!creditsRef.current?.contains(event.target as Node)) {
				setCreditsOpen(false);
			}
		}

		document.addEventListener("mousedown", closeCredits);
		return () => document.removeEventListener("mousedown", closeCredits);
	}, [creditsOpen]);

	return (
		<header ref={ref}>
			<div
				className={`fixed inset-x-0 top-0 z-50 backdrop-blur  duration-200 border-b  ${
					isIntersecting
						? "bg-zinc-900/0 border-transparent"
						: "bg-zinc-900/500  border-zinc-800 "
				}`}
			>
				<div className="container flex flex-row-reverse items-center justify-between p-6 mx-auto">
					<div className="flex justify-between gap-8">
						<Link
							href="/projects"
							className="duration-200 text-zinc-400 hover:text-zinc-100"
						>
							Projects
						</Link>
						<Link
							href="/contact"
							className="duration-200 text-zinc-400 hover:text-zinc-100"
						>
							Contact
						</Link>
						{showCredits && (
							<div ref={creditsRef} className="relative">
								<button
									type="button"
									aria-expanded={creditsOpen}
									aria-controls="credits-popover"
									onClick={() => setCreditsOpen((open) => !open)}
									className="duration-200 text-zinc-400 hover:text-zinc-100"
								>
									Credits
								</button>
								{creditsOpen && (
									<div
										id="credits-popover"
										role="dialog"
										aria-label="Template credits"
										className="absolute right-0 top-full z-50 mt-3 w-64 border border-zinc-700 bg-zinc-950/95 p-4 text-sm text-zinc-300 shadow-xl backdrop-blur"
									>
										<p>
											This portfolio is based on the{" "}
											<Link
												href="https://github.com/chronark/chronark.com"
												target="_blank"
												rel="noreferrer"
												className="text-white underline underline-offset-4 hover:text-zinc-400"
											>
												Chronark template
											</Link>
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					<Link
						href="/"
						className="duration-200 text-zinc-300 hover:text-zinc-100"
					>
						<ArrowLeft className="w-6 h-6 " />
					</Link>
				</div>
			</div>
		</header>
	);
};
