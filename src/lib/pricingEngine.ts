export interface PricingInputs {
  pageCount: number;
  contentReadiness: 'ready' | 'light_editing' | 'heavy_shaping';
  features: {
    gallery?: boolean;
    blog?: boolean;
  };
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
  // Determine base price based on page count tiers
  let base = 500;
  if (inputs.pageCount >= 2 && inputs.pageCount <= 4) {
    base = 1000;
  } else if (inputs.pageCount >= 5 && inputs.pageCount <= 7) {
    base = 1500;
  } else if (inputs.pageCount > 7) {
    base = 1500; // Cap at 7 pages
  }

  // Calculate add-ons
  const addOns: { [key: string]: number } = {};

  if (inputs.contentReadiness === 'light_editing') {
    addOns['Copy Support'] = 150;
  }
  if (inputs.contentReadiness === 'heavy_shaping') {
    addOns['Copy Shaping'] = 300;
  }
  if (inputs.features.gallery) {
    addOns['Gallery/Images'] = 100;
  }
  if (inputs.features.blog) {
    addOns['Blog Setup'] = 150;
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
