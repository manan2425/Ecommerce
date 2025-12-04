/**
 * Determines the stock status color based on product stock and thresholds
 * @param {number} totalStock - Current stock quantity
 * @param {number} redThreshold - Stock level where it shows red (stock <= redThreshold)
 * @param {number} yellowThreshold - Stock level where it shows yellow (stock <= yellowThreshold)
 * @returns {object} - Object with color name, hex code, and text color for contrast
 */
export const getStockStatusColor = (totalStock, redThreshold = 5, yellowThreshold = 20) => {
  const stock = Number(totalStock);
  const red = Number(redThreshold);
  const yellow = Number(yellowThreshold);

  if (stock <= red) {
    return {
      status: 'critical',
      color: 'bg-red-500',
      hex: '#ef4444',
      textColor: 'text-white',
      label: 'Low Stock'
    };
  } else if (stock <= yellow) {
    return {
      status: 'warning',
      color: 'bg-yellow-500',
      hex: '#eab308',
      textColor: 'text-black',
      label: 'Medium Stock'
    };
  } else {
    return {
      status: 'healthy',
      color: 'bg-green-500',
      hex: '#22c55e',
      textColor: 'text-white',
      label: 'In Stock'
    };
  }
};

/**
 * Gets only the color class for Tailwind styling
 */
export const getStockColorClass = (totalStock, redThreshold, yellowThreshold) => {
  return getStockStatusColor(totalStock, redThreshold, yellowThreshold).color;
};

/**
 * Gets the stock status label
 */
export const getStockLabel = (totalStock, redThreshold, yellowThreshold) => {
  return getStockStatusColor(totalStock, redThreshold, yellowThreshold).label;
};
