import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const db = getFirestore();

export default function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Helper: check if input is email
    const isEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            let email = identifier;
            // If not email, treat as username and look up in Firestore
            if (!isEmail(identifier)) {
                const q = query(collection(db, 'users'), where('username', '==', identifier));
                const snap = await getDocs(q);
                if (snap.empty) {
                    setMessage('No user found with this username.');
                    setLoading(false);
                    return;
                }
                email = snap.docs[0].data().email;
            }
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            useAuthStore.getState().setUser(userCredential.user, token);
            setMessage('Login successful!');
            navigate('/dashboard');
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email or Username"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="password"
                        className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : 'Login'}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
            <div className="mt-6 text-sm text-center text-gray-600">
                <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
            </div>
            <div className="mt-2 text-sm text-center">
                <p>
                    Don't have an account?{' '}
                    <a href="/signup" className="text-blue-600 hover:underline">Sign Up</a>
                </p>
            </div>
        </div>
    );
}