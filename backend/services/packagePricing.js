const professionalPlans = {
  basic: { price: 799, name: 'Basic' },
  plus: { price: 1999, name: 'Premium' },
  premium: { price: 1999, name: 'Premium' },
  fleet: { price: 8999, name: 'Fleet' },
};

const planFor = (name = '') => {
  const key = String(name).trim().toLowerCase();
  return professionalPlans[key] || professionalPlans.basic;
};

export const normalizePublicPackage = (pkg) => {
  const plan = planFor(pkg?.name);
  const price = Number(pkg?.price || 0);

  return {
    ...pkg,
    name: plan.name,
    price: price > 0 ? Math.max(price, plan.price) : plan.price,
    period: pkg?.period || 'month',
  };
};

export const normalizePublicPackages = (packages = []) => packages.map(normalizePublicPackage);
