import { notFound } from "next/navigation";
import { allProjects } from "contentlayer/generated";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";
import { ProjectStickers } from "@/app/components/stickers";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const project = allProjects.find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="relative bg-zinc-50 min-h-screen">
      <ProjectStickers slug={project.slug} />
      <Header project={project} slug={project.slug} />
      <ReportView slug={project.slug} />

      {project.slug === "ember-gpu" && (
        <div className="mx-auto max-w-5xl px-4 pt-12">
          <video
            className="w-full rounded-xl border border-zinc-200 bg-black shadow-lg"
            src="/projects/ember-gpu/doom_ember.mp4"
            aria-label="EMBER GPU DOOM demo"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>
      )}

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <Mdx raw={project.body.raw} />
      </article>
    </div>
  );
}
