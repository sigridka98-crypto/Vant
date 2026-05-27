export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseServiceConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isPaystackConfigured() {
  return Boolean(
    process.env.PAYSTACK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY &&
      process.env.NEXT_PUBLIC_APP_URL
  );
}

export function getPaystackMonthlyPlanCode() {
  return process.env.PAYSTACK_MONTHLY_PLAN_CODE ?? "";
}
