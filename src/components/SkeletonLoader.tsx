import React from 'react';

export function SkeletonCard() {
    return (
        <div className="animate-pulse border-4 border-gray-200 rounded-sm overflow-hidden">
            <div className="bg-gray-300 h-48 w-full" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-300 rounded w-1/4" />
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="flex items-center gap-2 pt-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div className="h-3 bg-gray-300 rounded w-20" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonArticle() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="bg-gray-300 h-[50vh] w-full" />
            <div className="max-w-3xl mx-auto px-4 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4" />
                <div className="h-8 bg-gray-300 rounded w-1/2" />
                <div className="flex items-center gap-3 pt-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-32" />
                        <div className="h-3 bg-gray-300 rounded w-24" />
                    </div>
                </div>
                <div className="space-y-3 pt-6">
                    <div className="h-4 bg-gray-300 rounded w-full" />
                    <div className="h-4 bg-gray-300 rounded w-full" />
                    <div className="h-4 bg-gray-300 rounded w-5/6" />
                    <div className="h-4 bg-gray-300 rounded w-full" />
                    <div className="h-4 bg-gray-300 rounded w-4/5" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonList() {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-b-2 border-gray-200 pb-4">
                    <div className="w-24 h-24 bg-gray-300 rounded shrink-0" />
                    <div className="flex-grow space-y-2">
                        <div className="h-3 bg-gray-300 rounded w-16" />
                        <div className="h-4 bg-gray-300 rounded w-full" />
                        <div className="h-4 bg-gray-300 rounded w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}