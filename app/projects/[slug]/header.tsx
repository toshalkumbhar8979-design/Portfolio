"use client";
import { ArrowLeft, Github, Globe, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type Props = {
	slug: string;
	project: {
		url?: string;
		title: string;
		description: string;
		repository?: string;
	};
};
export const Header: React.FC<Props> = ({ project, slug }) => {
	const ref = useRef<HTMLElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const [isIntersecting, setIntersecting] = useState(true);
	const [isVideoOpen, setIsVideoOpen] = useState(false);
	const hasProjectVideo = slug === "imitation-learning-robotic-arm";

	const links: { label: string; href: string; icon: React.ReactNode }[] = [];
	if (project.repository) {
		links.push({
			label: "GitHub",
			href: `https://github.com/${project.repository}`,
			icon: <Github size={24} />,
		});
	}
	if (project.url) {
		links.push({
			label: "Website",
			href: project.url,
			icon: <Globe size={24} />,
		});
	}
	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry]) =>
			setIntersecting(entry.isIntersecting),
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!isVideoOpen) return;
		closeButtonRef.current?.focus();
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsVideoOpen(false);
		};
		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isVideoOpen]);

	return (
		<header
			ref={ref}
			className="relative isolate overflow-hidden bg-gradient-to-tl from-black via-zinc-900 to-black"
		>
			<div
				className={`fixed inset-x-0 top-0 z-50 backdrop-blur lg:backdrop-blur-none duration-200 border-b lg:bg-transparent ${
					isIntersecting
						? "bg-zinc-900/0 border-transparent"
						: "bg-white/10  border-zinc-200 lg:border-transparent"
				}`}
			>
				<div className="container flex flex-row-reverse items-center justify-between p-6 mx-auto">
					<div className="flex justify-between gap-8">
						<Link target="_blank" href="https://github.com/toshalkumbhar8979-design">
							<Github
								className={`w-6 h-6 duration-200 hover:font-medium ${
									isIntersecting
										? " text-zinc-400 hover:text-zinc-100"
										: "text-zinc-600 hover:text-zinc-900"
								} `}
							/>
						</Link>
					</div>

					<Link
						href="/projects"
						className={`duration-200 hover:font-medium ${
							isIntersecting
								? " text-zinc-400 hover:text-zinc-100"
								: "text-zinc-600 hover:text-zinc-900"
						} `}
					>
						<ArrowLeft className="w-6 h-6 " />
					</Link>
				</div>
			</div>
			<div className="container mx-auto relative isolate overflow-hidden  py-24 sm:py-32">
				<div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
					<div className="mx-auto max-w-2xl lg:mx-0">
						<h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
							{project.title}
						</h1>
						<p className="mt-6 text-lg leading-8 text-zinc-300 font-sans">
							{project.description}
						</p>
					</div>

					<div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
						<div className="flex flex-row items-center justify-center gap-8 text-white">
							{hasProjectVideo && (
								<button
									type="button"
									onClick={() => setIsVideoOpen(true)}
									className="flex flex-col items-center gap-2 group duration-500 hover:text-zinc-300"
									aria-haspopup="dialog"
								>
									<span className="rounded-full border border-zinc-500 p-2 transition-colors group-hover:border-zinc-200 group-focus-within:border-zinc-200">
										<svg
											width="24"
											height="24"
											viewBox="0 0 640 640"
											aria-hidden="true"
											focusable="false"
										>
											<path
												fill="currentColor"
												d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"
											/>
										</svg>
									</span>
									<span className="text-xs font-semibold tracking-wider uppercase">
										Project video
									</span>
								</button>
							)}
							{links.map((link) => (
								<Link
									target="_blank"
									key={link.label}
									href={link.href}
									className="flex flex-col items-center gap-2 group duration-500 hover:text-zinc-300"
								>
									<span className="p-2 border rounded-full border-zinc-500 group-hover:border-zinc-200">
										{link.icon}
									</span>
									<span className="text-xs font-semibold tracking-wider uppercase">
										{link.label}
									</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>

			{hasProjectVideo && isVideoOpen && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
					aria-labelledby="project-video-title"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) setIsVideoOpen(false);
					}}
				>
					<div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-600 bg-zinc-900 shadow-2xl shadow-black/50">
						<div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3 sm:px-6">
							<h2 id="project-video-title" className="font-display text-sm font-semibold text-zinc-100 sm:text-base">
								Project video
							</h2>
							<button
								ref={closeButtonRef}
								type="button"
								onClick={() => setIsVideoOpen(false)}
								className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
								aria-label="Close project video"
							>
								<X size={20} />
							</button>
						</div>
						<iframe
							className="aspect-video w-full border-0 bg-zinc-950"
							src="https://drive.google.com/file/d/1v6YYx8oilNhYG7eOzeoTNrJiH-5SRr5P/preview?autoplay=1"
							title="Imitation learning robotic arm project video"
							allow="autoplay; fullscreen"
							allowFullScreen
						/>
					</div>
				</div>
			)}
		</header>
	);
};
