export const PLANS = {
  free: { name: 'Free', credits: 5, price: 0 },
  pro: { name: 'Pro', credits: 150, price: 15 },
  team: { name: 'Team', credits: 600, price: 49 },
}

// Public Stripe Payment Link URLs. Env vars override when provided.
export const STRIPE_LINKS = {
  proMonthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'https://buy.stripe.com/aFadR94ZweRo9V05Gbe3e05',
  proYearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || 'https://buy.stripe.com/4gMdR977E8t0gjo8Sne3e06',
  teamMonthly: import.meta.env.VITE_STRIPE_PRICE_TEAM_MONTHLY || 'https://buy.stripe.com/3cI3cvgIeaB89V06Kfe3e07',
  teamYearly: import.meta.env.VITE_STRIPE_PRICE_TEAM_YEARLY || 'https://buy.stripe.com/14A7sL8bI10y9V0b0ve3e08',
}
