import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Native_Products = () => {
    const [native_products, setNative_Products] = useState([]);
    const [filteredNative_Products, setFilteredNative_Products] = useState([]);
    const [formData, setFormData] = useState({
        pro_name: "",
        pro_craft_tec: "",
        pro_image_url: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [filters, setFilters] = useState({
        pro_name: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");


    //Fetch all products from supabase
    const fetchNative_Products = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("native_products")
            .select("*");

        if (error) {
            console.error("Error fetching native products:", error.message);
            toast.error("Failed to fetch native products: " + error.message);
            setLoading(false);
            return;
        }
        setNative_Products(data || []);
        setFilteredNative_Products(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchNative_Products();
    }, []);

    //Apply filters whenever filters or products change
    useEffect(() => {
        let result = native_products;

        if (filters.pro_name) {
            result = result.filter(native_product => 
                native_product.pro_name.toLoweCase().includes(filters.pro_name.toLowerCase())
            );
        }

        setFilteredNative_Products(result);
    }, [filters, native_products]);

    //Handle form input changes
    const handleChange = (p) => {
        const { pro_name, value } = p.target;
        setFormData({ ...formData, [pro_name]: value });
    };

    //Handle image file selection
    const handleImageChange = (p) => {
        const file = p.target.files[0];
        if (file) {
            //check if file is an image
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a vlid image file");
                return;
            }

            //check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setImageFile(file);

            //create preview
            const reader = new FileReader();
            reader.onload = (p) => {
                setImagePreview(p.target.result);
            };
            reader.readAsDataURL(file);

            //clear the URL input when file is selected
            selectFormData(prev => ({ ...prev, pro_image_url: "" }));
        }
    };

    // Upload image to Supabase Storage
    const uploadImageToSupabase = async (file) => {
        try {
            const fileExt = file.pro_name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `native_products-images/${fileName}`;

            const { data, error } = await supabase.storage
                .from('jaffnaexplore')
                .getPublicUrl(fileName);

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('native_products')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    // Handle filter changes
    const handleFilterChange = (p) => {
        const { pro_name, value } = p.target;
        setFilters({ ...filters, [pro_name]: value });
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            pro_name: ""
        });
    };

    //Validate form inputs
    const validateForm = () => {
        if (!formData.pro_name || !formData.pro_craft_tec ) {
            toast.error("Please fill in all required fields.");
            return false;
        }

        // Check if either image file or image URL is provided
        if (!imageFile && !formData.image_url) {
            toast.error("Please either upload an image or provide an image URL.");
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

    //Add or Update products
    const handleSubmit = async (p) => {
        p.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            let imageUrl = formData.pro_image_url;

            //Upload image if file is selected
            if (imageFile) {
                toast.loading("Uploading image...", { id: "image-upload" });
                imageUrl = await uploadImageToSupabase(imageFile);
                toast.success("Image uploaded successfully!", { id: "image-upload" });
            }

            const native_productData = {
                pro_name: formData.pro_name,
                pro_craft_tec: formData.pro_craft_tec,
                pro_image_url: imageUrl
            };

            if (editingId !== null) {
                // Update existing product
                const { data, error } = await supabase
                    .from("native_products")
                    .update(native_productData)
                    .eq("product_id", editingId)
                    select();

                if (error) {
                    throw error;
                }

                //Update UI with new data
                setNative_Products((prev) =>
                    prev.map((product) =>
                        product.product_id === editingId ? { ...product, ...native_productData[0] } : product
                    )
                );
                toast.success("Native product updated successfully!");
            } else {
                //Insert new product
                const { data, error } = await supabase
                    .from("native_products")
                    .insert([native_productData])
                    .select();

                    if (error) {
                        throw error;
                    }

                    //Add new product to UI
                    setNative_Products((prev) => [...data, ...prev]);

                    toast.success("Native product added successfully!");
            }

            requestFormReset();
            setIsFormVisible(false);
        } catch (error) {
            console.error("Error saving native product:", error);
            toast.error("Failed to save native product: " + error.message);
        } finally {
            setLoading(false);
        }

    };

    //Reset form and editing state
    const resetForm = () => {
        setFormData({
            pro_name: "",
            pro_craft_tec: "",
            pro_image_url: ""
        });
        setImageFile(null);
        setImagePreview("");
        setEditingId(null);
    };

    //Editing Button Handler
    const handleEdit = (native_product) => {
        setFormData({
            pro_name: native_product.pro_name,
            pro_craft_tec: native_product.pro_craft_tec,
            pro_image_url: native_product.pro_image_url
        });
        setImageFile(null);
        setImagePreview("");
        setEditingId(native_product.product_id);
        setIsFormVisible(true);
        //Scroll to form
        document.getElementById("native-product-form").scrollIntoView({ behavior: "smooth" });

    };

    //Delete product with confirmation
    const handleDelete = async (native_product_id) => {
        const native_productName = native_products.find(p => p.product_id === native_product_id)?.pro_name;

        //Custom confirmation dialog
        if (window.confirm(`Are you sure you want to delete "${native_productName}"? This action cannot be undone.`)) {
            setLoading(true);
            const { error } = await supabase
                .from("native_products")
                .delete()
                .eq("product_id", native_product_id);

            if (error) {
                console.error("Error deleting native product:", error.message);
                toast.error("Failed to delete native product: " + error.message);
                setLoading(false);
                return;
            }

            //Remove from UI without refetching
            setNative_Products((prev) => prev.filter((p) => p.product_id !== native_product_id));
            toast.success("Native product deleted successfully!");
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto bg-white rounded-6xl shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl shadow-lg overflow-hidden">
                    <h1 className="text-3xl font-bold mb-2">Native-Products Management</h1>
                    <p className="text-green-100">Add, edit, and manage native products listings</p>
                </div>

                <div className="p-6 md:p-8">
                    {/* Toggle Form Button */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">Native-Products Directory</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={toggleFormVisibility}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                            >
                                <span className="mr-2">{isFormVisible ? '▲' : '▼'}</span>
                                {isFormVisible ? 'Hide Form' : 'Add New Native-Product'}
                            </button>
                            <button
                                onClick={toggleTableVisibility}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                            >
                                <span className="mr-2">{isTableVisible ? '▲' : '▼'}</span>
                                {isTableVisible ? 'Hide Native-Products' : 'View All Native-Products'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add / Edit Restaurant Form */}
                {isFormVisible && (
                <form 
                    id="native_products-form"
                    onSubmit={handleSubmit} 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-green-50 p-6 rounded-xl border border-green-100"
                >
                    <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                        {editingId ? `Editing Native Product: ${formData.pro_name}` : 'Add New Native Product'}
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Native Product Name *
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            placeholder="Enter native product name"
                            value={formData.pro_name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Craft-Tec *
                        </label>
                        <textarea
                            name="product_craft_tec"
                            placeholder="Enter product craft technology, how to make, sources, ect.."
                            value={formData.pro_craft_tec}
                            onChange={handleChange}
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                            value={formData.pro_image_url}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            disabled={loading || imageFile}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty if uploading image</p>
                    </div>
              
                    {/* Image Preview */}
                    {(imagePreview || formData.pro_image_url) && (
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
                            <div className="h-40 w-full border border-gray-300 rounded-lg overflow-hidden">
                            <img
                                src={imagePreview || formData.pro_image_url}
                                alt="Preview"
                                className="h-full w-full object-cover"
                                onError={(p) => (p.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL")}
                            />
                            </div>
                            {imageFile && (
                                <p className="text-xs text-green-600 mt-1">
                                    ✓ Image ready for upload: {imageFile.pro_name}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="col-span-full flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : editingId !== null ? ('Update Product') : ('Add Product')}
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
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter Products
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Search by name"
                            value={filters.pro_name}
                            onChange={handleFilterChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

                    <div className="mt-4 text-sm text-blue-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Showing {filteredNative_Products.length} of {products.length} products
                    </div>
                </div>
            )}

            {/* Restaurants List - Only shown when table is visible */}
            {isTableVisible && (loading && !products.length ? (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {filteredNative_Products.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <div className="text-gray-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                            {products.length === 0 ? 'No products yet' : 'No matching products found'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {products.length === 0 ? 'Get started by adding your first product!' : 'Try adjusting your filters'}
                        </p>
                            {products.length === 0 && (
                        <button
                            onClick={() => setIsFormVisible(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                        Add Your First Product
                        </button>
                    )}
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-700">Product</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Craft Tec</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-700">Image</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                        <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center">
                                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                        <img
                                            src={product.pro_image_url}
                                            alt={product.pro_name}
                                            className="h-full w-full object-cover"
                                            onError={(p) => (p.target.src = "https://via.placeholder.com/64x48?text=Image+Error")}
                                        />
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex justify-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
                                        title="Edit"
                                        disabled={loading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.product_id)}
                                        className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-md hover:bg-green-50"
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
  );
};

export default Native_Products;
