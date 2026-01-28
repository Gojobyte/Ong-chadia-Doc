import { useEffect } from 'react';

const BASE_TITLE = 'ONG Chadia';

/**
 * Hook to dynamically set the page title
 * @param title - The page-specific title (e.g., "Dashboard", "Documents")
 *
 * @example
 * usePageTitle('Dashboard');
 * // Sets document.title to "Dashboard | ONG Chadia"
 *
 * @example
 * usePageTitle(`${document.name} - Documents`);
 * // Sets document.title to "Report.pdf - Documents | ONG Chadia"
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
