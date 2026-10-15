const DEFAULT_ADMIN_EMAILS = [
  'hello@auxlo.uk',
];

type ParseOptions = {
  lowercase?: boolean;
};

function applyOptions(values: string[], options?: ParseOptions): string[] {
  if (!options?.lowercase) {
    return values;
  }

  return values.map((value) => value.toLowerCase());
}

export function parseEnvList(value?: string, options?: ParseOptions): string[] {
  if (!value) {
    return [];
  }

  const entries = value
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return applyOptions(entries, options);
}

export function getAdminEmails(options?: ParseOptions): string[] {
  const envEmails = parseEnvList(process.env.ADMIN_EMAILS, options);

  if (envEmails.length > 0) {
    return envEmails;
  }

  return applyOptions(DEFAULT_ADMIN_EMAILS, options);
}

export function getPublicAdminEmails(options?: ParseOptions): string[] {
  const publicEmails = parseEnvList(process.env.NEXT_PUBLIC_ADMIN_EMAILS, options);

  if (publicEmails.length > 0) {
    return publicEmails;
  }

  return applyOptions(DEFAULT_ADMIN_EMAILS, options);
}
