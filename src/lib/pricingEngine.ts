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
  // Hybrid pricing: Base + per-page add-ons
  // First page: $500
  // Pages 2-4: +$150 each
  // Pages 5-7: +$100 each
  
  let base = 500; // First page
  const pageCount = Math.min(inputs.pageCount, 7); // Cap at 7 pages
  
  // Calculate additional page costs
  if (pageCount >= 2) {
    // Pages 2-4 cost $150 each
    const pages2to4 = Math.min(pageCount - 1, 3); // Pages 2, 3, 4
    base += pages2to4 * 150;
  }
  
  if (pageCount >= 5) {
    // Pages 5-7 cost $100 each
    const pages5to7 = pageCount - 4; // Pages 5, 6, 7
    base += pages5to7 * 100;
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
