import { useState, useEffect } from "react";

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [formData, setFormData] = useState({ name: "", location: "", p_description: "", image_url: "", category: "" });
  const [editingId, setEditingId] = useState(null);

  // Load from localStorage on first render
  useEffect(() => {
    const storedPlaces = localStorage.getItem("places");
    if (storedPlaces) {
      setPlaces(JSON.parse(storedPlaces));
    } else {
      setPlaces([]);
    }
  }, []);

  // Save to localStorage whenever places change
  useEffect(() => {
    localStorage.setItem("places", JSON.stringify(places));
  }, [places]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing place
      setPlaces((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...formData } : p))
      );
      setEditingId(null);
    } else {
      // Add new place
      const newPlace = {
        id: Date.now(),
        ...formData,
      };
      setPlaces((prev) => [...prev, newPlace]);
    }

    setFormData({ name: "", location: "", p_description: "", image_url: "", image_url: "", category: "" });
  };

  const handleEdit = (place) => {
    setEditingId(place.id);
    setFormData({
      name: place.name,
      location: place.location,
      p_description: place.p_description,
      image_url: place.image_url,
      category: place.category,
    });
  };

  const handleDelete = (id) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-8 bg-gray-100 max-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-semibold mb-8">Manage Places</h1>

        {/* Add / Edit Place Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-20"
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
            name="p_description"
            placeholder="Description"
            value={formData.p_description}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
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
            className="col-span-1 md:col-span-6 bg-blue-600 text-center text-white rounded-md py-2 hover:bg-blue-700"
          >
            {editingId ? "Update Place" : "Add Place"}
          </button>
        </form>

        {/* Places Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-4">Name</th>
              <th className="border-b p-4">Location</th>
              <th className="border-b p-4">Description</th>
              <th className="border-b p-4">Image URL</th>
              <th className="border-b p-4">Category</th>
              <th className="border-b p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {places.map((place) => (
              <tr key={place.id}>
                <td className="border-b p-4">{place.name}</td>
                <td className="border-b p-4">{place.location}</td>
                <td className="border-b p-4">{place.p_description}</td>
                <td className="border-b p-4">{place.image_url}</td>
                <td className="border-b p-4">{place.category}</td>
                <td className="border-b p-4 text-center space-x-4">
                  <button
                    onClick={() => handleEdit(place)}
                    className="bg-yellow-500 text-white px-8 py-1 rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(place.id)}
                    className="bg-red-600 text-white px-8 py-1 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {places.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6">
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
