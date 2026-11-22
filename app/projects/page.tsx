import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { ProjectFilters } from "./project-filters";
import { FloatingStickers } from "../components/stickers";

export default async function ProjectsPage() {
  const featured = allProjects.find((project) => project.slug === "ember-gpu") || allProjects[0];
  const projects = allProjects
    .filter((project) => project.published)
    .map(({ category, date, description, slug, status, tags, title }) => ({
      date,
      description,
      slug,
      status,
      tags,
      title,
      category,
    }));
  const topProjects = ["edgeguard-5g", "riscv-doom-soc"]
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is (typeof projects)[number] => project !== undefined);
  const featuredProject = projects.find((project) => project.slug === featured.slug) ?? projects[0];

  return (
    <div className="relative pb-16">
      <FloatingStickers variant="projects" />
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <section aria-labelledby="publications-heading" className="space-y-6 md:space-y-8">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <h2
              id="publications-heading"
              className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl font-display"
            >
              Publications
            </h2>
            <p className="mt-4 text-zinc-400 font-sans">
              Peer-reviewed research and conference papers.
            </p>
          </div>
          <div className="w-full h-px bg-zinc-800" />

          <a
            href="https://doi.org/10.1109/WorldSUAS70880.2026.11767217"
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 transition-colors duration-300 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    IEEE WorldSUAS 2026
                  </p>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-zinc-500 transition-colors duration-200 group-hover:text-zinc-200"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-xl leading-snug text-zinc-100 sm:text-2xl">
                  Automated Sorting System Using Image-Based Visual Servoing (IBVS)
                </h3>
                <p className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                  <span>DOI</span>
                  <span className="normal-case tracking-normal text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
                    10.1109/WorldSUAS70880.2026.11767217
                  </span>
                </p>
              </div>
              <img
                src="/stickers/publication-sorting.png"
                alt=""
                className="h-auto w-32 shrink-0 self-center drop-shadow-[0_16px_26px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:-translate-y-1 sm:w-40"
              />
            </div>
          </a>
        </section>

        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl font-display">
            Projects
          </h2>
          <p className="mt-4 text-zinc-400 font-sans">
            Some of the projects are from work and some are on my own time.
          </p>
        </div>
        <div className="w-full h-px bg-zinc-800" />

        {featuredProject && (
          <ProjectFilters
            projects={projects}
            featured={featuredProject}
            topProjects={topProjects}
          />
        )}

      </div>
    </div>
  );
}
