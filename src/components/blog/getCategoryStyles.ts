export const getCategoryStyles = (category: string | null) => {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('website') || categoryLower.includes('tips') || categoryLower.includes('design')) {
    return {
      badgeClass: 'bg-category-tips-light text-category-tips border-category-tips/20',
      borderClass: 'border-t-category-tips',
      shadowClass: 'hover:shadow-colored-tips'
    };
  }
  
  if (categoryLower.includes('business') || categoryLower.includes('guide')) {
    return {
      badgeClass: 'bg-category-business-light text-category-business border-category-business/20',
      borderClass: 'border-t-category-business',
      shadowClass: 'hover:shadow-colored-business'
    };
  }
  
  if (categoryLower.includes('seo') || categoryLower.includes('marketing')) {
    return {
      badgeClass: 'bg-category-seo-light text-category-seo border-category-seo/20',
      borderClass: 'border-t-category-seo',
      shadowClass: 'hover:shadow-colored-seo'
    };
  }
  
  return {
    badgeClass: 'bg-secondary text-secondary-foreground',
    borderClass: 'border-t-primary',
    shadowClass: 'hover:shadow-soft-lg'
  };
};
