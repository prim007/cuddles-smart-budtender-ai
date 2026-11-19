interface VerifiedUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
}

/** Only a verified account may issue a code for its own confirmed address. */
export function authorizePromoRecipient(user: VerifiedUser | null, requestedEmail: unknown):
  { email: string; status: 200 } | { email: null; status: 401 | 403 } {
  if (!user?.id || !user.email || !user.email_confirmed_at) {
    return { email: null, status: 401 };
  }
  const email = user.email.trim().toLowerCase();
  if (requestedEmail !== undefined &&
      (typeof requestedEmail !== "string" || requestedEmail.trim().toLowerCase() !== email)) {
    return { email: null, status: 403 };
  }
  return { email, status: 200 };
}