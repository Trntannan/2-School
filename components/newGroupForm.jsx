import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from 'prop-types';

const NewGroupForm = ({ map, mapsApi, setGroups }) => {
  const [form, setForm] = useState({
    groupName: "",
    schoolName: "",
    schoolLocation: "",
    meetupPoint: "",
    startTime: "",
  });

  const autocompleteRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchGroup = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/groups/${userId}`);
          setForm((prevForm) => ({ ...prevForm, ...response.data }));
        } catch (error) {
          console.error("Error retrieving group data", error);
        }
      }
    };

    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDnZFGBT7fBegTCG1unMndZ4eEV5pFEzfI&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    fetchGroup();
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        { types: ["geocode"] }
      );

      autocomplete.addListener("place_changed", handlePlaceChanged(autocomplete, "meetupPoint"));

      const searchBox = new window.google.maps.places.SearchBox(
        searchBoxRef.current
      );

      searchBox.addListener("places_changed", handleSearchBoxChanged(searchBox));
    }
  };

  const handlePlaceChanged = (autocomplete, field) => () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      setForm((prevForm) => ({ ...prevForm, [field]: `${location.lat()},${location.lng()}` }));
      new window.google.maps.Marker({
        position: location,
        map: map
      });
    }
  };

  const handleSearchBoxChanged = (searchBox) => () => {
    const places = searchBox.getPlaces();
    if (places.length === 0) return;

    const place = places[0];
    if (place.geometry) {
      const location = place.geometry.location;
      setForm((prevForm) => ({ ...prevForm, schoolLocation: `${location.lat()},${location.lng()}` }));
      new window.google.maps.Marker({
        position: location,
        map: map
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem("userId");

    const groupData = { ...form };

    try {
      const response = await axios.post("/api/groups", {
        userId,
        groupData,
      });

      setGroups((prevGroups) => [...prevGroups, response.data.group]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="groupName">Group Name:</label>
        <input
          type="text"
          id="groupName"
          name="groupName"
          value={form.groupName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="meetupPoint">Meetup/Start Point:</label>
        <input
          type="text"
          id="meetupPoint"
          name="meetupPoint"
          ref={autocompleteRef}
          defaultValue={form.meetupPoint}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="schoolName">School Name:</label>
        <input
          type="text"
          id="schoolName"
          name="schoolName"
          value={form.schoolName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="schoolLocation">School Location:</label>
        <input
          type="text"
          id="schoolLocation"
          name="schoolLocation"
          ref={searchBoxRef}
          defaultValue={form.schoolLocation}
          onChange={handleChange}
          required
        />
      </div>
      <div ref={map} style={{ height: "100px", width: "100%" }}></div>
      <div>
        <label htmlFor="startTime">Start Time:</label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Create Group</button>
    </form>
  );
};

NewGroupForm.propTypes = {
  map: PropTypes.object,
  mapsApi: PropTypes.object,
  setGroups: PropTypes.func.isRequired,
};

export default NewGroupForm;