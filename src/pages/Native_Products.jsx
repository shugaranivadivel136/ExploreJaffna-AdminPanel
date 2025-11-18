import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Native_Products = () => {
  const [native_products, setNative_Products] = useState([]);
  const [filteredNative_Products, setFilteredNative_Products] = useState([]);
  const [formData, setFormData] = useState({
    pro_name: "",
    pro_image_url: "",
    pro_craft_tec: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    pro_name: "",
  });

  // Fetch native products from Supabase
  const fetchNative_Products = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("native_products")
        .select("*");

      if (error) throw error;
      setNative_Products(data || []);
      setFilteredNative_Products(data || []);
    } catch (error) {
      console.error("Error fetching native products: ", error);
      toast.error("Failed to Fetch native products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNative_Products();
  }, []);

  // Apply filters whenever filters or native_products change
  useEffect(() => {
    let result = native_products;

    if (filters.pro_name) {
      result = result.filter((native_product) =>
        native_product.pro_name.toLowerCase().includes(filters.pro_name.toLowerCase())
      );
    }
    setFilteredNative_Products(result);
  }, [filters, native_products]);

  //Handle form input changes
  const handleChange = (product) => {
    const { pro_name, value } = product.target;
    setFormData({ ...formData, [pro_name]: value });
  };

  // Handle image upload directly to Supabase Storage
  const handleImageUpload = async (product) => {
    const file = product.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // create unique file name
      const fileName = `${Date.now()}_${file.pro_name}`;

      const { data: publicData, error: urlError } = supabase.storage
        .from('jaffnaexplore')
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      const publicUrl = publicData.publicUrl;

      //save the public URL in form data
      setFormData((prev) => ({ ...prev, pro_image_url: publicUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image: ", error);
      toast.error("Image upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFilterChange = (product) => {
    const { pro_name, value } = product.target;
    setFilters({ ...filters, [pro_name]: value });
  };

  const clearFilters = () => {
    setFilters({ pro_name: "" });
  };

  const resetForm = () => {
    setFormData({
      pro_name: "",
      pro_image_url: "",
      pro_craft_tec: "",
    });
    setEditingId(null);
  };

  const handleEdit = (native_product) => {
    setFormData({
      pro_name: native_product.pro_name,
      pro_image_url: native_product.pro_image_url,
      pro_craft_tec: native_product.pro_craft_tec,
    });
    setEditingId(native_product.product_id);
    setIsFormVisible(true);
    document
      .getElementById("native_product-form")
      .scrollIntoView({ behavior: "smooth" });

  };

  const handleDelete = async (product_id) => {
    const productName = native_products.find((product) =>
      product.product_id === product_id)?.pro_name;

    if (
      window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      )
    ) {
      setLoading(true);
      const { error } = await supabase
        .from("native_products")
        .delete()
        .eq("product_id", product_id);

      if (error) {
        console.error("Error deleting native product:", error.message);
        toast.error("Failed to delete native product: " + error.message);
      } else {
        setNative_Products((prev) =>
          prev.filter((product) => product.product_id !== product_id));
        toast.success(`"${productName}" deleted successfully!`);
      }
      setLoading(false);
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    if (editingId && !isFormVisible) resetForm();
  };

  const toggleTableVisibility = () => 
    setIsTableVisible(!isTableVisible);

  const handleSubmit = async (product) => {
    product.preventDefault();

    if (!formData.pro_name || !formData.pro_image_url || !formData.pro_craft_tec) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    setLoading(true);
    try { 
      if (editingId !== null) {
        //update
        const { data, error } = await supabase
          .from("native_products")
          .update({
            pro_name: formData.pro_name,
            pro_image_url: formData.pro_image_url,
            pro_craft_tec: formData.pro_craft_tec,
          })
          .eq("product_id", editingId)
          .select();

        if (error) throw error;

        setNative_Products((prev) =>
          prev.map((product) => (
            product.product_id === editingId ? data[0] : product
          ))
        );
        toast.success("Native Product updated successfully!");
        resetForm();
      } else {
        //insert
        const { data, error } = await supabase
          .from("native_products")
          .insert([
            {
              pro_name: formData.pro_name,
              pro_image_url: formData.pro_image_url,
              pro_craft_tec: formData.pro_craft_tec,
            },
          ])
          .select();

        if (error) throw error;

        setNative_Products((prev) => [data[0], ...prev]);
        toast.success("Native Product added successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Submit error: ", error);
      toast.error("Failed to submit native product: " + error.message);
    } finally {
      setLoading(false);
      setIsFormVisible(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-emerald-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-700 to-emerald-700 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Native products Management</h1>
          <p className="text-emerald-100">Add, edit, and manage your products</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Toggle From Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Native Products
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleFormVisibility}
                className="bg-emerald-700 hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                <span className="mr-2">{isFormVisible ? "▲" : "▼"}</span>
                {isFormVisible ? "Hide Form" : "Add New Product"}
                </button>
              <button
                onClick={toggleTableVisibility}
                className="bg-emerald-700 hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                <span className="mr-2">{isTableVisible ? "▲" : "▼"}</span>
                {isTableVisible ? "Hide Products" : "View All Products"}
              </button>
            </div>
          </div>

          {/* Add / Edit product form */}
          {isFormVisible && (
            <form
              id="native_product-form"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-emerald-50 p-6 rounded-xl border border-emerald-100"
            >
               <h3 className="text-lg font-semibold text-gray-800 col-span-full mb-2">
                {editingId
                  ? `Editing Product: ${formData.pro_name}`
                  : "Add New Product"}
              </h3>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="pro_name"
                  placeholder="Enter product name"
                  value={formData.pro_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Craft Technology *
                </label>
                <textarea
                  name="pro_craft_tec"
                  placeholder="Enter craft tec"
                  value={formData.pro_craft_tec}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image *
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    disabled={uploading || loading}
                  />
                  <div className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                  </div>
                </div>

                {/* Show upload status */}
                {uploading && (
                  <div className="mt-2 flex items-center text-sm text-emerald-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                    Uploading image...
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {formData.pro_image_url && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <div className="h-40 w-full border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={formData.pro_image_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(product) =>
                        (product.target.src =
                          "https://via.placeholder.com/300x150?text=Invalid+Image+URL")
                      }
                    />
                  </div>
                </div>
              )}

              <div className="col-span-full flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors flex items-center"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : editingId !== null ? (
                    "Update Product"
                  ) : (
                    "Add Product"
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
            </form>
          )}

          {/* Filter section - only shown when table is visible */}
          {isTableVisible && (
            <div className="mb-6 bg-linear-to-r from-emerald-50 to-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-emerald-600"
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
                Filter Products
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="pro_name"
                    placeholder="Search by name"
                    value={filters.pro_name}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
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

              <div className="mt-4 text-sm text-emerald-700 flex items-center">
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
                Showing {filteredNative_Products.length} of {native_products.length} products
              </div>
            </div>
          )}

          {/* Products List - only shown when table is visible */}
          {isTableVisible &&
            (loading && !native_products.length ? (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {filteredNative_Products.length === 0 ? (
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
                      {native_products.length === 0
                        ? "No products yet"
                        : "No matching products found"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {native_products.length === 0
                        ? "Get started by adding your first product!"
                        : "Try adjusting your filters"}
                    </p>
                    {native_products.length === 0 && (
                      <button
                        onClick={() => setIsFormVisible(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Add Your First Products
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700">
                            Product
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">
                            Craft Technology
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                         {filteredNative_Products.map((product) => (
                          <tr
                            key={product.product_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md">
                                  <img
                                    src={product.pro_image_url}
                                    alt={product.pro_name}
                                    className="h-full w-full object-cover"
                                    onError={(product) =>
                                      (product.target.src =
                                        "https://via.placeholder.com/64x48?text=Image+Error")
                                    }
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">
                                    {product.pro_name}
                                  </div>
                                  <div className="text-sm text-gray-500 md:hidden line-clamp-2">
                                    {product.pro_craft_tec}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-emerald-50"
                                  title="Editing"
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
                                  onClick={() => handleDelete(product.product_id)}
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

export default Native_Products;