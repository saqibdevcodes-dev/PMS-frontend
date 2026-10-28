import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { BrandLogo } from './BrandLogo';
import { RecordImage } from './ImageUpload';

// Use a supplied logo ID in customer views; staff may look up branding by project.
export function ProjectLogo({
  projectId,
  logoId,
  name,
  className = '',
  background = 'theme',
}: {
  projectId?: string;
  logoId?: string | null;
  name?: string;
  className?: string;
  background?: 'theme' | 'light' | 'dark';
}) {
  const branding = useQuery({
    queryKey: ['project-branding', projectId],
    enabled: Boolean(projectId) && logoId === undefined,
    queryFn: ({ signal }) =>
      api<{ name: string; logoId: string | null }>(`/projects/${projectId}/branding`, { signal }),
    staleTime: 60000,
  });
  const imageId = logoId === undefined ? branding.data?.logoId : logoId;
  const projectName = name ?? branding.data?.name ?? '';
  return (
    <span className={'project-logo ' + className} aria-busy={branding.isFetching}>
      {imageId ? (
        <RecordImage
          id={imageId}
          alt={projectName}
          className="project-logo-image"
          loading="eager"
          fallback={<span className="project-logo-name">{projectName}</span>}
        />
      ) : (
        <BrandLogo background={background} />
      )}
    </span>
  );
}
