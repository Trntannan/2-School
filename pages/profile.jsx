// pages/profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/profile.module.css';

const Profile = () => {
  const [form, setForm] = useState({
    id: '', // This should be set when the user logs in
    fullName: '',
    mobile: '',
    school: '',
    bio: '',
    profilePic: null,
  });
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    // Replace with the actual user ID after login
    const userId = 'user-id-from-authentication';
    setForm((prevForm) => ({ ...prevForm, id: userId }));

    // Fetch QR code
    const fetchQrCode = async () => {
      try {
        const response = await axios.get(`/api/qrcode/${userId}`);
        setQrCode(response.data.src);
      } catch (error) {
        console.error('Error fetching QR code', error);
      }
    };

    fetchQrCode();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePic') {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));

      const response = await axios.post('/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
    } catch (error) {
      alert('Error updating profile');
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className="page-header">
        <h1>Profile</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="mobile">Mobile</label>
          <input type="text" name="mobile" value={form.mobile} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="school">School</label>
          <input type="text" name="school" value={form.school} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="bio">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} required />
        </div>
        <div className={styles.profilePicContainer}>
          <label htmlFor="profilePic">Profile Picture</label>
          <input type="file" name="profilePic" onChange={handleChange} />
          {form.profilePic && <img src={URL.createObjectURL(form.profilePic)} alt="Profile" />}
        </div>
        <button type="submit">Save Profile</button>
      </form>

      <div className={styles.qrCodeContainer}>
        <h2>QR Code</h2>
        {qrCode ? <img src={qrCode} alt="QR Code" /> : <p>Loading...</p>}
      </div>
    </div>
  );
};

export default Profile;