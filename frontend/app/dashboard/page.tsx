'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import UploadModal from '@/components/UploadModal';
import WardrobeGrid from '@/components/WardrobeGrid';
import TryOnSelector from '@/components/TryOnSelector';
import TryOnResultModal from '@/components/TryOnResultModal';
import { useState, useRef, useEffect } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'ai' | 'settings'>('wardrobe');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Try On States
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [fetchingWardrobe, setFetchingWardrobe] = useState(false);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [tryOnError, setTryOnError] = useState<string | null>(null);

  const { user, token, refreshUser, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey(prev => prev + 1);
    fetchWardrobe(); // Re-fetch for AI tab too
  };

  const fetchWardrobe = async () => {
    if (!token) return;
    setFetchingWardrobe(true);
    try {
      const res = await fetch('http://localhost:8080/api/clothing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWardrobeItems(data.map((item: any) => ({
          ...item,
          category: item.category || { id: 0, name: '' },
        })));
      }
    } catch (err) {
      console.error('Failed to fetch wardrobe for AI tab:', err);
    } finally {
      setFetchingWardrobe(false);
    }
  };

  useEffect(() => {
    fetchWardrobe();
  }, [token]);

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('http://localhost:8080/api/user/profile/photo', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        await refreshUser();
      } else {
        console.error('Failed to upload photo');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleTryOn = async (selected: Record<string, any>) => {
    const itemsList = Object.values(selected);

    if (itemsList.length === 0) {
      alert('Please select an item to try on.');
      return;
    }

    const clothingItemIds = itemsList.map(item => item.id);

    setIsTryOnModalOpen(true);
    setTryOnLoading(true);
    setTryOnImage(null);
    setTryOnError(null);

    try {
      const res = await fetch('http://localhost:8080/api/tryon', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clothingItemIds }),
      });

      if (!res.ok) throw new Error('Failed to generate try-on result');

      const data = await res.json();
      setTryOnImage(data.resultImageUrl);
    } catch (err: any) {
      console.error(err);
      setTryOnError(err.message || 'An error occurred during try-on.');
    } finally {
      setTryOnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <Navbar />
      <UploadModal isOpen={isModalOpen} onClose={handleUploadSuccess} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">My Studio</h1>
            <p className="text-gray-500 font-medium mt-2">Manage your digital wardrobe.</p>
          </div>
          {activeTab === 'wardrobe' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all active:scale-95"
            >
              + Add New Garment
            </button>
          )}
        </header>

        {/* Custom Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-2xl w-max">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'wardrobe' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
              }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'ai' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
              }`}
          >
            AI Recommendations
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
              }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'wardrobe' && (
          <section className="bg-white min-h-[600px] rounded-[3rem] shadow-sm border border-gray-100 p-8 animate-in fade-in duration-300">
            <WardrobeGrid refreshKey={refreshKey} />
          </section>
        )}

        {activeTab === 'ai' && (
          <section className="bg-white min-h-[600px] rounded-[3rem] shadow-sm border border-gray-100 p-8 flex flex-col items-center animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">AI Styling Studio</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Mix and match items from your wardrobe and see how they look together.
              </p>
            </div>

            <div className="w-full max-w-4xl bg-gray-50 rounded-3xl p-6">
              {fetchingWardrobe ? (
                <p className="text-center py-10 text-gray-400">Loading your wardrobe...</p>
              ) : wardrobeItems.length === 0 ? (
                <p className="text-center py-10 text-gray-400">Upload items to your wardrobe to start styling!</p>
              ) : (
                <TryOnSelector items={wardrobeItems} onTryOn={handleTryOn} />
              )}
            </div>

            <TryOnResultModal
              isOpen={isTryOnModalOpen}
              onClose={() => setIsTryOnModalOpen(false)}
              imageUrl={tryOnImage}
              loading={tryOnLoading}
              error={tryOnError}
            />
          </section>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Profile Photo Section */}
            <section className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-xl font-black tracking-tighter mb-6">Your Try-On Photo</h2>
              <div className="flex items-center gap-8">
                <div
                  className="relative w-36 h-48 rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-black transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPhoto ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-gray-400 mt-2">Uploading...</p>
                    </div>
                  ) : user?.profilePhotoUrl ? (
                    <>
                      <img src={user.profilePhotoUrl} alt="Your photo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                        <p className="text-white text-xs font-bold">Change</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-4xl mb-2">👤</p>
                      <p className="text-xs text-gray-400 font-medium">Upload photo</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    {user?.profilePhotoUrl ? '✅ Photo uploaded!' : '📸 Upload your photo'}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Upload a full-body photo of yourself. This will be used to virtually try on clothes from your wardrobe.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-400">
                    <li>• Stand straight facing the camera</li>
                    <li>• Good lighting works best</li>
                    <li>• Full body visible in frame</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Edit Profile Section */}
            <section className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-xl font-black tracking-tighter mb-6">Profile Details</h2>
              <div className="max-w-md">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdatingProfile(true);
                  setProfileError('');
                  setProfileSuccess(false);
                  const formData = new FormData(e.currentTarget);
                  const newName = formData.get('fullName') as string;
                  const newEmail = formData.get('email') as string;

                  try {
                    await updateProfile(newName, newEmail);
                    setProfileSuccess(true);
                    setTimeout(() => setProfileSuccess(false), 3000);
                  } catch (err: any) {
                    setProfileError(err?.response?.data || 'Failed to update profile');
                  } finally {
                    setUpdatingProfile(false);
                  }
                }} className="space-y-4">

                  {profileError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
                      Profile updated successfully!
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      defaultValue={user?.fullName}
                      required
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={user?.email}
                      required
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {updatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}