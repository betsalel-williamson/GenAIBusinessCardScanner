import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileStatus {
  fileId: string;
  status: 'processing' | 'ready_for_review' | 'error';
  message?: string;
}

interface StatusContextType {
  statuses: Record<string, FileStatus>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [statuses, setStatuses] = useState<Record<string, FileStatus>>({});

  useEffect(() => {
    const eventSource = new EventSource('/api/status');

    eventSource.onmessage = (event) => {
      const newStatus: FileStatus = JSON.parse(event.data);
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [newStatus.fileId]: newStatus,
      }));
    };

    eventSource.onerror = () => {
      // Handle error, maybe set a global error state
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <StatusContext.Provider value={{ statuses }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};
