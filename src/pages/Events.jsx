import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [formData, setFormData] = useState({
    e_name: "",
    e_description: "",
    image_url: "",
    start_date: "",
    end_date: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    dateRange: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch all events from Supabase
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch events: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters whenever filters or events change
  useEffect(() => {
    let result = events;

    if (filters.name) {
      result = result.filter((event) =>
        event.e_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.dateRange) {
      const today = new Date();

      switch (filters.dateRange) {
        case "today":
          result = result.filter(
            (event) =>
              new Date(event.start_date).toDateString() === today.toDateString()
          );
          break;
        case "upcoming":
          result = result.filter((event) => new Date(event.start_date) > today);
          break;
        case "past":
          result = result.filter((event) => new Date(event.end_date) < today);
          break;
        default:
          break;
      }
    }

    setFilteredEvents(result);
  }, [filters, events]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload directly to Supabase Storage
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  try {
    // Optional: Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      setUploading(false);
      return;
    }

    // Create unique file name
    const fileName = `${Date.now()}_${file.name}`;

  const { data: publicData, error: urlError } = supabase.storage
      .from('jaffnaexplore')
      .getPublicUrl(fileName);

  if (urlError) throw urlError;

  const publicUrl = publicData.publicUrl;
    

    // Save the public URL in form data
    setFormData((prev) => ({ ...prev, image_url: publicUrl }));
    toast.success("Image uploaded successfully!");
  } catch (err) {
    console.error("Image upload error:", err);
    toast.error("Image upload failed: " + err.message);
  } finally {
    setUploading(false);
  }
};
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({ name: "", dateRange: "" });
  };

  const resetForm = () => {
    setFormData({
      e_name: "",
      e_description: "",
      image_url: "",
      start_date: "",
      end_date: "",
    });
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setFormData({
      e_name: event.e_name,
      e_description: event.e_description,
      image_url: event.image_url,
      start_date: event.start_date.split("T")[0],
      end_date: event.end_date ? event.end_date.split("T")[0] : "",
    });
    setEditingId(event.event_id);
    setIsFormVisible(true);
    document
      .getElementById("event-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (event_id) => {
    const eventName = events.find((e) => e.event_id === event_id)?.e_name;
    if (
      window.confirm(
        `Are you sure you want to delete "${eventName}"? This action cannot be undone.`
      )
    ) {
      setLoading(true);
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("event_id", event_id);
      if (error) {
        console.error("Error deleting event:", error.message);
        toast.error("Failed to delete event: " + error.message);
      } else {
        setEvents((prev) => prev.filter((e) => e.event_id !== event_id));
        toast.success(`"${eventName}" deleted successfully!`);
      }
      setLoading(false);
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    if (editingId && !isFormVisible) resetForm();
  };

  const toggleTableVisibility = () => setIsTableVisible(!isTableVisible);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isEventOngoing = (event) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : start;
    return now >= start && now <= end;
  };

  const isEventUpcoming = (event) => new Date(event.start_date) > new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.e_name || !formData.e_description || !formData.image_url) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    if (formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error("End date must be after start date.");
      return;
    }

    setLoading(true);
    try {
      if (editingId !== null) {
        // Update
        const { data, error } = await supabase
          .from("events")
          .update({
            e_name: formData.e_name,
            e_description: formData.e_description,
            image_url: formData.image_url,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
          })
          .eq("event_id", editingId)
          .select();

        if (error) throw error;

        setEvents((prev) =>
          prev.map((e) => (e.event_id === editingId ? data[0] : e))
        );
        toast.success("Event updated successfully!");
        resetForm();
      } else {
        // Insert
        const { data, error } = await supabase
          .from("events")
          .insert([
            {
              e_name: formData.e_name,
              e_description: formData.e_description,
              image_url: formData.image_url,
              start_date: formData.start_date,
              end_date: formData.end_date || null,
            },
          ])
          .select();

        if (error) throw error;
        setEvents((prev) => [data[0], ...prev]);
        toast.success("Event added successfully!");
        resetForm();
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit event: " + err.message);
    } finally {
      setLoading(false);
      setIsFormVisible(false);
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Events Management</h1>
          <p className="text-purple-100">Add, edit, and manage your events</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Toggle Form Button */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Events Calendar
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleFormVisibility}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isFormVisible ? "▲" : "▼"}</span>
                {isFormVisible ? "Hide Form" : "Add New Event"}
              </button>
              <button
                onClick={toggleTableVisibility}
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isTableVisible ? "▲" : "▼"}</span>
                {isTableVisible ? "Hide Events" : "View All Events"}
              </button>
            </div>
          </div>

          {/* Add / Edit Event Form */}
          {isFormVisible && (
            <form
              id="event-form"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-purple-50 p-6 rounded-xl border border-purple-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                {editingId
                  ? `Editing Event: ${formData.e_name}`
                  : "Add New Event"}
              </h3>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="e_name"
                  placeholder="Enter event name"
                  value={formData.e_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="e_description"
                  placeholder="Enter event description"
                  value={formData.e_description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image *
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    disabled={uploading || loading}
                  />
                  <div className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                  </div>
                </div>

                {/* Show upload status */}
                {uploading && (
                  <div className="mt-2 flex items-center text-sm text-purple-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    Uploading image...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Image Preview */}
              {formData.image_url && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <div className="h-40 w-full border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/300x150?text=Invalid+Image+URL")
                      }
                    />
                  </div>
                </div>
              )}

              <div className="col-span-full flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors flex items-center"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : editingId !== null ? (
                    "Update Event"
                  ) : (
                    "Add Event"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    if (editingId) setIsFormVisible(false);
                  }}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
                  disabled={loading || uploading}
                >
                  {editingId !== null ? "Cancel Edit" : "Clear Form"}
                </button>
              </div>

              <div className="col-span-full text-xs text-gray-500 mt-2">
                <p>
                  * Required fields. End date must be after start date if
                  provided.
                </p>
              </div>
            </form>
          )}

          {/* Filter Section - Only shown when table is visible */}
          {isTableVisible && (
            <div className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-xl border border-pink-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Search by name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  >
                    <option value="">All Events</option>
                    <option value="today">Today</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Events</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="mt-4 text-sm text-pink-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Showing {filteredEvents.length} of {events.length} events
              </div>
            </div>
          )}

          {/* Events List - Only shown when table is visible */}
          {isTableVisible &&
            (loading && !events.length ? (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      {events.length === 0
                        ? "No events yet"
                        : "No matching events found"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {events.length === 0
                        ? "Get started by adding your first event!"
                        : "Try adjusting your filters"}
                    </p>
                    {events.length === 0 && (
                      <button
                        onClick={() => setIsFormVisible(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Add Your First Event
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Event
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Dates
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">
                            Description
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="p-4 text-center text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEvents.map((event) => (
                          <tr
                            key={event.event_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                  <img
                                    src={event.image_url}
                                    alt={event.e_name}
                                    className="h-full w-full object-cover"
                                    onError={(e) =>
                                      (e.target.src =
                                        "https://via.placeholder.com/64x48?text=Image+Error")
                                    }
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">
                                    {event.e_name}
                                  </div>
                                  <div className="text-sm text-gray-500 md:hidden line-clamp-2">
                                    {event.e_description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-700">
                              <div>{formatDate(event.start_date)}</div>
                              {event.end_date &&
                                event.end_date !== event.start_date && (
                                  <div>to {formatDate(event.end_date)}</div>
                                )}
                            </td>
                            <td className="p-4 text-sm text-gray-700 hidden md:table-cell">
                              <div className="line-clamp-2">
                                {event.e_description}
                              </div>
                            </td>
                            <td className="p-4">
                              {isEventOngoing(event) ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Ongoing
                                </span>
                              ) : isEventUpcoming(event) ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Upcoming
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Past
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(event)}
                                  className="text-purple-600 hover:text-purple-800 transition-colors p-1 rounded-md hover:bg-purple-50"
                                  title="Edit"
                                  disabled={loading}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 极速2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(event.event_id)}
                                  className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50"
                                  title="Delete"
                                  disabled={loading}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="极速0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7极速h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
