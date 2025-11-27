import React, { createContext, useContext } from 'react';

const RideBookingContext = createContext();

export const RideBookingProvider = ({ children }) => {
    return (
        <RideBookingContext.Provider value={{}}>
            {children}
        </RideBookingContext.Provider>
    );
};

export const useRideBookingContext = () => useContext(RideBookingContext);
