import { useEffect, useState } from 'react';
import { getUserAuditLog, type AuditEntry } from '@/lib/api/services/adminUserService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  UserCog,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditTimelineProps {
  userId: number;
  className?: string;
}

export function AuditTimeline({ userId, className }: AuditTimelineProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLog = async () => {
      setIsLoading(true);
      try {
        const data = await getUserAuditLog(userId);
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch audit log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAuditLog();
    }
  }, [userId]);

  const getActionIcon = (action: AuditEntry['action']) => {
    switch (action) {
      case 'CREATED':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'ENABLED':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'DISABLED':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'PASSWORD_RESET':
        return <KeyRound className="h-4 w-4 text-amber-500" />;
      case 'UPDATED':
        return <UserCog className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: AuditEntry['action']) => {
    switch (action) {
      case 'CREATED':
        return 'User Created';
      case 'ENABLED':
        return 'User Enabled';
      case 'DISABLED':
        return 'User Disabled';
      case 'PASSWORD_RESET':
        return 'Password Reset';
      case 'UPDATED':
        return 'User Updated';
      default:
        return 'Action';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground">No activity recorded</h3>
          <p className="text-sm text-muted-foreground/80 mt-1">
            User activity will appear here once actions are performed
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={className}>
      <div className="space-y-0">
        {entries.map((entry, index) => (
          <div key={entry.id} className="relative flex gap-3 pb-8">
            {/* Timeline line */}
            {index < entries.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
            )}

            {/* Icon */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border z-10">
              {getActionIcon(entry.action)}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getActionLabel(entry.action)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    by {entry.actor}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.details}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <time
                    className="text-xs text-muted-foreground whitespace-nowrap"
                    dateTime={entry.timestamp}
                    title={new Date(entry.timestamp).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </time>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
