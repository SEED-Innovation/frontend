import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryParam(key: string, defaultValue: number) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const value = parseInt(searchParams.get(key) ?? '') || defaultValue;
  
  const setValue = useCallback((newValue: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, String(newValue));
    setSearchParams(params);
  }, [key, searchParams, setSearchParams]);
  
  return [value, setValue] as const;
}