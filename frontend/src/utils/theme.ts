export type Theme = 'light' | 'dark' | 'system';

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
  
  // Save theme preference
  localStorage.setItem('agentSwarmTheme', theme);
};

export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('agentSwarmTheme') as Theme | null;
  const theme = savedTheme || 'dark';
  applyTheme(theme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('agentSwarmTheme') as Theme;
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
};

export const toggleTheme = (currentTheme: Theme): Theme => {
  const themes: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];
  
  applyTheme(nextTheme);
  return nextTheme;
};