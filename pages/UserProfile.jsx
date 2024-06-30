import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../styles/userProfile.module.css";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [editField, setEditField] = useState(null);
  const [tempData, setTempData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = router.query.userId || localStorage.getItem("userId");
        
        // Fetch user profile
        const profileResponse = await axios.get(`/api/profile/${userId}`);
        setProfile(profileResponse.data);

        // Generate QR code using quickchart.io
        const qrUrl = `https://quickchart.io/qr?text=${userId}`;
        const qrResponse = await axios.get(qrUrl, { responseType: 'blob' });
        const qrCodeUrl = URL.createObjectURL(qrResponse.data);
        setQrCode(qrCodeUrl);
      } catch (error) {
        console.error("Error retrieving profile data", error);
      }
    };

    fetchProfile();
  }, [router.query.userId]); 

  if (!profile) {
    return <p>Loading...</p>;
  }

  const handleEditClick = (field) => {
    setEditField(field);
    setTempData({ [field]: profile[field] });
  };

  const handleSaveClick = async (field) => {
    try {
      const userId = router.query.userId || localStorage.getItem("userId");
      await axios.put(`/api/profile/${userId}`, { [field]: tempData[field] });
      setProfile((prevProfile) => ({ ...prevProfile, [field]: tempData[field] }));
      setEditField(null);
    } catch (error) {
      console.error("Error updating profile data", error);
    }
  };

  const handleChange = (e) => {
    setTempData({ ...tempData, [editField]: e.target.value });
  };

  return (
    <div className={styles.profilePage}>
      <header className="page-header">
        <h1>User Profile</h1>
      </header>
      <div className={styles.picName}>
        <img 
          src={profile.profilePic ? `data:image/jpeg;base64,${profile.profilePic}` : "/defaultProfilePic.jpg"} 
          alt="Profile pic" 
          className={styles.profilePic} 
        />
        {editField === 'profilePic' ? (
          <div>
            <input type="file" onChange={handleChange} />
            <button onClick={() => handleSaveClick('profilePic')}>Save</button>
          </div>
        ) : (
          <button className={styles.editButton} onClick={() => handleEditClick('profilePic')}>
            <i className="fas fa-edit"></i>
          </button>
        )}
        <h2 className={styles.fullName}>
          {editField === 'fullName' ? (
            <div>
              <input type="text" value={tempData.fullName} onChange={handleChange} />
              <button onClick={() => handleSaveClick('fullName')}>Save</button>
            </div>
          ) : (
            <>
              {profile.fullName}
              <button className={styles.editButton} onClick={() => handleEditClick('fullName')}>
                <i className="fas fa-edit"></i>
              </button>
            </>
          )}
        </h2>
      </div>
      <div className="infoSection">
        <p>
          <strong>School:</strong> 
          {editField === 'school' ? (
            <div>
              <input type="text" value={tempData.school} onChange={handleChange} />
              <button onClick={() => handleSaveClick('school')}>Save</button>
            </div>
          ) : (
            <>
              {profile.school}
              <button className={styles.editButton} onClick={() => handleEditClick('school')}>
                <i className="fas fa-edit"></i>
              </button>
            </>
          )}
        </p>
        <div className={styles.bioSection}>
          <h3>Bio</h3>
          {editField === 'bio' ? (
            <div>
              <textarea value={tempData.bio} onChange={handleChange} />
              <button onClick={() => handleSaveClick('bio')}>Save</button>
            </div>
          ) : (
            <>
              <p>{profile.bio}</p>
              <button className={styles.editButton} onClick={() => handleEditClick('bio')}>
                <i className="fas fa-edit"></i>
              </button>
            </>
          )}
        </div>
      </div>
      <div className={styles.qrCodeSection}>
        <h2>QR Code</h2>
        {qrCode ? (
          <img src={qrCode} alt="QR Code" />
        ) : (
          <p>Loading QR Code...</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
