// pages/CompleteProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
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

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const userId = router.query.userId || localStorage.getItem('userId');
    setForm((prevForm) => ({ ...prevForm, id: userId }));

    const fetchProfile = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/profile/${userId}`);
          setForm((prevForm) => ({ ...prevForm, ...response.data }));
        } catch (error) {
          console.error("Error retrieving profile data", error);
        }
      }
    };

    fetchProfile();
  }, [router.query.userId]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

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
      formData.append('userId', form.id);
      formData.append('fullName', form.fullName);
      formData.append('mobile', form.mobile);
      formData.append('school', form.school);
      formData.append('bio', form.bio);
      if (form.profilePic) {
        formData.append('profilePic', form.profilePic);
      }

      const response = await axios.post('/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
      router.push(`/userProfile?userId=${form.id}`);
    } catch (error) {
      alert('Error updating profile');
    }
  };

  return (
    <div className="layout">
      <header className="page-header">
        <nav>
          <button onClick={toggleDropdown} className="dropbtn">Nav</button>
          {dropdownOpen && (
            <div className="dropdown-content">
              <Link href="/" onClick={closeDropdown}>Home</Link>
              <Link href="/UserProfile" onClick={closeDropdown}>Profile</Link>
              <Link href="/groups" onClick={closeDropdown}>Groups</Link>
            </div>
          )}
        </nav>
        <div className="header-content">
          <h1>Complete Your Profile</h1>
        </div>
      </header>
      <div className={styles.profilePage}>
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
    </div>
  );
};

export default CompleteProfile;
