import React from 'react';
import App from 'next/app';
import axios from 'axios';
import Link from 'next/link';
import '../styles/globals.css';

class MyApp extends App {
  state = {
    dropdownOpen: false,
  };

  toggleDropdown = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  };

  closeDropdown = () => {
    this.setState({ dropdownOpen: false });
  };

  componentDidMount() {
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <>
        <nav>
          <button onClick={this.toggleDropdown} className="dropbtn">Nav</button>
          {dropdownOpen && (
            <div className="dropdown-content">
              <Link href="/" onClick={this.closeDropdown}>Home</Link>
              <Link href="/userProfile" onClick={this.closeDropdown}>Profile</Link>
              <Link href="/groups" onClick={this.closeDropdown}>Groups</Link>
            </div>
          )}
        </nav>
        <Component {...pageProps} />
      </>
    );
  }
}

export default MyApp;
