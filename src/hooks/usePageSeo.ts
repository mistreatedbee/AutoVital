import { useEffect } from 'react';

interface PageSeoOptions {
  title?: string;
  description?: string;
}

export function usePageSeo({ title, description }: PageSeoOptions) {
  useEffect(() => {
    if (title) {
      document.title = `${title} · AutoVital`;
    }

    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}

