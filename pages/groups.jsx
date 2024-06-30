import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/groups.module.css';

const Groups = () => {
  const [groups, setGroups] = useState([
    { id: 1, name: 'Morning Walk', status: 'active' },
    { id: 2, name: 'Evening Stroll', status: 'created' },
    { id: 3, name: 'School Friends', status: 'pending' }
  ]);

  const handleNewGroupClick = () => {
    // Implement logic to show/create a form for new group here
    console.log("Create new group form should open.");
  };

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
            className={styles.map}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
        <div className={styles.groupsList}>
          <div className={styles.groupsHeader}>
            <h2 className={styles.activeGroups}>Active Groups</h2>
            <button className={styles.addGroupButton} onClick={handleNewGroupClick}>
              +
            </button>
          </div>
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
