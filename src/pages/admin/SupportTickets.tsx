import React from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export function SupportTickets() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Support Desk
        </h1>
        <p className="text-slate-500 mt-1">
          Centralised support ticketing and in-app conversations.
        </p>
      </div>

      <Card className="p-12 flex items-center justify-center">
        <EmptyState
          icon={<MessageSquareIcon className="w-12 h-12 text-slate-300" />}
          title="Support tickets coming soon"
          description="We’re planning a full multi-tenant support desk with in-app messaging, SLAs, and automations. For now, handle customer support via your existing tools."
          action={(
            <Button
              variant="secondary"
              onClick={() => {
                window.open('mailto:support@autovital.co.za');
              }}
            >
              Contact support team
            </Button>
          )}
        />
      </Card>
    </div>
  );
}