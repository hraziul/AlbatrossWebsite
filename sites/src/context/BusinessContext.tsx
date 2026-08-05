import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  loadBusinessInfo,
  saveBusinessInfo,
  clearBusinessInfo,
  validateBusinessInfo,
  type BusinessInfo,
} from '../lib/businessStorage';
import { fetchPersonalizedCopy } from '../lib/personalizeApi';
import type { TemplateId, TemplateCopy } from '../lib/copySchemas';

type GenerationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; copy: TemplateCopy }
  | { status: 'error'; message: string };

interface BusinessContextValue {
  business: BusinessInfo | null;
  setBusiness: (info: BusinessInfo) => string | null;
  reset: () => void;
  getGeneration: (templateId: TemplateId) => GenerationState;
  ensureGenerated: (templateId: TemplateId) => void;
  retry: (templateId: TemplateId) => void;
  /** True while any template is currently generating — read by the global
   * WebGL layer (mounted once at the app root, outside any single demo
   * page) so it can react to personalization state regardless of which
   * route is active. Purely derived from `generations`; does not affect
   * the generation logic itself. */
  isAnyGenerating: boolean;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusinessState] = useState<BusinessInfo | null>(() => loadBusinessInfo());
  const [generations, setGenerations] = useState<Partial<Record<TemplateId, GenerationState>>>({});

  // Bumped every time the business identity changes (setBusiness or reset).
  // runGeneration captures the value at call time and checks it hasn't moved
  // on before writing its result — this discards results from a business
  // identity the user has already navigated away from (e.g. Reset clicked
  // while a generation is still in flight).
  const identityRef = useRef(0);

  const runGeneration = useCallback((templateId: TemplateId, info: BusinessInfo) => {
    const generation = identityRef.current;
    setGenerations((prev) => ({ ...prev, [templateId]: { status: 'loading' } }));
    fetchPersonalizedCopy(templateId, info)
      .then((copy) => {
        if (identityRef.current !== generation) return; // stale — business identity changed since this started
        setGenerations((prev) => ({ ...prev, [templateId]: { status: 'ready', copy } }));
      })
      .catch((err: Error) => {
        if (identityRef.current !== generation) return; // stale — business identity changed since this started
        setGenerations((prev) => ({ ...prev, [templateId]: { status: 'error', message: err.message } }));
      });
  }, []);

  const setBusiness = useCallback((info: BusinessInfo) => {
    const error = validateBusinessInfo(info);
    if (error) return error;
    const trimmed = { companyName: info.companyName.trim(), blurb: info.blurb.trim() };
    saveBusinessInfo(trimmed);
    identityRef.current += 1;
    setBusinessState(trimmed);
    setGenerations({}); // business identity changed — invalidate all cached copy
    return null;
  }, []);

  const reset = useCallback(() => {
    clearBusinessInfo();
    identityRef.current += 1;
    setBusinessState(null);
    setGenerations({});
  }, []);

  const getGeneration = useCallback(
    (templateId: TemplateId): GenerationState => generations[templateId] ?? { status: 'idle' },
    [generations],
  );

  const ensureGenerated = useCallback(
    (templateId: TemplateId) => {
      if (!business) return;
      if (generations[templateId]) return; // already loading, ready, or errored — don't refetch
      runGeneration(templateId, business);
    },
    [business, generations, runGeneration],
  );

  const retry = useCallback(
    (templateId: TemplateId) => {
      if (!business) return;
      runGeneration(templateId, business);
    },
    [business, runGeneration],
  );

  const isAnyGenerating = useMemo(
    () => Object.values(generations).some((g) => g?.status === 'loading'),
    [generations],
  );

  const value = useMemo<BusinessContextValue>(
    () => ({ business, setBusiness, reset, getGeneration, ensureGenerated, retry, isAnyGenerating }),
    [business, setBusiness, reset, getGeneration, ensureGenerated, retry, isAnyGenerating],
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within a BusinessProvider');
  return ctx;
}
