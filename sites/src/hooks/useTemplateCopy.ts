import { useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import type { TemplateId, TemplateCopy } from '../lib/copySchemas';

export function useTemplateCopy(templateId: TemplateId, placeholder: TemplateCopy) {
  const { business, getGeneration, ensureGenerated, retry } = useBusiness();

  useEffect(() => {
    if (business) ensureGenerated(templateId);
  }, [business, templateId, ensureGenerated]);

  const generation = getGeneration(templateId);
  const copy = generation.status === 'ready' ? generation.copy : placeholder;

  return {
    copy,
    isPersonalizing: generation.status === 'loading',
    hasError: generation.status === 'error',
    errorMessage: generation.status === 'error' ? generation.message : null,
    retry: () => retry(templateId),
  };
}
