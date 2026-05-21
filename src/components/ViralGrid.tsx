'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, TrendingUp } from 'lucide-react';
import AdSlot from './AdSlot';

export type Post = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  view_count: number;
  is_published: boolean;
  author_avatar?: string;
  author_name?: string;
};

const CATEGORIES = ['ALL', 'AI', 'UK POLITICS', 'TECH', 'EXPOSE', 'WORLD'];

const mockPosts: Post[] = [
  {
    id: "mock-1",
    title: "AGI IN 2026? EX-OPENAI RESEARCHER LEAKS INTERNAL TIMELINE THAT CHANGES EVERYTHING",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    category: "AI",
    view_count: 145000,
    is_published: true,
    author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    author_name: "Zane Edge"
  },
  {
    id: "mock-2",
    title: "PRIME MINISTER SPOTTED AT UNDERGROUND RAVE WHILE PARLIAMENT DEBATES ECONOMY",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category: "UK POLITICS",
    view_count: 98000,
    is_published: true,
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    author_name: "Mia Fench"
  },
  {
    id: "mock-3",
    title: "NEW SILICON CHIP USES HUMAN BRAIN CELLS – IS THIS THE END OF TRADITIONAL COMPUTING?",
    image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    category: "TECH",
    view_count: 56000,
    is_published: true,
    author_avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80",
    author_name: "Leo Vault"
  },
  {
    id: "mock-4",
    title: "LONDON POLICE REPLACING PATROL OFFICERS WITH DRONES NEXT MONTH",
    image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    category: "UK POLITICS",
    view_count: 43000,
    is_published: true,
    author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    author_name: "Zane Edge"
  },
  {
    id: "mock-5",
    title: "YOU'RE USING CHATGPT WRONG: 5 PROMPTS THAT WILL LITERALLY DO YOUR ENTIRE JOB",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    category: "AI",
    view_count: 220000,
    is_published: true,
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    author_name: "Mia Fench"
  },
  {
    id: "mock-6",
    title: "THE METAVERSE ISN'T DEAD: ZUCKERBERG'S SECRET BILLION-DOLLAR PROJECT REVEALED",
    image_url: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=800&q=80",
    category: "TECH",
    view_count: 89000,
    is_published: true,
    author_avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80",
    author_name: "Leo Vault"
  }
];

export default function ViralGrid({ posts = [] }: { posts?: Post[] }) {
  const displayPosts = posts.length > 0 ? posts : mockPosts;

  // Hero block: top 3 most recent
  const heroPosts = displayPosts.slice(0, 3);

  // Categories for the vertical sections
  const categories = ['AI', 'UK POLITICS', 'TECH'];

  const renderPost = (post: Post, isFeatured: boolean = false) => {
    const colSpan = isFeatured ? 'md:col-span-2 md:row-span-2' : 'col-span-1';

    return (
      <Link
        href={`/article/${post.id}`}
        key={post.id}
        className={`${colSpan} group relative flex flex-col overflow-hidden rounded-sm border-4 border-black hover:border-[#FFFF00] transition-colors h-full animate-shuffle`}
      >
        <div className={`bg-zinc-900 w-full h-full relative flex-grow ${isFeatured ? 'min-h-[450px]' : 'min-h-[300px]'}`}>
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">No Image</div>
          )}

          {isFeatured && (
            <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-20 pointer-events-none">
              <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                <Flame size={14} className="fill-current" /> Hot
              </span>
            </div>
          )}


          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-24 flex flex-col justify-end z-10 pointer-events-none">
            <span className="text-[#FFFF00] font-black uppercase text-xs mb-2 tracking-widest drop-shadow-md">{post.category}</span>
            <h2 className={`${isFeatured ? 'text-3xl md:text-4xl' : 'text-xl'} font-inter font-black text-white leading-tight mb-4 drop-shadow-md`}>
              {post.title}
            </h2>

            {post.author_avatar && (
              <div className="flex items-center gap-3">
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-8 h-8 rounded-full border-2 border-[#FFFF00] object-cover"
                />
                <span className="text-white text-xs font-bold uppercase">{post.author_name}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div>
      {/* 1. The "Latest News" Hero Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
        {heroPosts.map((post, index) => renderPost(post, index === 0))}
      </div>



      {/* 2. The Vertical Category Sections */}
      {categories.map((category, index) => {
        const catPosts = displayPosts.filter(p => p.category.toUpperCase() === category).slice(0, 4);

        // Skip empty categories
        if (catPosts.length === 0) return null;

        return (
          <React.Fragment key={category}>
            {/* 4. Ad Injection Placeholder between 1st and 2nd section */}
            {index === 1 && (
              <div className="w-full h-[250px] bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center font-bold text-gray-400 my-10">
                HORIZONTAL AD BANNER (970x250)
              </div>
            )}

            <section className="mt-16 mb-12">
              <div className="border-b-[6px] border-black mb-6 pb-2 flex justify-between items-end">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{category}</h2>
                <Link href="/" className="text-sm font-black uppercase bg-black text-[#FFFF00] px-4 py-1 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
                  MORE {category} NEWS →
                </Link>
              </div>

              {/* 3. The Category Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catPosts.map((post) => renderPost(post, false))}
              </div>
            </section>
          </React.Fragment>
        );
      })}
    </div>
  );
}
