'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager, User } from '@/lib/auth';

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        if (!authManager.isAuthenticated()) {
            router.push('/');
            return;
        }

        // Get user info from localStorage
        const userData = authManager.getUser();

        if (!userData) {
            authManager.removeToken();
            router.push('/');
            return;
        }

        setUser(userData);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        authManager.removeToken();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <nav className="bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-white">
                                User Information
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-400">
                                Your account details
                            </p>
                        </div>
                        <div className="border-t border-gray-700">
                            <dl>
                                <div className="bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-400">Username</dt>
                                    <dd className="mt-1 text-sm text-gray-100 sm:mt-0 sm:col-span-2">
                                        {user?.username}
                                    </dd>
                                </div>
                                <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-400">Role</dt>
                                    <dd className="mt-1 text-sm text-gray-100 sm:mt-0 sm:col-span-2">
                                        {user?.role}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="mt-6 bg-gray-800 shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-white">
                                Welcome to your Dashboard!
                            </h3>
                            <div className="mt-2 max-w-xl text-sm text-gray-400">
                                <p>You are successfully logged in with JWT authentication.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
