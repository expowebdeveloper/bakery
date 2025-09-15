import React, { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  // Load profile from localStorage on component mount
  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Update localStorage whenever the profile changes
  const updateProfile = (data) => {
    setProfile(data);
    localStorage.setItem("userProfile", JSON.stringify(data));
  };

  console.log(profile, "profile context");
  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
