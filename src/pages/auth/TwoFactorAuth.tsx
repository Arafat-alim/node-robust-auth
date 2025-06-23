import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Smartphone } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface TwoFactorForm {
  token: string;
}

const TwoFactorAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TwoFactorForm>();

  const onSubmit = async (data: TwoFactorForm) => {
    setIsLoading(true);
    try {
      // Here you would verify the 2FA token
      // For now, we'll simulate success
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Authentication Code
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('token', {
                  required: '2FA code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must be 6 digits'
                  }
                })}
                type="text"
                maxLength={6}
                className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                  errors.token ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest`}
                placeholder="000000"
              />
            </div>
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">{errors.token.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Having trouble?{' '}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Use backup code
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuth;