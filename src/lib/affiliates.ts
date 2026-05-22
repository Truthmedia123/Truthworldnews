interface AffiliateLink {
  keyword: string;
  url: string;
  title: string;
}

const AFFILIATE_LINKS: AffiliateLink[] = [
  // AI Tools
  { keyword: 'DeepSeek', url: 'https://deepseek.com?ref=truthworldnews', title: 'DeepSeek AI' },
  { keyword: 'Claude', url: 'https://claude.ai?ref=truthworldnews', title: 'Claude by Anthropic' },
  { keyword: 'Groq', url: 'https://groq.com?ref=truthworldnews', title: 'Groq Inference' },
  { keyword: 'ChatGPT', url: 'https://chat.openai.com?ref=truthworldnews', title: 'ChatGPT' },

  // Crypto
  { keyword: 'Coinbase', url: 'https://coinbase.com/join?ref=truthworldnews', title: 'Coinbase' },
  { keyword: 'Ledger', url: 'https://ledger.com?ref=truthworldnews', title: 'Ledger Wallet' },
  { keyword: 'Bitcoin', url: 'https://bitcoin.org?ref=truthworldnews', title: 'Bitcoin' },

  // Hosting/Tools
  { keyword: 'Netlify', url: 'https://netlify.com?ref=truthworldnews', title: 'Netlify' },
  { keyword: 'Supabase', url: 'https://supabase.com?ref=truthworldnews', title: 'Supabase' },
  { keyword: 'Vercel', url: 'https://vercel.com?ref=truthworldnews', title: 'Vercel' },
];

export function insertAffiliateLinks(content: string): string {
  let modified = content;

  for (const affiliate of AFFILIATE_LINKS) {
    const regex = new RegExp(`\\b${affiliate.keyword}\\b`, 'i');
    if (regex.test(modified)) {
      modified = modified.replace(
        regex,
        `[${affiliate.keyword}](${affiliate.url})`
      );
    }
  }

  return modified;
}

export function getAffiliateLinksForCategory(category: string): AffiliateLink[] {
  const categoryMap: Record<string, string[]> = {
    'AI': ['DeepSeek', 'Claude', 'Groq', 'ChatGPT'],
    'Crypto': ['Coinbase', 'Ledger', 'Bitcoin'],
    'Tech': ['Netlify', 'Supabase', 'Vercel'],
  };

  const keywords = categoryMap[category] || [];
  return AFFILIATE_LINKS.filter(a => keywords.includes(a.keyword));
}
