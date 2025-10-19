import React from 'react';
import UserCircleIcon from './icons/UserCircleIcon';
import BellIcon from './icons/BellIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import KeyIcon from './icons/KeyIcon';

const SettingsCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
            <div className="flex items-start">
                <div className="flex-shrink-0 text-cyan-400">
                    {icon}
                </div>
                <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-100">{title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{description}</p>
                </div>
            </div>
            <div className="mt-6">
                {children}
            </div>
        </div>
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean }> = ({ label, enabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-slate-300">{label}</span>
        <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-not-allowed ${enabled ? 'bg-cyan-600' : 'bg-slate-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);


const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SettingsCard
                icon={<UserCircleIcon className="w-8 h-8"/>}
                title="Account"
                description="Manage your account details and preferences."
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-400">Name</label>
                        <input type="text" value="Dev Investor" disabled className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 mt-1 text-slate-200 cursor-not-allowed"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-400">Email</label>
                        <input type="email" value="investor@example.com" disabled className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 mt-1 text-slate-200 cursor-not-allowed"/>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                icon={<CreditCardIcon className="w-8 h-8"/>}
                title="Billing"
                description="Manage your subscription and payment methods."
            >
               <div className="bg-slate-700/50 p-4 rounded-md">
                    <p className="text-slate-300">Current Plan: <span className="font-bold text-cyan-400">Investor MVP Plan</span></p>
                    <p className="text-xs text-slate-400 mt-1">This is a demonstration plan with full access.</p>
               </div>
               <button className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                    Manage Subscription
               </button>
            </SettingsCard>
            
            <SettingsCard
                icon={<BellIcon className="w-8 h-8"/>}
                title="Notifications"
                description="Choose how you want to be notified."
            >
                <div className="space-y-4">
                    <Toggle label="Server Status Alerts" enabled={true} />
                    <Toggle label="Billing Updates" enabled={true} />
                    <Toggle label="Product News" enabled={false} />
                </div>
            </SettingsCard>
            
            <SettingsCard
                icon={<KeyIcon className="w-8 h-8"/>}
                title="Security"
                description="Manage your password and security settings."
            >
                <div className="space-y-4">
                     <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                        Change Password
                    </button>
                    <div>
                        <p className="text-slate-300">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-400 mt-1">2FA is currently <span className="font-semibold text-red-400">disabled</span>.</p>
                    </div>
                </div>
            </SettingsCard>
        </div>
    </div>
  );
};

export default Settings;
