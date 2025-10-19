import React from 'react';
import { User } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-w-2xl mx-auto">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
            <img 
              className="h-32 w-32 rounded-full ring-4 ring-slate-700 flex-shrink-0"
              src={user.avatarUrl} 
              alt="User avatar"
            />
            <div className="text-center sm:text-left mt-6 sm:mt-0">
              <h2 className="text-3xl font-bold text-slate-100">{user.name}</h2>
              <p className="text-lg text-slate-400 mt-1">{user.email}</p>
              <p className="text-sm text-slate-500 mt-4">Joined on July 20, 2024</p>
            </div>
          </div>
        </div>
        <div className="px-6 sm:px-8 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-end">
            <button
                className="flex items-center bg-red-600/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                onClick={() => alert('Account deletion is not implemented in this demo.')}
            >
                <TrashIcon className="w-4 h-4 mr-2"/>
                Delete Account
            </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;