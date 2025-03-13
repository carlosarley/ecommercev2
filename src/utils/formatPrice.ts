// src/utils/formatPrice.ts
export const formatPrice = (price: number): string => {
    return price.toLocaleString("es-CO", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };