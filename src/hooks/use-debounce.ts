import { useEffect, useState } from "react";

/**
 * Hook customizado utilitário para debounce de valores (ex: campos de busca/inputs).
 * @param value O valor original a ser observado
 * @param delay O tempo de espera em milissegundos (padrão 500ms)
 * @returns O valor com debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
