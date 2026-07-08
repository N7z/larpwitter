import { ShieldCheck } from 'lucide-react';
import VerifiedBadge from '@/components/verified-badge';
import { UserInfo } from '@/types';

interface UserBadgeProps {
    user: Pick<UserInfo, 'is_admin' | 'is_verified'>;
    className?: string;
}

export default function UserBadge({ user, className = 'h-4 w-4' }: UserBadgeProps) {
    if (user.is_admin) {
        return <ShieldCheck className={`inline shrink-0 fill-yellow-400 stroke-yellow-600 ${className}`} aria-label="Admin" />;
    }

    if (user.is_verified === 2) {
        return <VerifiedBadge className={className} variant="company" />;
    }

    if (user.is_verified === 1) {
        return <VerifiedBadge className={className} variant="verified" />;
    }

    return null;
}
