import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/userProfile.module.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = router.query.id; 
        const response = await axios.get(`/api/profile/${userId}`);
        setProfile(response.data);

        // Fetch QR code as well
        const qrResponse = await axios.get(`/api/qrcode/${userId}`);
        setQrCode(qrResponse.data.src);
      } catch (error) {
        console.error('Error retrieving profile data', error);
      }
    };

    fetchProfile();
  }, [router.query.id]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  const handleEditClick = () => {
    const userId = router.query.id; 
    router.push(`/profile?id=${userId}`); 
  };

  return (
    <div>
      <header className="page-header">
        <h1>User Profile</h1>
      </header>
      <div className={styles.profilePage}>
        <div className={styles.profilePicSection}>
          <img 
            src={profile.profilePic ? `data:image/jpeg;base64,${profile.profilePic}` : '/defaultProfilePic.jpg'} 
            alt="Profile" 
            className={styles.profilePic} 
          />
        </div>
        <div className={styles.infoSection}>
          <h2>{profile.fullName}</h2>
          <p><strong>School:</strong> {profile.school}</p>
          <div className={styles.bioSection}>
            <h3>Bio</h3>
            <p>{profile.bio}</p>
            <button className={styles.editButton} onClick={handleEditClick}>Edit</button>
          </div>
        </div>
        <div className={styles.qrCodeSection}>
          <h2>QR Code</h2>
          {qrCode ? <img src={qrCode} alt="QR Code" /> : <p>Loading QR Code...</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;