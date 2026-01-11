/**
 * Supabase authentication utility for getting test account tokens.
 * Used to authenticate Chrome instances for visual verification.
 */

import { createLogger } from '@automaker/utils';

const logger = createLogger('SupabaseAuth');

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
  };
}

export interface SupabaseAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  email: string;
  password: string;
}

/**
 * Authenticate with Supabase using email/password and return session tokens.
 */
export async function getSupabaseSession(config: SupabaseAuthConfig): Promise<SupabaseSession> {
  const { supabaseUrl, supabaseAnonKey, email, password } = config;

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase auth failed: ${response.status} - ${error}`);
  }

  const session = (await response.json()) as SupabaseSession;
  logger.info(`Authenticated as ${session.user.email}`);
  return session;
}

/**
 * Generate localStorage injection script for Supabase session.
 * The key format is: sb-<project-ref>-auth-token
 */
export function generateSessionInjectionScript(
  supabaseUrl: string,
  session: SupabaseSession
): string {
  // Extract project ref from URL: https://eebjbbcmjpusnsfzwlax.supabase.co -> eebjbbcmjpusnsfzwlax
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  const sessionData = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });

  return `localStorage.setItem('${storageKey}', '${sessionData.replace(/'/g, "\\'")}');`;
}
