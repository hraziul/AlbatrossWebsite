const STORAGE_KEY = 'albatross-sites-business';

export const COMPANY_NAME_MAX = 80;
export const BLURB_MAX = 280;

export interface BusinessInfo {
  companyName: string;
  blurb: string;
}

export function validateBusinessInfo(info: Partial<BusinessInfo>): string | null {
  const companyName = (info.companyName ?? '').trim();
  const blurb = (info.blurb ?? '').trim();
  if (!companyName) return 'Company name is required.';
  if (companyName.length > COMPANY_NAME_MAX) return `Company name must be ${COMPANY_NAME_MAX} characters or fewer.`;
  if (!blurb) return 'A short description is required.';
  if (blurb.length > BLURB_MAX) return `Description must be ${BLURB_MAX} characters or fewer.`;
  return null;
}

export function loadBusinessInfo(): BusinessInfo | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (validateBusinessInfo(parsed)) return null;
    return { companyName: String(parsed.companyName).trim(), blurb: String(parsed.blurb).trim() };
  } catch {
    return null;
  }
}

export function saveBusinessInfo(info: BusinessInfo): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

export function clearBusinessInfo(): void {
  localStorage.removeItem(STORAGE_KEY);
}
