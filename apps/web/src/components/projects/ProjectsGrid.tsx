import { ProjectCard } from './ProjectCard';
import type { ProjectWithCounts } from '@ong-chadia/shared';

interface ProjectsGridProps {
  projects: ProjectWithCounts[];
  userProjectIds?: Set<string>;
}

export function ProjectsGrid({ projects, userProjectIds }: ProjectsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isMyProject={userProjectIds?.has(project.id)}
        />
      ))}
    </div>
  );
}
