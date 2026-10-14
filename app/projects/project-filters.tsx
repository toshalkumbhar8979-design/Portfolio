"use client";

import type { Project } from "contentlayer/generated";
import { useMemo, useState } from "react";
import { Card } from "../components/card";
import { Article } from "./article";

type ProjectSummary = Pick<
	Project,
	"category" | "date" | "description" | "slug" | "status" | "tags" | "title"
>;

type Props = {
	projects: ProjectSummary[];
	featured: ProjectSummary;
	topProjects: ProjectSummary[];
};

export function ProjectFilters({ projects, featured, topProjects }: Props) {
	const [activeTag, setActiveTag] = useState("All");
	const tags = useMemo(
		() =>
			projects
				.flatMap((project) => project.tags ?? [])
				.filter((tag, index, allTags) => allTags.indexOf(tag) === index)
				.sort(),
		[projects],
	);
	const filteredProjects =
		activeTag === "All"
			? projects
			: projects.filter((project) => project.tags?.includes(activeTag));
	const visibleFilteredProjects = filteredProjects.filter(
		(project) => !project.slug.startsWith("cert-"),
	);
	const featuredSlugs = [featured.slug, ...topProjects.map((project) => project.slug)];
	const remainingProjects = projects.filter(
		(project) =>
			!featuredSlugs.includes(project.slug) &&
			!project.slug.startsWith("cert-") &&
			project.category !== "Industry - Academic Project",
	);
	const academicProjects = projects.filter(
		(project) => project.category === "Industry - Academic Project",
	);

	return (
		<section aria-label="Filter projects">
			<div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
				<p className="text-sm text-zinc-400 font-sans">Filter by area</p>
				<p className="text-sm text-zinc-400" aria-live="polite">
					{filteredProjects.length}{" "}
					{filteredProjects.length === 1 ? "project" : "projects"}
				</p>
			</div>
			<div
				className="flex flex-wrap gap-2 mt-5"
				role="group"
				aria-label="Filter projects by area"
			>
				{["All", ...tags].map((tag) => (
					<button
						key={tag}
						type="button"
						onClick={() => setActiveTag(tag)}
						aria-pressed={activeTag === tag}
						className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
							activeTag === tag
								? "border-zinc-200 bg-zinc-100 text-zinc-900"
								: "border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white"
						}`}
					>
						{tag}
					</button>
				))}
			</div>

			{activeTag === "All" ? (
				<>
					<div className="grid grid-cols-1 gap-8 mt-8 mx-auto lg:grid-cols-2">
						<Card>
							<Article project={featured} prominent />
						</Card>
						<div className="flex flex-col w-full gap-8 mx-auto">
							{topProjects.map((project) => (
								<Card key={project.slug}>
									<Article project={project} />
								</Card>
							))}
						</div>
					</div>

					{remainingProjects.length > 0 && (
						<div className="grid grid-cols-1 gap-4 mt-8 mx-auto lg:mx-0 md:grid-cols-3">
							{[0, 1, 2].map((column) => (
								<div key={column} className="grid grid-cols-1 gap-4">
									{remainingProjects
										.filter((_, index) => index % 3 === column)
										.map((project) => (
											<Card key={project.slug}>
												<Article project={project} />
											</Card>
										))}
								</div>
							))}
						</div>
					)}

					{academicProjects.length > 0 && (
						<>
							<div className="w-full h-px mt-8 bg-zinc-800" />
							<h3 className="mt-8 text-2xl font-bold tracking-tight text-zinc-100 font-display">
								Industry - Academic Project
							</h3>
							<div className="grid grid-cols-1 gap-4 mt-4 mx-auto md:grid-cols-3">
								{academicProjects.map((project) => (
									<Card key={project.slug}>
										<Article project={project} />
									</Card>
								))}
							</div>
						</>
					)}
				</>
			) : visibleFilteredProjects.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
					{visibleFilteredProjects.map((project) => (
						<Card key={project.slug}>
							<Article project={project} />
						</Card>
					))}
				</div>
			) : (
				<p className="mt-6 rounded-xl border border-zinc-700 p-6 text-zinc-300" role="status">
					No projects match this filter.
				</p>
			)}
		</section>
	);
}
