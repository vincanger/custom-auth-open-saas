import { useState, useEffect } from 'react';
import { AuthPageLayout } from './AuthPageLayout';
import { customSignup } from 'wasp/client/operations';
import { googleSignInUrl, signup } from 'wasp/client/auth';
import { useSearchParams, useNavigate } from 'react-router-dom';

type UserType = 'creator' | 'fan';

export function Signup() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<UserType>();
  const navigate = useNavigate();
  useEffect(() => {
    const userTypeParam = searchParams.get('userType');
    if (userTypeParam === 'creator' || userTypeParam === 'fan') {
      setUserType(userTypeParam);
    } else {
      setUserType('fan');
    }
  }, [searchParams]);

  return (
    <AuthPageLayout>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
          email: { value: string };
          password: { value: string };
        };
        const result = await customSignup({
          email: target.email.value,
          password: target.password.value,
          userType: userType || 'fan',
        });

        if (result.success) {
          navigate('/demo-app');
        }
      }}
      className="flex flex-col gap-4 mt-5"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <button 
          type="submit"
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded shadow-md hover:bg-indigo-700 active:translate-y-px transition-transform"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        <span>Or continue with</span>
      </div>

      <a href={googleSignInUrl.concat(`?userType=${userType}`)}>
        <button className="mt-5 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded shadow-md border border-gray-300 active:translate-y-px transition-transform">
          Google Login
        </button>
      </a>
    </AuthPageLayout>
  );
}
