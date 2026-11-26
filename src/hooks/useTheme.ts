import { useTheme as useSharedTheme } from 'next-themes';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const { resolvedTheme, setTheme } = useSharedTheme();
  const theme: Theme = resolvedTheme === 'dark' ? 'dark' : 'light';

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
}
