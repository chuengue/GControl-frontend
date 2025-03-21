export const formatNumberWithThousands = (number: number): string => {
    return number.toLocaleString('pt-BR');
};


export const capitalizeWords = (text: string) =>
    text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');