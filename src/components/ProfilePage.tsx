import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Security tab state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // Wait for user to load
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      setProfile(snap.exists() ? snap.data() : {});
      setLoading(false);
    };
    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        mobile: profile.mobile,
        gender: profile.gender,
        birthdate: profile.birthdate,
      });
      setStatus('Profile updated!');
      setEditing(false);
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    }
  };

  // Password validation helpers
  const passwordValidation = (pw: string) => ({
    length: pw.length >= 8,
    number: /\d/.test(pw),
    capital: /[A-Z]/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  });
  const allValid = Object.values(passwordValidation(newPassword)).every(Boolean);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus('');
    if (!allValid) {
      setPasswordStatus('Password does not meet requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('Passwords do not match.');
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setPasswordStatus('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTouched(false);
    } catch (err: any) {
      setPasswordStatus('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Profile not found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              name="firstName"
              value={profile.firstName || ''}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={!editing}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              name="lastName"
              value={profile.lastName || ''}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={!editing}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile</label>
            <input
              name="mobile"
              value={profile.mobile || ''}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={!editing}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <input
              name="gender"
              value={profile.gender || ''}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={!editing}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Birthdate</label>
            <input
              name="birthdate"
              type="date"
              value={profile.birthdate || ''}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={!editing}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              value={profile.email || user.email}
              className="w-full border rounded-lg p-2 bg-gray-100"
              disabled
            />
          </div>
          <div className="flex gap-2 mt-4">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setStatus('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          {status && <div className="mt-2 text-center text-sm text-blue-600">{status}</div>}
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                setPasswordTouched(true);
              }}
              onBlur={() => setPasswordTouched(true)}
              className="w-full border rounded-lg p-2"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">Password must contain:</div>
            <ul className="text-xs space-y-1">
              <li className={passwordValidation(newPassword).length ? "text-green-600" : "text-gray-400"}>
                • At least 8 characters
              </li>
              <li className={passwordValidation(newPassword).number ? "text-green-600" : "text-gray-400"}>
                • At least one number
              </li>
              <li className={passwordValidation(newPassword).capital ? "text-green-600" : "text-gray-400"}>
                • At least one uppercase letter
              </li>
              <li className={passwordValidation(newPassword).special ? "text-green-600" : "text-gray-400"}>
                • At least one special character
              </li>
            </ul>
          </div>
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded-lg font-semibold ${allValid && newPassword === confirmPassword ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!allValid || newPassword !== confirmPassword}
          >
            Change Password
          </button>
          {passwordStatus && (
            <div className={`mt-2 text-center text-sm ${passwordStatus.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {passwordStatus}
            </div>
          )}
        </form>
      )}
    </div>
  );
}