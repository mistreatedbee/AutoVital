import React from 'react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon } from
'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
const users = [
{
  id: 1,
  name: 'Alex Thompson',
  email: 'alex@example.com',
  plan: 'Pro',
  vehicles: 3,
  joined: 'Oct 12, 2023',
  status: 'Active'
},
{
  id: 2,
  name: 'Sarah Jenkins',
  email: 'sarah.j@example.com',
  plan: 'Starter',
  vehicles: 1,
  joined: 'Nov 05, 2023',
  status: 'Active'
},
{
  id: 3,
  name: 'Michael Chen',
  email: 'mchen@fleetworks.com',
  plan: 'Fleet',
  vehicles: 12,
  joined: 'Jan 20, 2024',
  status: 'Active'
},
{
  id: 4,
  name: 'Jessica Davis',
  email: 'jess@example.com',
  plan: 'Pro',
  vehicles: 2,
  joined: 'Feb 14, 2024',
  status: 'Suspended'
},
{
  id: 5,
  name: 'David Wilson',
  email: 'dwilson@example.com',
  plan: 'Starter',
  vehicles: 1,
  joined: 'Mar 01, 2024',
  status: 'Active'
}];

export function UserManagement() {
  const columns = [
  {
    key: 'name',
    header: 'User',
    render: (value: string, row: any) =>
    <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>

  },
  {
    key: 'plan',
    header: 'Plan',
    render: (value: string) =>
    <Badge
      variant={
      value === 'Fleet' ?
      'primary' :
      value === 'Pro' ?
      'accent' :
      'neutral'
      }>

          {value}
        </Badge>

  },
  {
    key: 'vehicles',
    header: 'Vehicles'
  },
  {
    key: 'joined',
    header: 'Joined Date'
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: string) =>
    <Badge variant={value === 'Active' ? 'accent' : 'warning'}>
          {value}
        </Badge>

  },
  {
    key: 'actions',
    header: '',
    render: () =>
    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
          <MoreVerticalIcon className="w-5 h-5" />
        </button>

  }];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage platform users, subscriptions, and access.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          className="bg-rose-600 hover:bg-rose-700 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30">

          Invite User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users by name or email..."
            icon={<SearchIcon className="w-4 h-4" />} />

        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm">
            <option>All Plans</option>
            <option>Starter</option>
            <option>Pro</option>
            <option>Fleet</option>
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={users} />
    </div>);

}