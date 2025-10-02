import { useState } from 'react';
import { X, User, Mail, Key, Check, Edit2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { BACKEND_URL } from "../constants";

const ProfileModal = ({ 
  isOpen, 
  onClose
}: {isOpen: boolean, onClose: () => void}) => {
  const currentUser = useChatStore((state) => state.currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const setCurrentUser = useChatStore.getState().setCurrentUser;
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;
  if(!currentUser) return;

  const isGoogleUser = !currentUser?.password;
  
  const renderUserImage = () => {
    if (currentUser?.image) {
      return (
        <img
          src={currentUser.image}
          alt={currentUser.name}
          className="w-full h-full object-cover"
        />
      );
    } else {
      return (
        <span className="text-2xl font-semibold text-gray-600">
          {currentUser?.name?.charAt(0).toUpperCase() ?? "?"}
        </span>
      );
    }
  };

const handleSaveName = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: currentUser.id,
        name: editedName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update name');
    }

    const updatedUser = await response.json();
    console.log('Name updated successfully:', updatedUser);
    setIsEditing(false);
    // Update currentUser in your state management
    // setCurrentUser(updatedUser); or similar
  } catch (error) {
    console.error('Error updating name:', error);
    alert('Failed to update name. Please try again.');
  }
};

const handleSavePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/profile/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: currentUser.id, 
        password: passwordForm.newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update password');
    }

    const updatedUser = await response.json();
    setCurrentUser(updatedUser);
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } catch (error) {
    console.error('Error updating password:', error);
    alert('Failed to update password. Please try again.');
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {renderUserImage()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <User size={16} className="mr-2" />
                Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(currentUser?.name || '');
                    }}
                    className="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">{currentUser?.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Mail size={16} className="mr-2" />
                Email
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800">{currentUser?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Key size={16} className="mr-2" />
                Authentication
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">
                    {isGoogleUser ? 'Google Account' : 'Email & Password'}
                  </span>
                  {isGoogleUser ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      OAuth
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      Local
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isGoogleUser && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Key size={16} className="mr-2" />
                  Password
                </label>
                {isChangingPassword ? (
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePassword}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Save Password
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left text-gray-600 transition-colors"
                  >
                    Click to change password
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;