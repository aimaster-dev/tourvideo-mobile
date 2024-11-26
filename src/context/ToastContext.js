import React, {createContext, useState, useContext} from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({children}) => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success', // You can add types like 'error', 'info', etc.
  });

  const showToast = (message, type = 'success') => {
    setToast({show: true, message, type});
    setTimeout(() => setToast({...toast, show: false}), 3000); // Auto-hide after 3 seconds
  };

  return (
    <ToastContext.Provider value={{toast, showToast}}>
      {children}
    </ToastContext.Provider>
  );
};
