import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../styles/home.module.css";

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      try {
        const response = await axios.post("/api/login", {
          email: form.email,
          password: form.password,
        });
        alert(response.data.message);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId); 
        router.push(`/userProfile`);
      } catch (error) {
        alert(error.response.data.message || "Error logging in");
      }
    } else {
      try {
        const { username, email, password, confirmPassword } = form;
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        const response = await axios.post("/api/register", {
          username,
          email,
          password,
        });
        alert(response.data.message);
        localStorage.setItem("token", response.data.token); 
        localStorage.setItem("userId", response.data.userId);
        router.push("/completeProfile");
      } catch (error) {
        alert(error.response.data.message || "Error signing up");
      }
    }
  };

  return (
    <div className={styles.landingPage}>
      <div className="page-header">
        <h1>2 School</h1>
      </div>
      <div>
        {isLogin ? (
          <div>
            <form onSubmit={handleSubmit}>
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="submit" className={styles.loginBtn}>
                Login
              </button>
            </form>
            <p onClick={handleToggle} className={styles.toggleText}>
              Don't have an account? Sign up
            </p>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit}>
              <input
                className={styles.input}
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                className={styles.input}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="submit" className={styles.loginBtn}>
                Sign up
              </button>
            </form>
            <p onClick={handleToggle} className={styles.toggleText}>
              Login
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
