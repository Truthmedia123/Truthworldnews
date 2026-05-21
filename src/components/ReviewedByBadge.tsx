import { CheckCircle } from 'lucide-react';

interface ReviewedByBadgeProps {
    reviewerName?: string;
    className?: string;
}

/**
 * Displays a "Reviewed by [name]" badge on published articles.
 * This signals to Google AdSense that a human editor has reviewed the content.
 */
export default function ReviewedByBadge({
    reviewerName = 'Zane Edge',
    className = '',
}: ReviewedByBadgeProps) {
    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 border-green-500 bg-green-50 text-black font-inter font-black uppercase text-xs ${className}`}
            title="This article has been reviewed by a human editor"
        >
            <CheckCircle size={14} className="text-green-600" />
            <span>Reviewed by {reviewerName}</span>
        </div>
    );
}