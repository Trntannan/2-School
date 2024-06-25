// pages/groups.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/groups.module.css';

const Groups = () => {
  const [fullScreen, setFullScreen] = useState(false);
  const [groups, setGroups] = useState([
    { id: 1, name: 'Morning Walk', status: 'active' },
    { id: 2, name: 'Evening Stroll', status: 'created' },
    { id: 3, name: 'School Friends', status: 'pending' }
  ]);

  const toggleFullScreen = () => setFullScreen(!fullScreen);

  return (
    <div className={styles.groupsPage}>
      <div className="page-header">
        <h1>Groups</h1>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.mapContainer}>
          <MapContainer 
            center={[7.2905715, 80.6337262]} 
            zoom={13} 
            scrollWheelZoom={false} 
            className={fullScreen ? styles.mapFullScreen : styles.map}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
        <div className={styles.groupsList}>
          <h2>Active Groups</h2>
          <ul>
            {groups.map(group => (
              <li key={group.id} className={styles.groupItem}>
                <span className={group.status === 'active' ? styles.green : group.status === 'created' ? styles.grey : styles.yellow}></span>
                {group.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Groups;