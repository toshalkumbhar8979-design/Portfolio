import { notFound } from "next/navigation";
import { allProjects } from "contentlayer/generated";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";

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
    <div className="bg-zinc-50 min-h-screen">
      <Header project={project} />
      <ReportView slug={project.slug} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <Mdx raw={project.body.raw} />
      </article>
    </div>
  );
}
