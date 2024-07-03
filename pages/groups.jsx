import React, { useState, useEffect } from "react";
import GoogleMapReact from 'google-map-react';
import styles from "../styles/groups.module.css";
import NewGroupForm from "../components/newGroupForm";
import axios from "axios";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [map, setMap] = useState(null);
  const [mapsApi, setMapsApi] = useState(null);
  const [directionRenderers, setDirectionRenderers] = useState([]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        // Handle missing user ID
        return;
      }

      try {
        const response = await axios.get(`/api/groups/${userId}`);
        if (response.data.groups) {
          setGroups(response.data.groups);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };

    fetchUserGroups();
  }, []);

  const handleNewGroup = () => {
    setShowNewGroupForm(true);
  };

  const handleCloseForm = () => {
    setShowNewGroupForm(false);
  };

  const renderDirections = (map, mapsApi, group) => {
    const { meetupPoint, schoolLocation } = group;
    const directionsService = new mapsApi.DirectionsService();
    const directionsRenderer = new mapsApi.DirectionsRenderer();

    directionsRenderer.setMap(map);

    directionsService.route({
      origin: meetupPoint,
      destination: schoolLocation,
      travelMode: 'WALKING'
    }, (result, status) => {
      if (status === mapsApi.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        setDirectionRenderers(prevState => [...prevState, directionsRenderer]);
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });
  };

  const apiIsLoaded = (map, mapsApi) => {
    setMap(map);
    setMapsApi(mapsApi);
    groups.forEach(group => renderDirections(map, mapsApi, group));
  };

  return (
    <div className={styles.groupsPage}>
      <div className="page-header">
        <h1>Groups</h1>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.mapContainer}>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: "AIzaSyDnZFGBT7fBegTCG1unMndZ4eEV5pFEzfI",
            }}
            defaultCenter={{ lat: -36.892057, lng: 174.618656 }}
            defaultZoom={10}
            className={styles.map}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps)}
          />
        </div>
        <div className={styles.groupsList}>
          <div className={styles.groupsHeader}>
            <h2 className={styles.userGroups}>Active Groups</h2>

            <button
              className={styles.addGroupButton}
              onClick={handleNewGroup}></button>
            <button className={styles.addGroupButton} onClick={handleNewGroupClick}>
              +
            </button>
          </div>
          <ul>
            {groups.map((group, index) => (
              <li key={index} className={styles.groupItem}>
                <span className={styles[group.status]}></span>
                {group.groupName}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showNewGroupForm && (
        <div className={styles.overlay}>
          <div className={styles.formContainer}>
            <button className={styles.closeButton} onClick={handleCloseForm}>
              X
            </button>
            <NewGroupForm map={map} mapsApi={mapsApi} setGroups={setGroups} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;