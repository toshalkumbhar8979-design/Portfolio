import type { Project } from "@/.contentlayer/generated";
import Link from "next/link";

type Props = {
	project: Pick<Project, "date" | "description" | "slug" | "status" | "tags" | "title">;
	prominent?: boolean;
};

export const Article: React.FC<Props> = ({ project, prominent = false }) => {
	const href = `/projects/${project.slug}`;

	return (
		<Link href={href}>
			<article className="p-4 md:p-8">
				<div className="flex justify-between gap-2 items-center">
					<span className="text-xs duration-1000 text-zinc-200 group-hover:text-white group-hover:border-zinc-200 drop-shadow-orange">
						{project.status ? (
							<span className="font-semibold tracking-wider text-emerald-300">
								{project.status}
							</span>
						) : project.date ? (
							<time dateTime={new Date(project.date).toISOString()}>
								{Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
									new Date(project.date),
								)}
							</time>
						) : (
							<span>SOON</span>
						)}
					</span>
				</div>
				<h2
					className={`z-20 font-medium duration-1000 text-zinc-200 group-hover:text-white font-display ${
						prominent ? "text-3xl sm:text-4xl" : "text-xl lg:text-3xl"
					}`}
				>
					{project.title}
				</h2>
				<p
					className={`z-20 mt-4 duration-1000 text-zinc-400 group-hover:text-zinc-200 font-sans ${
						prominent ? "text-base leading-8" : "text-sm"
					}`}
				>
					{project.description}
				</p>
				{project.tags && project.tags.length > 0 && (
					<ul className="z-20 flex flex-wrap gap-2 mt-4" aria-label="Project tags">
						{project.tags.map((tag) => (
							<li
								key={tag}
								className="px-2 py-1 text-xs border rounded-full text-zinc-300 border-zinc-700"
							>
								{tag}
							</li>
						))}
					</ul>
				)}
			</article>
		</Link>
	);
};
