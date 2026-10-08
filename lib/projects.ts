import projectData from "../generated/projects.json";

export type Project = {
	slug: string;
	title: string;
	description: string;
	published: boolean;
	category?: string;
	date?: string;
	url?: string;
	repository?: string;
	body: {
		raw: string;
	};
};

export const allProjects: Project[] = projectData;
