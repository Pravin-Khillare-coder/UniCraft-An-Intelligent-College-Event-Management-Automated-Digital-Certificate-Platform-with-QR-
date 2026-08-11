import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Award, Edit, Check, ShieldCheck, Phone, GraduationCap, Upload, Camera } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [dept, setDept] = useState(user?.profile?.department || '');
  const [rollNo, setRollNo] = useState(user?.profile?.rollNumber || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [avatar, setAvatar] = useState(user?.profile?.avatar || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const newAvatarData = reader.result;
      setAvatar(newAvatarData);
      setErrorMsg('');
      setLoading(true);

      const res = await updateProfile({
        name: name || user?.name,
        department: dept || user?.profile?.department,
        rollNumber: rollNo || user?.profile?.rollNumber,
        phone: phone || user?.profile?.phone,
        avatar: newAvatarData
      });

      setLoading(false);
      if (res.success) {
        setSuccessMsg('Profile picture updated and saved successfully.');
      } else {
        setErrorMsg(res.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await updateProfile({
      name,
      department: dept,
      rollNumber: rollNo,
      phone,
      avatar
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg('Profile updated successfully.');
      setEditing(false);
    } else {
      setErrorMsg(res.message);
    }
  };

  const badgesList = [
    { name: 'First Code', desc: 'Registered for your first event.', color: 'from-amber-400 to-yellow-600 border-amber-500' },
    { name: 'Event Explorer', desc: 'Participated in 3 workshops.', color: 'from-purple-400 to-indigo-600 border-indigo-500' },
    { name: 'Code Warrior', desc: 'Participated in a programming hackathon.', color: 'from-red-400 to-orange-600 border-orange-500' },
    { name: 'Google Authenticated', desc: 'Linked Google Single Sign-On credentials.', color: 'from-blue-400 to-sky-600 border-sky-500' }
  ];

  // Filter badges matching user's list (from DB/seed)
  const userBadges = badgesList.filter(b => user?.badges?.includes(b.name));

  const currentAvatarDisplay = avatar || user?.profile?.avatar;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Hidden File Input for Device Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium text-center flex flex-col items-center justify-between space-y-4">
          <div className="space-y-3 flex flex-col items-center">
            {/* Interactive Avatar with Camera Upload Overlay */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Click to upload photo from device"
            >
              {currentAvatarDisplay ? (
                <img
                  src={currentAvatarDisplay}
                  alt="Avatar"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-primary/20 shadow-md bg-slate-50 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200 shadow-md transition-transform group-hover:scale-105">
                  <User className="w-12 h-12" />
                </div>
              )}
              
              <button
                type="button"
                className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-2xl shadow-md hover:bg-primary-hover transition-transform hover:scale-110"
                aria-label="Upload photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h4 className="font-extrabold text-slate-800 text-base leading-snug">{user?.name}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {user?.role === 'admin' ? 'Coordinator' : 'Student Registry'}
              </span>
            </div>

            {user?.role === 'student' && user?.profile?.rollNumber && (
              <span className="bg-primary/5 border border-primary/10 text-primary font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {user.profile.department} • {user.profile.rollNumber}
              </span>
            )}
          </div>

          <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-primary" /> Upload Photo
            </button>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile Details
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-1"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Details Forms or Badge Display */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Success / Error Banners */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-semibold">
              <Check className="w-4 h-4 inline mr-1" /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-250 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Details Form Card */}
          <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-premium">
            <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 mb-6">Profile Details</h4>
            
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {user?.role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</label>
                      <input
                        type="text"
                        placeholder="e.g. CS-2023-042"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Profile Picture Upload Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Profile Picture / Avatar</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm shrink-0"
                    >
                      <Upload className="w-4 h-4 text-primary" /> Choose Device Photo
                    </button>
                    <span className="text-xs text-slate-400 font-semibold text-center sm:text-left">or URL:</span>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 font-semibold">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
                  </p>
                </div>

                {user?.profile?.phone && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Phone Contact</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      <Phone className="w-4 h-4 text-slate-400" /> {user.profile.phone}
                    </p>
                  </div>
                )}

                {user?.role === 'student' && user?.profile?.department && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Major / Dept</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> {user.profile.department}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Authorized Signature Status</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Credentials Holder
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Badges and Achievements Display */}
          {user?.role === 'student' && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-premium space-y-4">
              <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Achievement Badges</h4>
              
              {userBadges.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
                  <Award className="w-8 h-8 text-slate-200" />
                  <p className="font-semibold">No badges unlocked yet</p>
                  <span>Attend events to unlock participation markers!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userBadges.map((badge, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-slate-50 shadow-sm hover:border-primary/10 transition-colors">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${badge.color} border flex items-center justify-center text-white shrink-0`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-xs leading-none mb-1">{badge.name}</h5>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
