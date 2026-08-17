export function calculateSaleRatio(arrivalQuantity, soldQuantity) {
  if (
    !Number.isFinite(arrivalQuantity) ||
    !Number.isFinite(soldQuantity) ||
    arrivalQuantity <= 0
  ) {
    return null;
  }

  return soldQuantity / arrivalQuantity;
}