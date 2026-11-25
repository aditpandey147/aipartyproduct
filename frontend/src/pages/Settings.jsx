// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/websites');

      let websitesData = [];
      if (Array.isArray(response.data)) {
        websitesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        websitesData = response.data.websites || response.data.data || [];
      }

      setWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (website) => {
    setWebsiteToDelete(website);
    setShowDeletePopup(true);
  };

  const handleDeleteWebsite = async () => {
    if (!websiteToDelete) return;

    const websiteId = websiteToDelete._id || websiteToDelete.id;
    const websiteUrl = websiteToDelete.url;

    setDeleting(websiteId);
    setShowDeletePopup(false);

    try {
      await api.delete(`/websites/${websiteId}`);

      toast.success(`Successfully deleted ${websiteUrl}`);
      setWebsites(prev => prev.filter(w => (w._id || w.id) !== websiteId));

    } catch (error) {
      console.error('Error deleting website:', error);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete website');
      }
    } finally {
      setDeleting(null);
      setWebsiteToDelete(null);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ✅ Plan badge — light theme
  const getPlanBadge = () => {
    const plan = user?.planName || user?.plan || 'Free';

    const planDisplay = {
      'Free': { bg: 'rgba(139,127,179,.12)', border: 'rgba(139,127,179,.35)', fg: '#8b7fb3', icon: 'fa-box', label: 'Free Plan' },
      'Starter': { bg: 'rgba(0,212,217,.14)', border: 'rgba(0,212,217,.4)', fg: '#00a8ad', icon: 'fa-rocket', label: 'Starter Plan' },
      'Pro': { bg: 'rgba(118,32,232,.15)', border: 'rgba(118,32,232,.4)', fg: '#7620e8', icon: 'fa-crown', label: 'Pro Plan' },
      'Growth': { bg: 'rgba(214,52,239,.15)', border: 'rgba(214,52,239,.4)', fg: '#d634ef', icon: 'fa-chart-line', label: 'Growth Plan' },
      'Enterprise': { bg: 'rgba(77,0,175,.18)', border: 'rgba(77,0,175,.45)', fg: '#4d00af', icon: 'fa-building', label: 'Enterprise Plan' },
    };

    const config = planDisplay[plan] || planDisplay['Free'];

    return (
      <div
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.fg }}
      >
        <i className={`fas ${config.icon} mr-1 text-xs`}></i> {config.label}
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: '#faf9ff' }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center">
          <div className="text-center">
            <div className="loader mx-auto mb-4"></div>
            <p style={{ color: '#62558f' }}>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ background: '#faf9ff' }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem]">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold" style={{ color: '#151032' }}>Settings</h1>
              <p className="text-sm mt-0.5" style={{ color: '#62558f' }}>Manage your account and preferences</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - User Card */}
              <div className="lg:col-span-1">
                <div
                  className="rounded-2xl shadow-sm overflow-hidden sticky top-4"
                  style={{ background: '#ffffffb8', border: '1px solid #ede8fb' }}
                >
                  {/* User Card Header — violet gradient */}
                  <div
                    className="p-6 text-center"
                    style={{
                      background: 'linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%)',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(118,32,232,.35)',
                    }}
                  >
                    <div
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold"
                      style={{
                        background: 'rgba(255,255,255,.20)',
                        border: '4px solid rgba(255,255,255,.30)',
                        color: '#ffffff',
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <h3 className="text-lg font-semibold mt-3" style={{ color: '#ffffff' }}>{user?.name || 'User'}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>{user?.email || 'No email'}</p>
                  </div>

                  {/* User Info */}
                  <div className="p-4 space-y-3">
                    <div
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#f7f2ff', border: '1px solid #ede8fb' }}
                    >
                      <span className="text-sm" style={{ color: '#62558f' }}>Plan</span>
                      <span>{getPlanBadge()}</span>
                    </div>
                    <div
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#f7f2ff', border: '1px solid #ede8fb' }}
                    >
                      <span className="text-sm" style={{ color: '#62558f' }}>Member Since</span>
                      <span className="text-sm font-medium" style={{ color: '#151032' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#f7f2ff', border: '1px solid #ede8fb' }}
                    >
                      <span className="text-sm" style={{ color: '#62558f' }}>Role</span>
                      <span
                        className="text-sm font-medium px-3 py-0.5 rounded-full"
                        style={
                          user?.role === 'admin'
                            ? { background: 'rgba(220,38,38,.10)', color: '#dc2626', border: '1px solid rgba(220,38,38,.30)' }
                            : { background: 'rgba(118,32,232,.12)', color: '#7620e8', border: '1px solid rgba(118,32,232,.35)' }
                        }
                      >
                        {user?.role || 'User'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Info (Read Only) */}
                <div
                  className="rounded-2xl shadow-sm p-6"
                  style={{ background: '#ffffffb8', border: '1px solid #ede8fb' }}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#151032' }}>
                    <i className="fas fa-user-circle" style={{ color: '#7620e8' }}></i>
                    Profile Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#62558f' }}>Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl cursor-not-allowed"
                        style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#8b7fb3' }}
                      />
                      <p className="text-xs mt-1" style={{ color: '#8b7fb3', opacity: 0.9 }}>Name cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#62558f' }}>Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl cursor-not-allowed"
                        style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#8b7fb3' }}
                      />
                      <p className="text-xs mt-1" style={{ color: '#8b7fb3', opacity: 0.9 }}>Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div
                  className="rounded-2xl shadow-sm p-6"
                  style={{ background: '#ffffffb8', border: '1px solid #ede8fb' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#151032' }}>
                        <i className="fas fa-lock" style={{ color: '#7620e8' }}></i>
                        Security
                      </h3>
                      <p className="text-sm mt-0.5" style={{ color: '#62558f' }}>Change your account password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2 hover:brightness-110 text-white"
                      style={{
                        background: 'linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%)',
                        boxShadow: '0 8px 20px rgba(118,32,232,.35)',
                      }}
                    >
                      <i className="fas fa-key"></i>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(21,16,50,.45)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up"
            style={{ background: '#ffffff', border: '1px solid #ede8fb' }}
          >
            {/* Modal header — violet gradient */}
            <div
              className="p-4"
              style={{ background: 'linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%)', color: '#ffffff' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,.20)' }}
                >
                  <i className="fas fa-key text-xl" style={{ color: '#ffffff' }}></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Change Password</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>Update your account password</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#62558f' }}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 rounded-xl transition outline-none"
                    style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#151032' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: '#62558f' }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#62558f' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-4 py-2.5 rounded-xl transition outline-none"
                  style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#151032' }}
                  minLength={6}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#8b7fb3', opacity: 0.9 }}>Password must be at least 6 characters</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" style={{ color: '#62558f' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2.5 rounded-xl transition outline-none"
                  style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#151032' }}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl transition font-medium"
                  style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#62558f' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 text-white"
                  style={{ background: 'linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%)', boxShadow: '0 6px 18px rgba(118,32,232,.35)' }}
                >
                  {passwordLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-save"></i>
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && websiteToDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(21,16,50,.45)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up"
            style={{ background: '#ffffff', border: '1px solid #ede8fb' }}
          >
            <div
              className="p-4"
              style={{ background: 'linear-gradient(110deg, #dc2626, #ff5f7e)', color: '#ffffff' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,.20)' }}
                >
                  <i className="fas fa-trash-alt text-xl" style={{ color: '#ffffff' }}></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Delete Website</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="mb-4" style={{ color: '#62558f' }}>
                Are you sure you want to delete <strong className="font-semibold" style={{ color: '#dc2626' }}>{websiteToDelete.url}</strong>?
              </p>
              <p className="text-sm mb-6" style={{ color: '#62558f' }}>
                This will permanently remove the website and all its scan data from your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setWebsiteToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl transition font-medium"
                  style={{ background: '#f7f2ff', border: '1px solid #ede8fb', color: '#62558f' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWebsite}
                  className="flex-1 px-4 py-2.5 rounded-xl transition font-medium flex items-center justify-center gap-2 hover:brightness-110 text-white"
                  style={{ background: 'linear-gradient(110deg, #dc2626, #ff5f7e)', boxShadow: '0 6px 18px rgba(220,38,38,.35)' }}
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }

        /* Loader — violet themed */
        .loader {
          border: 4px solid rgba(118,32,232,.15);
          border-top: 4px solid #7620e8;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Settings;