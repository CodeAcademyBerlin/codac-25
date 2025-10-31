export function getCallbackURL(searchParams: URLSearchParams | null): string {
  if (!searchParams) return "/dashboard";
  const callbackUrl = searchParams.get("callbackUrl");
  return callbackUrl || "/dashboard";
}

