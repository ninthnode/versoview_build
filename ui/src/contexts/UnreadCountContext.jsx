"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import get from "@/app/utils/get";

const UnreadCountContext = createContext();

const unreadReducer = (state, action) => {
  switch (action.type) {
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        [action.channelId]: action.count
      };
    case 'CLEAR_UNREAD_COUNT':
      return {
        ...state,
        [action.channelId]: 0
      };
    case 'REMOVE_CHANNEL':
      const newState = { ...state };
      delete newState[action.channelId];
      return newState;
    case 'RESET_ALL':
      return {};
    default:
      return state;
  }
};

export const UnreadCountProvider = ({ children }) => {
  const [unreadCounts, dispatch] = useReducer(unreadReducer, {});

  const fetchUnreadCount = useCallback(async (channelId) => {
    if (!channelId) return 0;

    try {
      const response = await get(`post/getAllUnreadPost/${channelId}`);
      const count = response.data?.length || 0;
      dispatch({ type: 'SET_UNREAD_COUNT', channelId, count });
      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }, []);

  const setAsRead = useCallback(async (channelId) => {
    if (!channelId) return;

    try {
      await get(`post/setReadPost/${channelId}`);
      dispatch({ type: 'CLEAR_UNREAD_COUNT', channelId });
      // Refresh count to ensure accuracy
      setTimeout(async () => {
        try {
          await fetchUnreadCount(channelId);
        } catch (error) {
          console.error('Error refreshing unread count:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error setting post as read:', error);
    }
  }, [fetchUnreadCount]);

  const removeChannel = useCallback((channelId) => {
    dispatch({ type: 'REMOVE_CHANNEL', channelId });
  }, []);

  const resetAllCounts = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const getUnreadCount = useCallback((channelId) => {
    return unreadCounts[channelId] || 0;
  }, [unreadCounts]);

  const value = {
    unreadCounts,
    fetchUnreadCount,
    setAsRead,
    removeChannel,
    resetAllCounts,
    getUnreadCount
  };

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  );
};

export const useUnreadCount = () => {
  const context = useContext(UnreadCountContext);
  if (!context) {
    throw new Error('useUnreadCount must be used within an UnreadCountProvider');
  }
  return context;
};