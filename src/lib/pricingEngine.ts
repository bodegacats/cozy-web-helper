export interface PricingInputs {
  pageCount: number;
  contentReadiness: 'ready' | 'heavy_shaping';
  timeline: 'normal' | 'rush';
}

export interface PricingResult {
  total: number;
  breakdown: {
    base: number;
    addOns: {
      [key: string]: number;
    };
  };
}

export function calculateEstimate(inputs: PricingInputs): PricingResult {
  // Unified pricing: Base $500 (includes 1 page) + $150 per additional page
  let base = 500; // Base includes 1 page
  const pageCount = Math.min(inputs.pageCount, 7); // Cap at 7 pages
  
  // Calculate additional page costs (flat $150 per page)
  if (pageCount > 1) {
    base += (pageCount - 1) * 150;
  }

  // Calculate add-ons
  const addOns: { [key: string]: number } = {};

  if (inputs.contentReadiness === 'heavy_shaping') {
    addOns['Content Shaping'] = 300;
  }
  if (inputs.timeline === 'rush') {
    addOns['Rush Delivery'] = 200;
  }

  // Calculate total
  const total = base + Object.values(addOns).reduce((sum, val) => sum + val, 0);

  return {
    total,
    breakdown: {
      base,
      addOns,
    },
  };
}
