import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'barter_initiated' | 'message' | 'match' | 'accepted' | 'completed' | 'review' | 'bb_earned' | 'tier_up';

export type AppNotification = {
  id: string;
  type: NotificationType;
  icon: string;
  senderName: string;
  text: string;
  time: string;
  period: 'today' | 'week' | 'earlier';
  read: boolean;
};

const INITIAL: AppNotification[] = [
  { id: 'n1', type: 'barter_initiated', icon: '👩', senderName: 'Lisa', text: 'Lisa has initiated a barter! Check it!', time: '2m ago', period: 'today', read: false },
  { id: 'n2', type: 'message', icon: '👩‍🦱', senderName: 'Charlese', text: 'Charlese sent you a message!', time: '28m ago', period: 'today', read: false },
  { id: 'n3', type: 'barter_initiated', icon: '👩', senderName: 'Lisa', text: 'Lisa has initiated a barter! Check it!', time: 'Mon', period: 'week', read: true },
  { id: 'n4', type: 'barter_initiated', icon: '👩‍🦰', senderName: 'Shauna', text: 'Shauna has initiated a barter! Check it!', time: 'Mon', period: 'week', read: true },
  { id: 'n5', type: 'barter_initiated', icon: '🧑', senderName: 'Rogan', text: 'Rogan has initiated a barter! Check it!', time: 'Sun', period: 'week', read: true },
  { id: 'n6', type: 'bb_earned', icon: 'bb', senderName: 'System', text: 'You earned 2 Barter Bucks for completing a barter!', time: 'Sat', period: 'week', read: true },
  { id: 'n7', type: 'tier_up', icon: '🏆', senderName: 'System', text: 'You leveled up to Trader tier!', time: 'Fri', period: 'week', read: true },
  { id: 'n8', type: 'match', icon: '💇', senderName: 'Aaliyah', text: "It's a match! You and Aaliyah both liked each other!", time: 'Last week', period: 'earlier', read: true },
  { id: 'n9', type: 'accepted', icon: '👨‍🍳', senderName: 'Carlos', text: 'Carlos accepted your barter offer!', time: 'Last week', period: 'earlier', read: true },
];

type NotificationsContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearSection: (period: 'today' | 'week' | 'earlier') => void;
};

const NotificationsContext = createContext<NotificationsContextType>({} as NotificationsContextType);

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearSection = useCallback((period: 'today' | 'week' | 'earlier') => {
    setNotifications((prev) => prev.filter((n) => n.period !== period));
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, clearSection }}>
      {children}
    </NotificationsContext.Provider>
  );
}
