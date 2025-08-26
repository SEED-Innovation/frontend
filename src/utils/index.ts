export * from './bookingUtils';
export * from './dateUtils';
export * from './courtAdapter'; // Add the new adapter

// Common utility functions
export const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export const capitalize = (str: string): string => 
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const formatEnumValue = (enumValue: string): string => 
    enumValue.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());// Add these if they don't exist
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const formatPrice = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
};

export const calculateTotalPrice = (duration: number, hourlyFee: number): number => {
  return duration * hourlyFee;
};