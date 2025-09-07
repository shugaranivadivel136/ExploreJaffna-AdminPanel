import { useState, useEffect } from "react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    event_name: "",
    eve_description: "",
    eveImage_url: "",
    start_date: "",
    end_date: "",
    created_at: "",

  });
  const [editingId, setEditingId] = useState(null);

  // Load from localStorage on first render
  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      // Optional: initial default events
      setEvents([]);
    }
  }, []);

  // Save to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing event
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingId ? { ...ev, ...formData } : ev
        )
      );
      setEditingId(null);
    } else {
      // Add new event
      const newEvent = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    // Reset form
    setFormData({
      event_name: "",
      eve_description: "",
      eveImage_url: "",
      start_date: "",
      end_date: "",
      created_at: "",
    });
  };

  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setFormData({
      event_name: ev.event_name,
      eve_description: ev.eve_description,
      eveImage_url: ev.eveImage_url,
      start_date: ev.start_date,
      end_date: ev.end_date,
      created_at: ev.created_at,
    });
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Manage Events</h1>

        {/* Add / Edit Event Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <input
            type="text"
            name="event_name"
            placeholder="Event Name"
            value={formData.event_name}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="eve_description"
            placeholder="Event Description"
            value={formData.eve_description}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="eveImage_url"
            placeholder="Image URL"
            value={formData.eveImage_url}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="created_at"
            placeholder="Created At"
            value={formData.created_at}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
          >
            {editingId ? "Update Event" : "Add Event"}
          </button>
        </form>

        {/* Events Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-4">Event Name</th>
              <th className="border-b p-4">Description</th>
              <th className="border-b p-4">Image</th>
              <th className="border-b p-4">Start</th>
              <th className="border-b p-4">End</th>
              <th className="border-b p-4">Created At</th>
              <th className="border-b p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td className="border-b p-2">{ev.event_name}</td>
                <td className="border-b p-2">{ev.eve_description}</td>
                <td className="border-b p-2">
                  <img
                    src={ev.eveImage_url}
                    alt={ev.event_name}
                    className="h-12 w-20 object-cover rounded"
                  />
                </td>
                <td className="border-b p-2">{ev.start_date}</td>
                <td className="border-b p-2">{ev.end_date}</td>
                <td className="border-b p-2">{ev.location}</td>
                <td className="border-b p-2 text-sm text-gray-500">
                  {new Date(ev.created_at).toLocaleString()}
                </td>
                <td className="border-b p-2 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(ev)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-4">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Events;
