import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    r_name: "",
    r_description: "",
    restaurant_type: "",
    official_website: "",
    image_url: "",
    latitude: "",
    longitude: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    restaurant_type: "",
    name: ""
  });
  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch all restaurants from Supabase
  const fetchRestaurants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurants")
      .select("*");
    
    if (error) {
      console.error("Error fetching restaurants:", error.message);
      toast.error("Failed to fetch restaurants: " + error.message);
      setLoading(false);
      return;
    } 
    setRestaurants(data || []);
    setFilteredRestaurants(data || []);
    
    // Extract unique restaurant types
    const uniqueTypes = [...new Set(data.map(restaurant => restaurant.restaurant_type))];
    setRestaurantTypes(uniqueTypes);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Apply filters whenever filters or restaurants change
  useEffect(() => {
    let result = restaurants;
    
    if (filters.restaurant_type) {
      result = result.filter(restaurant => 
        restaurant.restaurant_type.toLowerCase().includes(filters.restaurant_type.toLowerCase())
      );
    }
    
    if (filters.name) {
      result = result.filter(restaurant => 
        restaurant.r_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    setFilteredRestaurants(result);
  }, [filters, restaurants]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      restaurant_type: "",
      name: ""
    });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.r_name || !formData.latitude || !formData.longitude || 
        !formData.r_description || !formData.restaurant_type) {
      toast.error("Please fill in all required fields.");
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
    
    // Validate website URL if provided
    if (formData.official_website) {
      try {
        new URL(formData.official_website);
      } catch (_) {
        toast.error("Please enter a valid website URL.");
        return false;
      }
    }
    
    return true;
  };

  // Add or update restaurant
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if a file is selected
      if (imageFile) {
        toast.loading("Uploading image...", { id: "image-upload" });
        imageUrl = await uploadImageToSupabase(imageFile);
        toast.success("Image uploaded successfully!", { id: "image-upload" });
      }

      const restaurantData = {
        r_name: formData.r_name,
        r_description: formData.r_description,
        restaurant_type: formData.restaurant_type,
        official_website: formData.official_website || null,
        image_url: imageUrl,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (editingId !== null) {
        // Update existing restaurant
        const { data, error } = await supabase
          .from("restaurants")
          .update(restaurantData)
          .eq("restaurant_id", editingId)
          .select();

        if (error) {
          throw error;
        }

        // Update UI with the new data
        setRestaurants((prev) =>
          prev.map((restaurant) =>
            restaurant.restaurant_id === editingId ? { ...restaurant, ...data[0] } : restaurant
          )
        );
        toast.success("Restaurant updated successfully!");
      } else {
        // Insert new restaurant
        const { data, error } = await supabase
          .from("restaurants")
          .insert([restaurantData])
          .select();

        if (error) {
          throw error;
        }

        // Add new restaurant to UI
        setRestaurants((prev) => [...data, ...prev]);
        
        // Add new restaurant type if it doesn't exist
        if (!restaurantTypes.includes(formData.restaurant_type)) {
          setRestaurantTypes([...restaurantTypes, formData.restaurant_type]);
        }
        
        toast.success("Restaurant added successfully!");
      }
      
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error saving restaurant:", error.message);
      toast.error(`Failed to save restaurant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({
    r_name: "",
    r_description: "",
    restaurant_type: "",
    official_website: "",
    image_url: "",
    latitude: "",
    longitude: ""
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  // Edit button handler
  const handleEdit = (restaurant) => {
    setFormData({
      r_name: restaurant.r_name,
      r_description: restaurant.r_description,
      restaurant_type: restaurant.restaurant_type,
      official_website: restaurant.official_website || "",
      image_url: restaurant.image_url,
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString()
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(restaurant.restaurant_id);
    setIsFormVisible(true);
    // Scroll to form
    document.getElementById('restaurant-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Delete restaurant with confirmation
  const handleDelete = async (restaurant_id) => {
    const restaurantName = restaurants.find(r => r.restaurant_id === restaurant_id)?.r_name;
    
    // Custom confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`)) {
      setLoading(true);
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("restaurant_id", restaurant_id);

      if (error) {
        console.error("Error deleting restaurant:", error.message);
        toast.error("Failed to delete restaurant: " + error.message);
        setLoading(false);
        return;
      }

      // Remove from UI without refetching
      setRestaurants(prev => prev.filter(restaurant => restaurant.restaurant_id !== restaurant_id));
      toast.success(`"${restaurantName}" deleted successfully!`);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Restaurants Management</h1>
          <p className="text-orange-100">Add, edit, and manage restaurant listings</p>
        </div>
        
        <div className="p-6 md:p-8">
          {/* Toggle Form Button */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Restaurants Directory</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleFormVisibility}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isFormVisible ? '▲' : '▼'}</span>
                {isFormVisible ? 'Hide Form' : 'Add New Restaurant'}
              </button>
              <button
                onClick={toggleTableVisibility}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isTableVisible ? '▲' : '▼'}</span>
                {isTableVisible ? 'Hide Restaurants' : 'View All Restaurants'}
              </button>
            </div>
          </div>

          {/* Add / Edit Restaurant Form */}
          {isFormVisible && (
            <form 
              id="restaurant-form"
              onSubmit={handleSubmit} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-orange-50 p-6 rounded-xl border border-orange-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                {editingId ? `Editing Restaurant: ${formData.r_name}` : 'Add New Restaurant'}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  name="r_name"
                  placeholder="Enter restaurant name"
                  value={formData.r_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

               <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="r_description"
                  placeholder="Enter restaurant description, menu highlights, specialties..."
                  value={formData.r_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Type *</label>
                <input
                  type="text"
                  name="restaurant_type"
                  placeholder="e.g., Non Veg, Veg, Italian, Chinese"
                  value={formData.restaurant_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                  disabled={loading}
                  list="restaurant-types-list"
                />
                <datalist id="restaurant-types-list">
                  {restaurantTypes.map((type, index) => (
                    <option key={index} value={type} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Official Website</label>
                <input
                  type="url"
                  name="official_website"
                  placeholder="https://example.com"
                  value={formData.official_website}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
              
              {/* Image URL Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  placeholder="https://example.com/restaurant-image.jpg"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  disabled={loading || imageFile}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if uploading image</p>
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
                      ✓ Image ready for upload: {imageFile.name}
                    </p>
                  )}
                </div>
              )}
              
              <div className="col-span-full flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:bg-orange-300 transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : editingId !== null ? (
                    'Update Restaurant'
                  ) : (
                    'Add Restaurant'
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
            <div className="mb-6 bg-gradient-to-r from-pink-50 to-orange-50 p-5 rounded-xl border border-pink-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Restaurants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Type</label>
                  <select
                    name="restaurant_type"
                    value={filters.restaurant_type}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  >
                    <option value="">All Types</option>
                    {restaurantTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Search by name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
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
              
              <div className="mt-4 text-sm text-pink-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Showing {filteredRestaurants.length} of {restaurants.length} restaurants
              </div>
            </div>
          )}

          {/* Restaurants List - Only shown when table is visible */}
          {isTableVisible && (loading && !restaurants.length ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    {restaurants.length === 0 ? 'No restaurants yet' : 'No matching restaurants found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {restaurants.length === 0 ? 'Get started by adding your first restaurant!' : 'Try adjusting your filters'}
                  </p>
                  {restaurants.length === 0 && (
                    <button
                      onClick={() => setIsFormVisible(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Add Your First Restaurant
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">Restaurant</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Description</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden xl:table-cell">Website</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Coordinates</th>
                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRestaurants.map((restaurant) => (
                        <tr key={restaurant.restaurant_id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={restaurant.image_url}
                                  alt={restaurant.r_name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => (e.target.src = "https://via.placeholder.com/64x48?text=Image+Error")}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{restaurant.r_name}</div>
                                <div className="text-sm text-gray-500 lg:hidden">
                                  {restaurant.latitude}, {restaurant.longitude}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden md:table-cell">
                            <div className="line-clamp-2">{restaurant.r_description}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {restaurant.restaurant_type}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden xl:table-cell">
                            {restaurant.official_website ? (
                              <a 
                                href={restaurant.official_website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate block max-w-xs"
                              >
                                {restaurant.official_website}
                              </a>
                            ) : (
                              <span className="text-gray-400">No website</span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden lg:table-cell">
                            {restaurant.latitude}, {restaurant.longitude}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(restaurant)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
                                title="Edit"
                                disabled={loading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(restaurant.restaurant_id)}
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

export default Restaurants;