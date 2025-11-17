import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [formData, setFormData] = useState({
    p_name: "",
    p_description: "",
    category_name: "",
    image_url: "",
    latitude: "",
    longitude: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    category_name: "",
    name: ""
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch all places
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*");

    if (error) {
      console.error("Error fetching places:", error.message);
      toast.error("Failed to fetch places: " + error.message);
      setLoading(false);
      return;
    }
    setPlaces(data || []);
    setFilteredPlaces(data || []);
    // Extract unique categories
    const uniqueCategories = [...new Set(data.map(place => place.category_name))];
    setCategories(uniqueCategories);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = places;
    if (filters.category_name) {
      result = result.filter((place) =>
        place.category_name.toLowerCase().includes(filters.category_name.toLowerCase())
      );
    }
    if (filters.name) {
      result = result.filter(place =>
        place.p_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    setFilteredPlaces(result);
  }, [filters, places]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image_url: "" }));
    }
  };

  // Upload image to Supabase
  const uploadImageToSupabase = async (file) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `place-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("jaffnaexplore")
        .upload(filePath, file, { contentType: file.type});

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("jaffnaexplore")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.p_name || !formData.category_name || !formData.p_description || !formData.latitude || !formData.longitude) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (!imageFile && !formData.image_url) {
      toast.error("Please either upload an image or provide an image URL.");
      return false;
    }
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      toast.error("Latitude and Longitude must be valid numbers.");
      return false;
    }
    return true;
  };

  // Add or update place
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        toast.loading("Uploading image...", { id: "upload" });
        imageUrl = await uploadImageToSupabase(imageFile);
        toast.success("Image uploaded successfully!", { id: "upload" });
      }

      const placeData = {
        p_name: formData.p_name,
        p_description: formData.p_description,
        category_name: formData.category_name,
        image_url: imageUrl,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (editingId !== null) {
        // Update - try both possible ID column names
        const { data, error } = await supabase
          .from("places")
          .update(placeData)
          .eq("place_id", editingId)
          .select();

        if (error) throw error;

        setPlaces(prev => prev.map(p => p.place_id === editingId ? { ...p, ...data[0] } : p));
        toast.success("Place updated successfully!");
        resetForm();
      } else {
        // Insert
        const { data, error } = await supabase
          .from("places")
          .insert([placeData])
          .select();

        if (error) throw error;

        setPlaces(prev => [...data, ...prev]);
        if (!categories.includes(formData.category_name)) {
          setCategories([...categories, formData.category_name]);
        }
        toast.success("Place added successfully!");
      }

      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error saving place:", error.message);
      toast.error(`Failed to save place: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      p_name: "",
      p_description: "",
      category_name: "",
      image_url: "",
      latitude: "",
      longitude: ""
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  // Edit place
  const handleEdit = (place) => {
    setFormData({
      p_name: place.p_name,
      p_description: place.p_description,
      category_name: place.category_name,
      image_url: place.image_url,
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString()
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(place.place_id);
    setIsFormVisible(true);
    document.getElementById("place-form").scrollIntoView({ behavior: "smooth" });
  };

  // Delete place
  const handleDelete = async (place_id) => {
    const placeName = places.find(p => p.place_id === place_id)?.p_name;
    if (window.confirm(`Are you sure you want to delete "${placeName}"?`)) {
      setLoading(true);
      const { error } = await supabase.from("places").delete().eq("place_id", place_id);
      if (error) {
        toast.error("Failed to delete place: " + error.message);
        setLoading(false);
        return;
      }
      setPlaces(prev => prev.filter(p => p.place_id !== place_id));
      toast.success(`"${placeName}" deleted successfully!`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-green-600 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Places Management</h1>
          <p className="text-green-100">Add, edit, and manage place listings</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Form and Table Toggle Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Places Directory</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                {isFormVisible ? "Hide Form ▲" : "Add New Place ▼"}
              </button>
              <button
                onClick={() => setIsTableVisible(!isTableVisible)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                {isTableVisible ? "Hide Places ▲" : "View All Places ▼"}
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {isFormVisible && (
            <form
              id="place-form"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-green-50 p-6 rounded-xl border border-green-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                {editingId ? `Editing: ${formData.p_name}` : "Add New Place"}
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  name="p_name"
                  placeholder="Enter place name"
                  value={formData.p_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  list="category-list"
                />
                <datalist id="category-list">
                  {categories.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Latitude & Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="p_description"
                  value={formData.p_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                ></textarea>
              </div>

              {/* Image upload and URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  disabled={!!imageFile}
                />
              </div>

              {(imagePreview || formData.image_url) && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
                  <img
                    src={imagePreview || formData.image_url}
                    alt="Preview"
                    className="w-100 h-100  object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="col-span-full flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  {editingId ? "Update Place" : "Add Place"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </form>
          )}

          {/* Places Table */}
          {isTableVisible && (
            <div className="overflow-hidden border rounded-xl shadow-sm">
              {filteredPlaces.length === 0 ? (
                <div className="text-center p-10 text-gray-500">No places found</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">Place</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">Coordinates</th>
                      <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPlaces.map((place) => (
                      <tr key={place.place_id} className="hover:bg-gray-50">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={place.image_url}
                            alt={place.p_name}
                            className="w-16 h-12 object-cover rounded-md border"
                          />
                          <span className="font-medium text-gray-800">{place.p_name}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-700 line-clamp-2">{place.p_description}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {place.category_name}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {place.latitude}, {place.longitude}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleEdit(place)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(place.place_id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Places;
