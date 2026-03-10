import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
export function ProfileSettings() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information and security.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-6">
          Personal Information
        </h2>
        <div className="flex items-start gap-8 mb-8">
          <div className="flex flex-col items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" />

            <Button variant="ghost" size="sm">
              Change Photo
            </Button>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" defaultValue="Alex" />
              <Input label="Last Name" defaultValue="Thompson" />
            </div>
            <Input
              label="Email Address"
              type="email"
              defaultValue="alex.thompson@example.com" />

            <Input
              label="Phone Number"
              type="tel"
              defaultValue="+1 (555) 123-4567" />

          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 font-heading mb-6">
          Change Password
        </h2>
        <div className="space-y-4 max-w-md">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <div className="pt-2">
            <Button variant="secondary">Update Password</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-rose-200 bg-rose-50/30">
        <h2 className="text-lg font-bold text-rose-900 font-heading mb-2">
          Danger Zone
        </h2>
        <p className="text-rose-700 text-sm mb-6">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button
          variant="white"
          className="text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-none">

          Delete Account
        </Button>
      </Card>
    </div>);

}