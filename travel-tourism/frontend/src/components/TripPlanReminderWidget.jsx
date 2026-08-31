import React, { useState, useEffect } from 'react';
import { Bell, X, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const TripPlanReminderWidget = () => {
  const [activeReminder, setActiveReminder] = useState(null);
  const [dismissedReminders, setDismissedReminders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissedReminders') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Request Browser Notification Permission gracefully on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const checkUpcomingPlan = () => {
    try {
      const storedPlanStr = localStorage.getItem('currentItinerary');
      if (!storedPlanStr) return;

      const planData = JSON.parse(storedPlanStr);
      const itinerary = planData.itinerary || [];
      if (!Array.isArray(itinerary) || itinerary.length === 0) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const nowInMinutes = currentHour * 60 + currentMin;

      // Extract activities from itinerary slots
      const allActivities = [];

      itinerary.forEach((dayItem) => {
        ['morning', 'afternoon', 'evening'].forEach((slot) => {
          const slotText = dayItem[slot];
          if (slotText) {
            // Extract Place Name
            const placeMatch = slotText.match(/📍 Place:\s*([^|]+)/i) || slotText.match(/📍\s*([^|]+)/i);
            const placeName = placeMatch ? placeMatch[1].trim() : 'Planned Destination';

            // Extract Visit Time
            const timeMatch = slotText.match(/🕒 Perfect Time:\s*([^|]+)/i) || slotText.match(/🕒\s*([^|]+)/i);
            const timeStr = timeMatch ? timeMatch[1].trim() : (slot === 'morning' ? '10:00 AM' : slot === 'afternoon' ? '1:30 PM' : '5:45 PM');

            // Parse approximate hour in 24h
            let hour24 = 10;
            if (slot === 'morning') hour24 = 10;
            else if (slot === 'afternoon') hour24 = 13.5;
            else if (slot === 'evening') hour24 = 17.75;

            const timeMatchDigits = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
            if (timeMatchDigits) {
              let h = parseInt(timeMatchDigits[1]);
              const m = parseInt(timeMatchDigits[2] || '0');
              const ampm = timeMatchDigits[3] ? timeMatchDigits[3].toUpperCase() : null;
              if (ampm === 'PM' && h < 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              hour24 = h + m / 60;
            }

            const activityMinutes = Math.round(hour24 * 60);
            const diffMinutes = activityMinutes - nowInMinutes;

            allActivities.push({
              id: `${planData.title || 'trip'}-day${dayItem.day}-${slot}-${placeName}`,
              day: dayItem.day,
              slot,
              placeName,
              timeStr,
              activityMinutes,
              diffMinutes
            });
          }
        });
      });

      // Filter upcoming activities that start in roughly 1 hour (between -15 and 90 mins, or next upcoming)
      const upcoming = allActivities
        .filter(act => act.diffMinutes > -30) // not way past
        .sort((a, b) => a.diffMinutes - b.diffMinutes);

      if (upcoming.length > 0) {
        const nextAct = upcoming[0];

        // Check if already dismissed
        if (!dismissedReminders.includes(nextAct.id)) {
          setActiveReminder(nextAct);

          // Browser Notification API
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`🔔 Trip Plan Reminder: ${nextAct.placeName}`, {
                body: `Your planned activity at ${nextAct.placeName} (${nextAct.timeStr}) starts in about 1 hour.`,
                icon: '/vite.svg'
              });
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error('Trip plan reminder check error:', err);
    }
  };

  useEffect(() => {
    checkUpcomingPlan();
    const interval = setInterval(checkUpcomingPlan, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, [dismissedReminders]);

  const handleDismiss = () => {
    if (activeReminder) {
      const updated = [...dismissedReminders, activeReminder.id];
      setDismissedReminders(updated);
      localStorage.setItem('dismissedReminders', JSON.stringify(updated));
      setActiveReminder(null);
    }
  };

  if (!activeReminder) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-black text-white p-4 rounded-2xl shadow-2xl border-2 border-blue-400/40 relative space-y-2">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition p-1 rounded-lg bg-white/10"
          title="Dismiss Reminder"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-yellow-400 font-extrabold text-xs uppercase tracking-wider">
          <Bell className="w-4 h-4 animate-ring" />
          <span>Trip Plan Reminder</span>
        </div>

        <div className="font-bold text-sm text-white">
          Your next travel plan is coming up!
        </div>

        <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-xs space-y-1.5 backdrop-blur-sm">
          <div className="flex items-center text-blue-200 font-bold text-sm">
            <MapPin className="w-4 h-4 mr-1.5 text-emerald-400 flex-shrink-0" />
            <span>{activeReminder.placeName}</span>
          </div>

          <div className="flex items-center text-gray-300">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-yellow-300 flex-shrink-0" />
            <span>Scheduled: <b>{activeReminder.timeStr}</b></span>
          </div>

          <div className="text-[11px] text-emerald-300 font-semibold pt-1">
            ⏱️ Starts in about 1 hour (Day {activeReminder.day})
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-md"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge & Dismiss
        </button>
      </div>
    </div>
  );
};

export default TripPlanReminderWidget;
