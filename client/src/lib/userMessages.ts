/** Map technical/API errors to judge-friendly copy for end users. */

const TECHNICAL =
  /supabase|postgrest|pgrst|jwt|fetch failed|network error|econnrefused|groq|gemini|\[5\d\d\]|sql|rpc|anon key|service role/i;

export function isTechnicalMessage(message: string): boolean {
  const m = message.trim();
  if (!m) return false;
  return TECHNICAL.test(m) || m.startsWith('[') || m.includes('Hint:');
}

export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in. Check your inbox for the link.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }
  if (lower.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('signup is disabled')) {
    return 'Sign up is temporarily unavailable. Please try again later.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('no session')) {
    return 'Your sign-in link expired. Please try again.';
  }
  if (isTechnicalMessage(message)) {
    return 'Something went wrong. Please try again.';
  }
  return message;
}

export function friendlySaveError(message: string): string {
  if (isTechnicalMessage(message)) {
    return 'We couldn\'t save your changes. Please try again.';
  }
  return message;
}

export function friendlyLoadError(message?: string): string {
  if (!message || isTechnicalMessage(message)) {
    return 'We couldn\'t load this right now. Please try again.';
  }
  return message;
}

export function friendlyChatError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('offline') ||
    lower.includes('load failed')
  ) {
    return 'Cyra couldn\'t reach Sakhi right now. Check your connection and try again.';
  }
  if (lower.includes('429') || lower.includes('too many')) {
    return 'Too many messages. Take a short break and try again.';
  }
  if (lower.includes('401') || lower.includes('sign in again')) {
    return 'Your session expired. Please sign in again.';
  }
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('encountered an issue')
  ) {
    return 'Sakhi is taking a brief pause. Please try again in a moment.';
  }
  if (isTechnicalMessage(message)) {
    return 'Sakhi couldn\'t respond right now. Please try again.';
  }
  return message;
}

export function friendlyOnboardingError(message: string): string {
  if (message.includes('onboarding status did not update')) {
    return 'Almost done! Tap Enter Cyra again, or refresh the page.';
  }
  if (isTechnicalMessage(message)) {
    return 'We couldn\'t save your profile. Please try again.';
  }
  return message;
}
