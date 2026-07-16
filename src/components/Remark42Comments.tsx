/**
 * src/components/Remark42Comments.tsx
 *
 * Replaces GiscusComments. Drop-in replacement — same `term: string` prop.
 *
 * remark42 is self-hosted at admin.truthworldnews.com/remark42 per v5.7 spec.
 * Theme auto-syncs with site (dark on article pages, light on home — but article
 * pages are white in TWN, so we use 'light' here).
 *
 * Comment persistence: remark42 stores comments in its own SQLite/Postgres.
 * Migration from Giscus is not automatic — old Giscus comments stay in GitHub
 * Discussions (read-only archive).
 */

'use client';

import { useEffect, useRef } from 'react';

interface Remark42CommentsProps {
  /** Unique identifier for the discussion (article slug) */
  term: string;
  /** Optional max-width override */
  className?: string;
}

declare global {
  interface Window {
    remark42?: any;
  }
}

export default function Remark42Comments({ term, className = '' }: Remark42CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const remark42Url = process.env.NEXT_PUBLIC_REMARK42_URL;
  const siteId = process.env.NEXT_PUBLIC_REMARK42_SITE_ID || 'twn';

  useEffect(() => {
    if (!remark42Url || !containerRef.current) return;

    // Avoid double-injecting the embed script
    if (containerRef.current.querySelector('iframe')) return;

    // Inject remark42 embed.js once
    const existingScript = document.getElementById('remark42-embed');
    if (!existingScript) {
      const s = document.createElement('script');
      s.id = 'remark42-embed';
      s.async = true;
      s.src = `${remark42Url}/web/embed.js`;
      document.head.appendChild(s);
    }

    // Create the remark42 container
    const remark42Div = document.createElement('div');
    remark42Div.className = 'remark42';
    remark42Div.setAttribute('data-url', window.location.href);
    remark42Div.setAttribute('data-identifier', term);
    remark42Div.setAttribute('data-site-id', siteId);
    remark42Div.setAttribute('data-theme', 'light');
    remark42Div.setAttribute('data-max-shown-comments', '50');
    remark42Div.setAttribute('data-locale', 'en');

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(remark42Div);

    // Trigger remark42 to (re)render
    const trigger = () => {
      if (window.remark42 && typeof window.remark42.changeTheme === 'function') {
        window.remark42.changeTheme('light');
      }
    };
    const interval = setInterval(trigger, 1000);
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, [term, remark42Url, siteId]);

  if (!remark42Url) {
    // Fail gracefully — render nothing rather than a broken widget
    return null;
  }

  return (
    <section className={`mt-12 border-t-4 border-black pt-8 ${className}`}>
      <h3 className="text-2xl font-inter font-black uppercase mb-6 flex items-center gap-2">
        💬 Comments
      </h3>
      <div ref={containerRef} aria-live="polite">
        {/* remark42 will mount here */}
        <noscript>
          <p className="text-gray-500">Enable JavaScript to view comments.</p>
        </noscript>
      </div>
    </section>
  );
}
