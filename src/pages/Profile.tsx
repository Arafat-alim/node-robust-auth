import React, { useState } from "react";
import { User, Mail, Phone, Shield, Key, Smartphone } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  console.log("🚀 ~ Profile ~ user:", user);
  console.log("🚀 ~ Profile ~ upd:", updateProfile);
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "sessions", name: "Sessions", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and security settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "sessions" && <SessionsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileTab = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Profile Information
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              disabled={!isEditing}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              disabled={!isEditing}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1 flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-900">{user?.email}</span>
            {user?.isEmailVerified ? (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Unverified
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1 flex items-center">
            <Phone className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter phone number"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            {user?.isPhoneVerified ? (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Unverified
              </span>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const SecurityTab = () => {
  const { user } = useAuthStore();
  console.log("🚀 ~ SecurityTab ~ user:", user);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>

      {/* Password */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Password</h4>
            <p className="text-sm text-gray-500">Last changed 30 days ago</p>
          </div>
          <button className="text-blue-600 hover:text-blue-500 font-medium">
            Change Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-500">
                {user?.twoFactorEnabled
                  ? "Enabled"
                  : "Add an extra layer of security to your account"}
              </p>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-500 font-medium">
            {user?.twoFactorEnabled ? "Manage" : "Enable"}
          </button>
        </div>
      </div>

      {/* Email Verification */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Email Verification
              </h4>
              <p className="text-sm text-gray-500">
                {user?.isEmailVerified
                  ? "Your email is verified"
                  : "Verify your email address"}
              </p>
            </div>
          </div>
          {!user?.isEmailVerified && (
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              Send Verification
            </button>
          )}
        </div>
      </div>

      {/* Phone Verification */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Phone Verification
              </h4>
              <p className="text-sm text-gray-500">
                {user?.isPhoneVerified
                  ? "Your phone is verified"
                  : "Verify your phone number"}
              </p>
            </div>
          </div>
          {!user?.isPhoneVerified && user?.phoneNumber && (
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              Verify Phone
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionsTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
        <button className="text-red-600 hover:text-red-500 font-medium">
          Revoke All Sessions
        </button>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Current Session
              </h4>
              <p className="text-sm text-gray-500">
                Chrome on macOS • Last active now
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Current
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Mobile Session
              </h4>
              <p className="text-sm text-gray-500">
                Safari on iOS • Last active 2 hours ago
              </p>
            </div>
            <button className="text-red-600 hover:text-red-500 font-medium">
              Revoke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
