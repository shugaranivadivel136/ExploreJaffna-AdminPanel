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
    longitude: "",
    latitude: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    name: "",
  });

  // Fetch all places from Supabase
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      console.log("Fetching places from Supabase...");
      
      const { data, error, status } = await supabase
        .from("places")
        .select("*")
        //.order("name", { ascending: false });

      console.log("Supabase response:", { data, error, status });

      if (error) {
        console.error("Supabase error details:", error);
        // Check if it's a table doesn't exist error
        if (error.code === '42P01') {
          toast.error("Places table doesn't exist. Please create it in Supabase.");
          return;
        }
        throw error;
      }

      if (!data) {
        console.log("No data returned from Supabase");
        setPlaces([]);
        setFilteredPlaces([]);
        return;
      }

      console.log(`Successfully fetched ${data.length} places`);
      setPlaces(data || []);
      setFilteredPlaces(data || []);
      
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch places: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Apply filters whenever filters or places change
  useEffect(() => {
    let result = places;

    if (filters.name) {
      result = result.filter((place) =>
        place.p_name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter((place) => place.category_name === filters.category);
    }

    setFilteredPlaces(result);
  }, [filters, places]);

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

      // First upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jaffnaexplore')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Then get the public URL
      const { data: publicData } = supabase.storage
        .from('jaffnaexplore')
        .getPublicUrl(fileName);

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
    const { p_name, value } = e.target;
    setFilters({ ...filters, [p_name]: value });
  };

  const clearFilters = () => {
    setFilters({ name: "", category: "" });
  };

  const resetForm = () => {
    setFormData({
      p_name: "",
      p_description: "",
      category_name: "",
      image_url: "",
      longitude: "",
      latitude: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  const handleEdit = (place) => {
    setFormData({
      p_name: place.p_name || "",
      p_description: place.p_description || "",
      category_name: place.category_name || "",
      image_url: place.image_url || "",
      longitude: place.longitude || "",
      latitude: place.latitude || "",
    });
    setEditingId(place.place_id || place.id);
    setIsFormVisible(true);
    document
      .getElementById("place-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (place_id) => {
    const placeName = places.find((p) => (p.place_id || p.id) === place_id)?.p_name;
    if (
      window.confirm(
        `Are you sure you want to delete "${placeName}"? This action cannot be undone.`
      )
    ) {
      setLoading(true);
      try {
        // Try both possible ID column names
        const { error } = await supabase
          .from("places")
          .delete()
          .or(`place_id.eq.${place_id},id.eq.${place_id}`);

        if (error) {
          console.error("Error deleting place:", error);
          throw error;
        }
        
        setPlaces((prev) => prev.filter((p) => (p.place_id || p.id) !== place_id));
        toast.success(`"${placeName}" deleted successfully!`);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete place: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    if (editingId && !isFormVisible) resetForm();
  };

  const toggleTableVisibility = () => setIsTableVisible(!isTableVisible);

  const categories = [
    "Historical",
    "Religious",
    "Beach",
    "Nature",
    "Cultural",
    "Restaurant",
    "Shopping",
    "Adventure",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.p_name || !formData.p_description || !formData.image_url || !formData.category_name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate coordinates if provided
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      toast.error("Latitude must be between -90 and 90.");
      return;
    }

    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      toast.error("Longitude must be between -180 and 180.");
      return;
    }

    setLoading(true);
    try {
      const placeData = {
        p_name: formData.p_name,
        p_description: formData.p_description,
        category_name: formData.category_name,
        image_url: formData.image_url,
        longitude: formData.longitude || null,
        latitude: formData.latitude || null,
      };

      console.log("Submitting place data:", placeData);

      if (editingId !== null) {
        // Update - try both possible ID column names
        const { data, error } = await supabase
          .from("places")
          .update(placeData)
          .or(`place_id.eq.${editingId},id.eq.${editingId}`)
          .select();

        if (error) throw error;

        setPlaces((prev) =>
          prev.map((p) => ((p.place_id || p.id) === editingId ? data[0] : p))
        );
        toast.success("Place updated successfully!");
        resetForm();
      } else {
        // Insert
        const { data, error } = await supabase
          .from("places")
          .insert([placeData])
          .select();

        if (error) throw error;
        
        console.log("Insert response:", data);
        setPlaces((prev) => [data[0], ...prev]);
        toast.success("Place added successfully!");
        resetForm();
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit place: " + err.message);
    } finally {
      setLoading(false);
      setIsFormVisible(false);
    }
  };

  // Helper function to get place ID (handles both place_id and id)
  const getPlaceId = (place) => place.place_id || place.id;

  // Helper function to safely access place properties
  const getPlaceProperty = (place, property) => place[property] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-700 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Places Management</h1>
          <p className="text-blue-100">Add, edit, and manage tourist places</p>
          
          {/* Debug info */}
          <div className="mt-2 text-sm text-blue-200">
            Total places: {places.length} | Filtered: {filteredPlaces.length}
            {loading && " | Loading..."}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Toggle Form Button */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Tourist Places Directory
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleFormVisibility}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isFormVisible ? "▲" : "▼"}</span>
                {isFormVisible ? "Hide Form" : "Add New Place"}
              </button>
              <button
                onClick={toggleTableVisibility}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isTableVisible ? "▲" : "▼"}</span>
                {isTableVisible ? "Hide Places" : "View All Places"}
              </button>
              <button
                onClick={fetchPlaces}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Add / Edit Place Form */}
          {isFormVisible && (
            <form
              id="place-form"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                {editingId
                  ? `Editing Place: ${formData.p_name}`
                  : "Add New Place"}
              </h3>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  name="p_name"
                  placeholder="Enter place name"
                  value={formData.p_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="p_description"
                  placeholder="Enter place description"
                  value={formData.p_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Image *
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={uploading || loading}
                  />
                  <div className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                  </div>
                </div>

                {uploading && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading image...
                  </div>
                )}

                {/* Alternative URL input */}
                {/*<div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or enter image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  />
                </div>*/}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="e.g., 9.6615"
                  value={formData.latitude}
                  onChange={handleChange}
                  //min="-90"
                  //max="90"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if uploading image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="e.g., 80.0255"
                  value={formData.longitude}
                  onChange={handleChange}
                  //min="-180"
                  //max="180"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image_url) && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <div className="h-40 w-full border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/300x150?text=Invalid+Image+URL")
                      }
                    />
                  </div>
                  {imageFile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Image ready for upload: {imageFile.p_name}
                    </p>
                  )}
                </div>
              )}

              <div className="col-span-full flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : editingId !== null ? (
                    "Update Place"
                  ) : (
                    "Add Place"
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
                <p>* Required fields. Coordinates are optional but recommended for mapping.</p>
              </div>
            </form>
          )}

          {/* Filter Section - Only shown when table is visible */}
          {isTableVisible && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-600"
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
                Filter Places
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Search by name"
                    value={filters.p_name}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
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

              <div className="mt-4 text-sm text-green-700 flex items-center">
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
                Showing {filteredPlaces.length} of {places.length} places
              </div>
            </div>
          )}

          {/* Places List - Only shown when table is visible */}
          {isTableVisible &&
            (loading && !places.length ? (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading places...</span>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {filteredPlaces.length === 0 ? (
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      {places.length === 0
                        ? "No places yet"
                        : "No matching places found"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {places.length === 0
                        ? "Get started by adding your first place!"
                        : "Try adjusting your filters"}
                    </p>
                    {places.length === 0 && (
                      <button
                        onClick={() => setIsFormVisible(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Add Your First Place
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Place
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Category
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">
                            Description
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Coordinates
                          </th>
                          <th className="p-4 text-center text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredPlaces.map((place) => (
                          <tr
                            key={getPlaceId(place)}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                  <img
                                    src={getPlaceProperty(place, 'image_url')}
                                    alt={getPlaceProperty(place, 'p_name')}
                                    className="h-full w-full object-cover"
                                    onError={(e) =>
                                      (e.target.src =
                                        "https://via.placeholder.com/64x48?text=Image+Error")
                                    }
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">
                                    {getPlaceProperty(place, 'p_name')}
                                  </div>
                                  <div className="text-sm text-gray-500 md:hidden line-clamp-2">
                                    {getPlaceProperty(place, 'p_description')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getPlaceProperty(place, 'category_name')}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-700 hidden md:table-cell">
                              <div className="line-clamp-2">
                                {getPlaceProperty(place, 'p_description')}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-700">
                              {place.latitude && place.longitude ? (
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 mr-1 text-gray-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    {parseFloat(place.latitude).toFixed(4)}, {parseFloat(place.longitude).toFixed(4)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">No coordinates</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(place)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(getPlaceId(place))}
                                  className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50"
                                  title="Delete"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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

export default Places;