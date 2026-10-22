import { useEffect, useState } from 'react';
import { adminBackendService } from '../services/adminBackendService';

export function useBrandIcon(): string | null {
  const [brandIcon, setBrandIcon] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadBrandIcon = () => {
      void adminBackendService.getBrandIcon().then(icon => {
        if (!active) return;
        setBrandIcon(icon);
        if (icon) {
          document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]')
            .forEach(link => { link.href = icon; });
          document.querySelectorAll<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]')
            .forEach(meta => { meta.content = icon; });
        }
      }).catch(error => {
        console.error('Impossible de charger le logo partagé.', error);
      });
    };
    const handleBrandIconUpdate = () => loadBrandIcon();

    loadBrandIcon();
    window.addEventListener('brand-icon-updated', handleBrandIconUpdate);
    return () => {
      active = false;
      window.removeEventListener('brand-icon-updated', handleBrandIconUpdate);
    };
  }, []);

  return brandIcon;
}
