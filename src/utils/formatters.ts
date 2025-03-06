export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(num);
}; 