// Custom event system for notification count updates
export const NOTIFICATION_EVENTS = {
  UPDATE_COUNT: 'updateNotificationCount',
  MARK_READ: 'markMessagesAsRead'
};

export const emitNotificationUpdate = (count) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENTS.UPDATE_COUNT, { 
      detail: { count } 
    }));
  }
};

export const listenToNotificationUpdates = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleUpdate = (event) => {
    callback(event.detail.count);
  };
  
  window.addEventListener(NOTIFICATION_EVENTS.UPDATE_COUNT, handleUpdate);
  
  return () => {
    window.removeEventListener(NOTIFICATION_EVENTS.UPDATE_COUNT, handleUpdate);
  };
};