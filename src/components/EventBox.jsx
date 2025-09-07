import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EventsBox({ limit = null }) {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // TODO: Replace with your real backend API URL
        const response = await fetch("");
        const data = await response.json();

        // Filter upcoming events
        const today = new Date();
        let upcoming = data.filter((event) => new Date(event.date) >= today);

        // Sort by soonest first
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Apply limit if provided
        if (limit) {
          upcoming = upcoming.slice(0, limit);
        }

        setEvents(upcoming);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();
  }, [limit]);

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Upcoming Events</h2>
        <button
          onClick={() => navigate("/dashboard/events")}
          className="hover:text-blue-600 transition-colors"
          title="Go to Events Page"
        >
          <Calendar size={18} />
        </button>
      </div>
      <ul className="space-y-2">
        {events.length > 0 ? (
          events.map((event) => (
            <li
              key={event.id}
              className="flex justify-between text-sm text-gray-700"
            >
              <span className="font-medium">{event.name}</span>
              <span className="text-gray-500">
                {new Date(event.date).toLocaleDateString()}
              </span>
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-400">No upcoming events</li>
        )}
      </ul>
    </div>
  );
}
