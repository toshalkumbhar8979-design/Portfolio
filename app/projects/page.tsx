import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { ProjectFilters } from "./project-filters";

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
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
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
