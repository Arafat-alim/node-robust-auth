import React, { useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Clock, Users, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const stats = [
    {
      name: 'Account Status',
      value: user?.isActive ? 'Active' : 'Inactive',
      icon: Shield,
      color: user?.isActive ? 'text-green-600' : 'text-red-600',
      bgColor: user?.isActive ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Email Verification',
      value: user?.isEmailVerified ? 'Verified' : 'Pending',
      icon: CheckCircle,
      color: user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600',
      bgColor: user?.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100'
    },
    {
      name: 'Phone Verification',
      value: user?.isPhoneVerified ? 'Verified' : 'Not Verified',
      icon: AlertCircle,
      color: user?.isPhoneVerified ? 'text-green-600' : 'text-gray-600',
      bgColor: user?.isPhoneVerified ? 'bg-green-100' : 'bg-gray-100'
    },
    {
      name: '2FA Status',
      value: user?.twoFactorEnabled ? 'Enabled' : 'Disabled',
      icon: Lock,
      color: user?.twoFactorEnabled ? 'text-green-600' : 'text-red-600',
      bgColor: user?.twoFactorEnabled ? 'bg-green-100' : 'bg-red-100'
    }
  ];

  const recentActivity = [
    {
      action: 'Account created',
      timestamp: user?.createdAt,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      action: 'Last login',
      timestamp: user?.lastLoginAt,
      icon: Clock,
      color: 'text-green-600'
    }
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your account security and activity.
          </p>
        </div>

        {/* Security Alerts */}
        {!user?.isEmailVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Email Verification Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Please verify your email address to secure your account and access all features.
                  </p>
                </div>
                <div className="mt-4">
                  <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors">
                    Resend Verification Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Shield className="h-4 w-4 mr-2" />
                Update Profile
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <CheckCircle className="h-4 w-4 mr-2" />
                Setup 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;