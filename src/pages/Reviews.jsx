import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch reviews with user and place details from Supabase
    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("reviews")
            .select(`
                *,
                profiles(username),
                places(p_name)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Error fetching reviews: " + error.message);
            console.error("Error fetching reviews: " + error.message);
            setLoading(false);
            return;
        }
        setReviews(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (place_id, user_id) => {
        const reviewToDelete = reviews.find(review => 
            review.place_id === place_id && review.user_id === user_id
        );
        
        const placeName = reviewToDelete?.places?.p_name || "Unknown Place";
        const userName = reviewToDelete?.profiles?.username || "Unknown User";
        
        // Custom confirmation dialog
        if (window.confirm(`Are you sure you want to delete the review for "${placeName}" by "${userName}"? This action cannot be undone.`)) {
            setLoading(true);
            const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("place_id", place_id)
                .eq("user_id", user_id);

            if (error) {
                console.error("Error deleting review: " + error.message);
                toast.error("Error deleting review: " + error.message);
                setLoading(false);
                return;
            }

            // Remove from UI without refetching
            setReviews(reviews.filter(review => 
                !(review.place_id === place_id && review.user_id === user_id)
            ));
            toast.success(`Review for "${placeName}" by "${userName}" deleted successfully`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-pink-100 to-pink-50 p-4 md:p-6">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-pink-600 to-pink-500 text-white p-6 md:p-8">
                    <h1 className="text-3xl font-bold mb-2">Review Management</h1>
                    <p className="text-orange-100">Manage user reviews effectively</p>
                </div>

                <div className="p-6 md:p-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">All Reviews</h2>
                        <div className="text-sm text-pink-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Showing {reviews.length} reviews
                        </div>
                    </div>

                    {/* Reviews Table */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                            <p className="mt-2 text-gray-600">Loading reviews...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Place Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rating
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Review Text
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reviews.map((review) => (
                                            <tr key={`${review.user_id}-${review.place_id}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {review.profiles?.username || "Unknown User"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {review.places?.p_name || "Unknown Place"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {review.rating}/5
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {review.review_text}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(review.place_id, review.user_id)}
                                                        className="text-red-600 hover:text-red-900 font-medium py-1 px-3 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;