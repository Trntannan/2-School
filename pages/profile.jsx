import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/profile.module.css';

const CompleteProfile = () => {
  const [form, setForm] = useState({
    id: '', 
    fullName: '',
    mobile: '',
    school: '',
    bio: '',
    profilePic: null,
  });

  const router = useRouter();

  useEffect(() => {
    // Replace with the actual user ID after login
    const userId = 'user-id-from-authentication';
    setForm((prevForm) => ({ ...prevForm, id: userId }));
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
      router.push(`/userProfile?id=${form.id}`); 
    } catch (error) {
      alert('Error updating profile');
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className="page-header">
        <h1>Complete Your Profile</h1>
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
    </div>
  );
};

export default CompleteProfile;