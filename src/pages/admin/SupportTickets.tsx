import React from 'react';
import { MessageSquareIcon, SendIcon, UserIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
export function SupportTickets() {
  const tickets = [
  {
    id: 'TKT-1042',
    user: 'Alex Thompson',
    subject: 'Cannot upload insurance document',
    time: '10 mins ago',
    status: 'Open',
    priority: 'High'
  },
  {
    id: 'TKT-1041',
    user: 'Sarah Jenkins',
    subject: 'Billing question regarding Pro plan',
    time: '2 hours ago',
    status: 'Open',
    priority: 'Medium'
  },
  {
    id: 'TKT-1040',
    user: 'Michael Chen',
    subject: 'Fleet bulk import failed',
    time: '5 hours ago',
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 'TKT-1039',
    user: 'Jessica Davis',
    subject: 'How to delete a vehicle?',
    time: '1 day ago',
    status: 'Closed',
    priority: 'Low'
  }];

  return (
    <div className="space-y-8 h-[calc(100vh-12rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Support Desk
        </h1>
        <p className="text-slate-500 mt-1">
          Manage user inquiries and support tickets.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Ticket List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
            Open Tickets (3)
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {tickets.map((ticket, i) =>
            <div
              key={ticket.id}
              className={`p-4 rounded-xl cursor-pointer transition-colors ${i === 0 ? 'bg-rose-50 border border-rose-200' : 'bg-white border border-slate-100 hover:bg-slate-50'}`}>

                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">
                    {ticket.id}
                  </span>
                  <Badge
                  variant={ticket.priority === 'High' ? 'warning' : 'neutral'}
                  className="text-[10px] px-2 py-0.5">

                    {ticket.priority}
                  </Badge>
                </div>
                <h4
                className={`font-medium mb-1 ${i === 0 ? 'text-rose-900' : 'text-slate-900'}`}>

                  {ticket.subject}
                </h4>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3" /> {ticket.user}
                  </span>
                  <span>{ticket.time}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Conversation View */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Cannot upload insurance document
              </h3>
              <p className="text-sm text-slate-500">TKT-1042 • Alex Thompson</p>
            </div>
            <Button variant="secondary" size="sm">
              Close Ticket
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
            {/* User Message */}
            <div className="flex gap-4 max-w-2xl">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-600">
                A
              </div>
              <div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-slate-700">
                  Hi, I'm trying to upload a PDF of my new insurance policy for
                  my Tesla, but I keep getting an error saying "File type not
                  supported". It's a standard PDF under 2MB. Can you help?
                </div>
                <span className="text-xs text-slate-400 mt-1 ml-1 block">
                  Today at 10:42 AM
                </span>
              </div>
            </div>

            {/* Admin Reply */}
            <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 font-bold text-rose-600">
                S
              </div>
              <div>
                <div className="bg-rose-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm">
                  Hi Alex, thanks for reaching out. We're currently experiencing
                  a minor issue with our document processing service for PDFs.
                  Our engineering team is on it and it should be resolved within
                  the hour. I'll notify you as soon as it's fixed!
                </div>
                <span className="text-xs text-slate-400 mt-1 mr-1 block text-right">
                  Today at 10:45 AM
                </span>
              </div>
            </div>
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="relative">
              <textarea
                className="w-full border border-slate-200 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                placeholder="Type your reply..."
                rows={3}>
              </textarea>
              <button className="absolute bottom-4 right-4 p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>);

}