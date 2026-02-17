import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const provider = searchParams.get('provider');
        const code = searchParams.get('code');

        if (provider && code) {
            handleCallback(provider, code);
        } else {
            setError('Invalid callback parameters');
        }
    }, [searchParams]);

    const handleCallback = async (provider: string, code: string) => {
        try {
            const response = await api.post('/auth/social-login/callback', { provider, code });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        } catch (err: any) {
            console.error('Social login callback error:', err);
            setError(err.response?.data?.message || 'Authentication failed');
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {!error ? (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h2>
                        <p className="text-gray-500 text-sm">Finishing your social login. Please wait.</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">!</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
                        <p className="text-red-500 text-sm mb-6">{error}</p>
                        <p className="text-gray-400 text-xs">Redirecting to login page...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
