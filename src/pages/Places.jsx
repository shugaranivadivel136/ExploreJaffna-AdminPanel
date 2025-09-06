import { useState } from "react";

const Places = () => {
  const [places, setPlaces] = useState([
    { id: 1, name: "Jaffna Fort", location: "Jaffna", category: "Historical" },
    { id: 2, name: "Nallur Kandaswamy Temple", location: "Jaffna", category: "Religious" },
  ]);

  const [formData, setFormData] = useState({ name: "", location: "", category: "" });
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing place
      setPlaces(
        places.map((p) => (p.id === editingId ? { ...p, ...formData } : p))
      );
      setEditingId(null);
    } else {
      // Add new place
      const newPlace = {
        id: Date.now(),
        ...formData,
      };
      setPlaces([...places, newPlace]);
    }

    setFormData({ name: "", location: "", category: "" });
  };

  const handleEdit = (place) => {
    setEditingId(place.id);
    setFormData({ name: place.name, location: place.location, category: place.category });
  };

  const handleDelete = (id) => {
    setPlaces(places.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Manage Places</h1>

        {/* Add / Edit Place Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <input
            type="text"
            name="name"
            placeholder="Place Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
          >
            {editingId ? "Update Place" : "Add Place"}
          </button>
        </form>

        {/* Places Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">Name</th>
              <th className="border-b p-2">Location</th>
              <th className="border-b p-2">Category</th>
              <th className="border-b p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {places.map((places) => (
              <tr key={places.id}>
                <td className="border-b p-2">{places.name}</td>
                <td className="border-b p-2">{places.location}</td>
                <td className="border-b p-2">{places.category}</td>
                <td className="border-b p-2 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(places)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(places.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {places.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 py-4"
                >
                  No places found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Places;