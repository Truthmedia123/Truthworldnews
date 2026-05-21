'use client';

import { useEffect, useRef } from 'react';

interface GiscusCommentsProps {
    /** Unique identifier for the discussion (article ID or slug) */
    term: string;
}

/**
 * Giscus comment system — GitHub Discussions-based, free, no database needed.
 *
 * Setup:
 * 1. Install the Giscus GitHub App on your repo: https://github.com/apps/giscus
 * 2. Enable Discussions in your repo Settings
 * 3. Update the repo, repoId, and categoryId below with your values
 *    from https://giscus.app
 */
export default function GiscusComments({ term }: GiscusCommentsProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Avoid injecting the script multiple times
        if (ref.current && !ref.current.querySelector('script')) {
            const script = document.createElement('script');
            script.src = 'https://giscus.app/client.js';
            script.setAttribute('data-repo', 'TRUTHMEDIANETWORKS/truthworldnews');
            script.setAttribute('data-repo-id', 'R_kgDO_XXXXXXXXX'); // Replace with your repo ID from giscus.app
            script.setAttribute('data-category', 'Article Comments');
            script.setAttribute('data-category-id', 'DIC_kwDO_XXXXXXXXX'); // Replace with your category ID
            script.setAttribute('data-mapping', 'specific');
            script.setAttribute('data-term', term);
            script.setAttribute('data-reactions-enabled', '1');
            script.setAttribute('data-emit-metadata', '0');
            script.setAttribute('data-input-position', 'bottom');
            script.setAttribute('data-theme', 'dark');
            script.setAttribute('data-lang', 'en');
            script.setAttribute('data-loading', 'lazy');
            script.setAttribute('crossorigin', 'anonymous');
            script.async = true;
            ref.current.appendChild(script);
        }
    }, [term]);

    return (
        <section className="mt-12 border-t-4 border-black pt-8">
            <h3 className="text-2xl font-inter font-black uppercase mb-6 flex items-center gap-2">
                💬 Comments
            </h3>
            <div ref={ref} className="giscus" />
        </section>
    );
}