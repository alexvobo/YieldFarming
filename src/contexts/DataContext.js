import React, { useState, useContext, useEffect } from "react";

const DataContext = React.createContext();
const DataUpdateContext = React.createContext();
export function useData() {
  return useContext(DataContext);
}
export function useDataUpdate() {
  return useContext(DataUpdateContext);
}
export function DataProvider({ children }) {

  //States that will be accessed in this context
  const [data, setData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const API_URL = "";

  // Toggling this will trigger data refresh
  function toggleUpdate() {
    setDataLoaded((loaded) => !loaded);
  }
  // Fetch data from our API when dataLoaded is toggled
  useEffect(() => {
    fetch(API_URL + "")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      })
      .catch((error) => console.log(error));

    fetch(API_URL + "")
      .then((res) => res.json())
      .then((d) => {
       // more operations here
      })
      .catch((error) => console.log(error));

    //If adding more operations, add state here for validation
    if (data) {
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  const value = {
    data: data,
    loaded: dataLoaded,
    API_URL: API_URL,
  };

  return (
    <DataContext.Provider value={value}>
      <DataUpdateContext.Provider value={toggleUpdate}>
        {dataLoaded && children}
      </DataUpdateContext.Provider>
    </DataContext.Provider>
  );
}
