import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [formData, setFormData] = useState({
    p_name: "",
    latitude: "",
    longitude: "",
    p_description: "",
    image_url: "",
    category_name: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all places from Supabase
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*");
    if (error) {
      console.error("Error fetching places:", error.message);
    } else {
      setPlaces(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Add or update place
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.p_name || !formData.latitude || !formData.longitude || !formData.p_description || !formData.image_url || !formData.category_name) {
      alert("Please fill in all fields.");
      return;
    }

    if (editingId !== null) {
      // update existing place
      const { data, error } = await supabase
        .from("places")
        .update({
          p_name: formData.p_name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          p_description: formData.p_description,
          image_url: formData.image_url,
          category_name: formData.category_name
        })
        .eq("place_id", editingId)
        .select();

      // Optimistically update UI
      /*const fromData = { ...formData, place_id: editingId };
        setPlaces((prev) =>
        prev.map((place) =>
            place.place_id === editingId ? { ...place, ...fromData } : place
        )
      );
      setEditingId(true); */ //reset editing state

        if (error) {
          console.error("Error updating place:", error.message);
          alert("Failed to update place: "+error.message);
        }
        //Replace in table without reloading everything
        setPlaces((prev) =>
          prev.map((place) =>
            place.place_id === editingId ? { ...place, ...data[0] } : place)
        );

        setEditingId(null);
        await fetchPlaces();
    } else {
      // insert new place
      const { data, error } = await supabase
      .from("places")
      .insert([
        {
          p_name: formData.p_name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          p_description: formData.p_description,
          image_url: formData.image_url,
          category_name: formData.category_name,
          
        }
      ]).select();

      if (error) {
        console.error("Error adding place:", error.message);
        alert("Failed to add place: "+error.message);
      } else {
        setPlaces((prev) => [...prev, ...data]);

        // clear form
        setFormData({
          p_name: "",
          latitude: "",
          longitude: "",
          p_description: "",
          image_url: "",
          category_name: ""
        });
      }
    }
    setEditingId(place_id);
  };

  // Edit button handler
  const handleEdit = (place) => {
    const p = places.find((x) => x.place_id === place.place_id);
    if (!p) return;
    setFormData({
      p_name: place.p_name,
      latitude: place.latitude,
      longitude: place.longitude,
      p_description: place.p_description,
      image_url: place.image_url,
      category_name: place.category_name
    });
    setEditingId(place.place_id);
  };

  // Delete place
  const handleDelete = async (id) => {
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) {
      console.error("Error deleting place:", error.message);
      alert("Failed to delete place.");
    } else {
      await fetchPlaces();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 bg-gray-100 max-h-screen">
      <div className="max-w-full mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-semibold mb-8">Manage Places</h1>

        {/* Add / Edit Place Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-20"
        >
          <input
            type="text"
            name="p_name"
            placeholder="Name"
            value={formData.p_name}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded-md px-3 py-2"
            required
          />
          <input
            type="double precision"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded-md px-3 py-2"
            required
          />
          <input
            type="double precision"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="p_description"
            placeholder="Description"
            value={formData.p_description}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            name="category_name"
            placeholder="Category"
            value={formData.category_name}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded-md px-3 py-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-center text-white rounded-md py-2 hover:bg-blue-700"
          >
            {editingId ? "Update Place" : "Add Place"}
          </button>
        </form>

        {/* Places Table */}
        {/*loading ? (
          <p>Loading places...</p>
        ) : (*/}
          <table className="w-full text-left border-collapse border-gray-300">
            <thead>
              <tr>
                <th className="border p-4">Name</th>
                <th className="border p-4">Latitude</th>
                <th className="border p-4">Longitude</th>
                <th className="border p-4">Description</th>
                <th className="border p-4">Image</th>
                <th className="border p-4">Category</th>
                <th className="border p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.place_id}>
                  <td className="border p-4">{place.p_name}</td>
                  <td className="border p-4">{place.latitude}</td>
                  <td className="border p-4">{place.longitude}</td>
                  <td className="border p-4">{place.p_description}</td>
                  <td className="border p-4">
                    <img
                      src={place.image_url}
                      alt={place.p_name}
                      className="h-12 w-20 object-cover rounded"
                    />
                  </td>
                  <td className="border-b p-4">{place.category_name}</td>
                  <td className="border-b p-4 text-center space-x-4">
                    <button
                      onClick={() => handleEdit(place)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {places.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-6">
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
