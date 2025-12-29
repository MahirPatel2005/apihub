import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ num1, num2, answer: num1 + num2 });
        setCaptchaInput('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (parseInt(captchaInput) !== captcha.answer) {
            setError('Incorrect math answer. Please try again.');
            generateCaptcha();
            return;
        }

        try {
            await register(username, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
            generateCaptcha();
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-secondary-600 to-primary-600 p-12 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <h2 className="text-4xl font-bold font-heading mb-6">Join the Community</h2>
                    <p className="text-lg text-primary-100 mb-8 leading-relaxed">
                        Create an account to start publishing your own APIs or integration existing ones into your applications.
                    </p>
                    <ul className="space-y-4">
                        {['Unlimited public API access', 'Developer dashboard', 'Usage analytics', 'Community reviews'].map((item) => (
                            <li key={item} className="flex items-center text-primary-50">
                                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold font-heading text-gray-900">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center animate-fade-in">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm bg-white transition-all shadow-sm"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm bg-white transition-all shadow-sm"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm bg-white transition-all shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-1">
                                Security Check: What is {captcha.num1} + {captcha.num2}?
                            </label>
                            <input
                                id="captcha"
                                type="number"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm bg-white transition-all shadow-sm"
                                placeholder="Answer"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 hover:shadow-primary-600/50 transition-all transform hover:-translate-y-0.5"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
