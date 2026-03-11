import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DollarSignIcon,
  EditIcon,
  SettingsIcon,
  WrenchIcon,
  FuelIcon } from
'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
export function VehicleDetails() {
  const serviceHistory = [
  {
    date: '2023-10-12',
    service: 'Tire Rotation',
    mileage: '24,000',
    cost: '$60.00',
    shop: 'Tesla Service Center'
  },
  {
    date: '2023-04-05',
    service: 'Cabin Air Filter',
    mileage: '18,500',
    cost: '$45.00',
    shop: 'DIY'
  },
  {
    date: '2022-11-20',
    service: 'Annual Inspection',
    mileage: '12,000',
    cost: '$120.00',
    shop: 'Tesla Service Center'
  }];

  const columns = [
  {
    key: 'date',
    header: 'Date'
  },
  {
    key: 'service',
    header: 'Service Type'
  },
  {
    key: 'mileage',
    header: 'Mileage'
  },
  {
    key: 'cost',
    header: 'Cost'
  },
  {
    key: 'shop',
    header: 'Workshop'
  }];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/vehicles"
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">

            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
                Tesla Model 3
              </h1>
              <Badge variant="neutral">2022</Badge>
            </div>
            <p className="text-slate-500 mt-1">
              VIN: 5YJ3E1EA4NFXXXXXX • License: ABC-1234
            </p>
          </div>
        </div>
        <Button variant="secondary" icon={<EditIcon className="w-4 h-4" />}>
          Edit Vehicle
        </Button>
      </div>

      {/* Top Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-64 relative">
            <img
              src="https://images.unsplash.com/photo-1561580125-028ee3bd62eb?q=80&w=1200&auto=format&fit=crop"
              alt="Tesla Model 3"
              className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="flex gap-6 text-white">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Current Mileage</p>
                  <p className="text-2xl font-bold font-heading">24,500 mi</p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Engine Type</p>
                  <p className="text-2xl font-bold font-heading">Electric</p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Transmission</p>
                  <p className="text-2xl font-bold font-heading">Automatic</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center bg-sidebar text-white border-sidebar-border">
          <h3 className="text-sidebar-foreground/80 font-medium mb-6">
            Overall Health Score
          </h3>
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100">

              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="10" />

              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset="5.66"
                className="transition-all duration-1000 ease-out" />

            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-heading">
                98<span className="text-2xl text-sidebar-foreground/80">%</span>
              </span>
            </div>
          </div>
          <Badge
            variant="accent"
            className="bg-accentToken/20 text-accentToken border-accentToken/30">

            System Optimal
          </Badge>
        </Card>
      </div>

      {/* Tabs / Content Area */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button className="px-4 py-3 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
            Overview
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">
            Service History
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">
            Expenses
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">
            Documents
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  Recent Service History
                </h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <DataTable columns={columns} data={serviceHistory} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
                Upcoming Maintenance
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Brake Fluid Flush
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Recommended at 25,000 mi
                    </p>
                    <p className="text-xs font-medium text-primary-600 mt-2">
                      In ~500 miles
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Log Service
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <DollarSignIcon className="w-4 h-4" /> Total Spent
                  </span>
                  <span className="font-semibold text-slate-900">$225.00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <WrenchIcon className="w-4 h-4" /> Services Logged
                  </span>
                  <span className="font-semibold text-slate-900">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FuelIcon className="w-4 h-4" /> Avg Efficiency
                  </span>
                  <span className="font-semibold text-slate-900">
                    240 Wh/mi
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>);

}