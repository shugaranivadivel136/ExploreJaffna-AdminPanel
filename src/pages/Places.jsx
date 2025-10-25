import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
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
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    category_name: "",
    p_name: ""
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch all places from Supabase
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

  // Apply filters whenever filters or places change
  useEffect(() => {
    let result = places;
    
    if (filters.category_name) {
      result = result.filter(place => 
        place.category_name.toLowerCase().includes(filters.category_name.toLowerCase())
      );
    }
    
    if (filters.p_name) {
      result = result.filter(place => 
        place.p_name.toLowerCase().includes(filters.p_name.toLowerCase())
      );
    }
    
    setFilteredPlaces(result);
  }, [filters, places]);

  // Handle form input changes
  const handleChange = (e) => {
    const { p_name, value } = e.target;
    setFormData({ ...formData, [p_name]: value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear the URL input when file is selected
      setFormData(prev => ({ ...prev, image_url: "" }));
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `restaurant-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jaffnaexplore')
        .getPublicUrl(fileName);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('restaurants')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { p_name, value } = e.target;
    setFilters({ ...filters, [p_name]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category_name: "",
      p_name: ""
    });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.p_name || !formData.latitude || !formData.longitude || 
        !formData.p_description || !formData.category_name) {
      toast.error("Please fill in all fields.");
      return false;
    }

    // Check if either image file or image URL is provided
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
    
    // Validate URL format for image if provided (not when file is uploaded)
    if (formData.image_url && !imageFile) {
      try {
        new URL(formData.image_url);
      } catch (_) {
        toast.error("Please enter a valid image URL.");
        return false;
      }
    }

    return true;
  };

  // Add or update place
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try{
      let imageUrl = formData.image_url;

      //upload image if file is selected
      if (imageFile) {
        toast.loading("Uploading image...", { id: 'image_upload' });
        imageUrl = await uploadImageToSupabase(imageFile);
        toast.success("Image uploaded successfully!", { id: 'image_upload' });
      }

      const placeData = {
        p_name: formData.p_name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        p_description: formData.p_description,
        image_url: imageUrl,
        category_name: formData.category_name
      };

      if (editingId !== null) {
        // Update existing place
        const { data, error } = await supabase
          .from("places")
          .update(placeData)
          .eq("place_id", editingId)
          .select();

        if (error) {
          console.error("Error updating place:", error.message);
          toast.error("Failed to update place: " + error.message);
          setLoading(false);
          return;
        }

        // Update UI with the new data
        setPlaces((prev) =>
          prev.map((place) =>
            place.place_id === editingId ? { ...place, ...data[0] } : place
          )
        );
        toast.success("Place updated successfully!");
        resetForm();
      } else {
        // Insert new place
        const { data, error } = await supabase
          .from("places")
          .insert([placeData])
          .select();

        if (error) {
          console.error("Error adding place:", error.message);
          toast.error("Failed to add place: " + error.message);
          setLoading(false);
          return;
        }

        // Add new place to UI
        setPlaces((prev) => [...data, ...prev]);
      
          // Add new category if it doesn't exist
        if (!categories.includes(formData.category_name)) {
          setCategories([...categories, formData.category_name]);
        }
      
        toast.success("Place added successfully!");
        resetForm();
      }
      setLoading(false);
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error saving place:", error.message);
      toast.error(`Failed to save place: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({
      p_name: "",
      latitude: "",
      longitude: "",
      p_description: "",
      image_url: "",
      category_name: ""
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  // Edit button handler
  const handleEdit = (place) => {
    setFormData({
      p_name: place.p_name,
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
      p_description: place.p_description,
      image_url: place.image_url,
      category_name: place.category_name
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(place.place_id);
    setIsFormVisible(true);
    // Scroll to form
    document.getElementById('place-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Delete place with confirmation
  const handleDelete = async (place_id) => {
    const placeName = places.find(p => p.place_id === place_id)?.p_name;
    
    // Custom confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${placeName}"? This action cannot be undone.`)) {
      setLoading(true);
      const { error } = await supabase
        .from("places")
        .delete()
        .eq("place_id", place_id);

      if (error) {
        console.error("Error deleting place:", error.message);
        toast.error("Failed to delete place: " + error.message);
        setLoading(false);
        return;
      }

      // Remove from UI without refetching
      setPlaces(prev => prev.filter(place => place.place_id !== place_id));
      toast.success(`"${placeName}" deleted successfully!`);
      setLoading(false);
    }
  };

  // Toggle form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    if (editingId && !isFormVisible) {
      resetForm();
    }
  };

  // Toggle table visibility
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Places Management</h1>
          <p className="text-blue-100">Add, edit, and manage your favorite places</p>
        </div>
        
        <div className="p-6 md:p-8">
          {/* Toggle Form Button */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Places Directory</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleFormVisibility}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isFormVisible ? '▲' : '▼'}</span>
                {isFormVisible ? 'Hide Form' : 'Add New Place'}
              </button>
              <button
                onClick={toggleTableVisibility}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isTableVisible ? '▲' : '▼'}</span>
                {isTableVisible ? 'Hide Places' : 'View All Places'}
              </button>
            </div>
          </div>

          {/* Add / Edit Place Form */}
          {isFormVisible && (
            <form 
              id="place-form"
              onSubmit={handleSubmit} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                {editingId ? `Editing Place: ${formData.p_name}` : 'Add New Place'}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="e.g., 40.7128"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="e.g., -74.0060"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="p_description"
                  placeholder="Enter description"
                  value={formData.p_description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              {/* Image Upload Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">OR use Image URL below (Max 5MB)</p>
              </div>
              
              {/* Image URL field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  name="image_url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if uploading image</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category_name"
                  placeholder="e.g., Restaurant, Park"
                  value={formData.category_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {categories.map((category_name, index) => (
                    <option key={index} value={category_name} />
                  ))}
                </datalist>
              </div>
              
              {/* Image Preview */}
              {(imagePreview || formData.image_url) && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
                  <div className="h-40 w-full border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL")}
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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : editingId !== null ? (
                    'Update Place'
                  ) : (
                    'Add Place'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    if (editingId) setIsFormVisible(false);
                  }}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  {editingId !== null ? 'Cancel Edit' : 'Clear Form'}
                </button>
              </div>
              
              <div className="col-span-full text-xs text-gray-500 mt-2">
                <p>* Required fields. You can either upload an image or provide an image URL.</p>
              </div>
            </form>
          )}

          {/* Filter Section - Only shown when table is visible */}
          {isTableVisible && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Places
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={filters.category_name}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category_name, index) => (
                      <option key={index} value={category_name}>{category_name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Search by name"
                    value={filters.p_name}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-purple-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Showing {filteredPlaces.length} of {places.length} places
              </div>
            </div>
          )}

          {/* Places List - Only shown when table is visible */}
          {isTableVisible && (loading && !places.length ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    {places.length === 0 ? 'No places yet' : 'No matching places found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {places.length === 0 ? 'Get started by adding your first place!' : 'Try adjusting your filters'}
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
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">Place</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Coordinates</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Description</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">Category</th>
                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPlaces.map((place) => (
                        <tr key={place.place_id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={place.image_url}
                                  alt={place.p_name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => (e.target.src = "https://via.placeholder.com/64x48?text=Image+Error")}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{place.p_name}</div>
                                <div className="text-sm text-gray-500 lg:hidden">
                                  {place.latitude}, {place.longitude}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden lg:table-cell">
                            {place.latitude}, {place.longitude}
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden md:table-cell">
                            <div className="line-clamp-2">{place.p_description}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {place.category_name}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(place)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
                                title="Edit"
                                disabled={loading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(place.place_id)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50"
                                title="Delete"
                                disabled={loading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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