import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({
        user_name: "",
        problem: ""
    });

    // Fetch reports with user details from Supabase
    const fetchReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("reports")
            .select(`
                *,
                profiles(username)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Error fetching reports: " + error.message);
            console.error("Error fetching reports: " + error.message);
            setLoading(false);
            return;
        }
        setReports(data || []);
        setFilteredReports(data || []);
        
        // Extract unique users for filter
        const uniqueUsers = [...new Set(data.map(report => report.profiles?.username).filter(Boolean))];
        setUsers(uniqueUsers.sort());
        
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = reports;
        
        if (filters.user_name) {
            result = result.filter(report => 
                report.profiles?.username?.toLowerCase().includes(filters.user_name.toLowerCase())
            );
        }
        
        if (filters.problem) {
            result = result.filter(report =>
                report.problems?.toLowerCase().includes(filters.problem.toLowerCase())
            );
        }
        
        setFilteredReports(result);
    }, [filters, reports]);

    const handleDelete = async (id) => {
        const reportToDelete = reports.find(report => report.id === id);
        
        const userName = reportToDelete?.profiles?.username || "Unknown User";
        const problem = reportToDelete?.problems || "Unknown Problem";
        
        // Custom confirmation dialog
        if (window.confirm(`Are you sure you want to delete the report from "${userName}" about "${problem}"? This action cannot be undone.`)) {
            setLoading(true);
            const { error } = await supabase
                .from("reports")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Error deleting report: " + error.message);
                toast.error("Error deleting report: " + error.message);
                setLoading(false);
                return;
            }

            // Remove from UI without refetching
            setReports(reports.filter(report => report.id !== id));
            toast.success(`Report from "${userName}" deleted successfully`);
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            user_name: "",
            problem: ""
        });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 to-emerald-50 p-4 md:p-6">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-emerald-700 to-emerald-700 text-white p-6 md:p-8">
                    <h1 className="text-3xl font-bold mb-2">Reports Management</h1>
                    <p className="text-emerald-100">Manage user reports effectively</p>
                </div>

                <div className="p-6 md:p-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">All Reports</h2>
                        <div className="text-sm text-pink-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Showing {filteredReports.length} of {reports.length} reports
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            {/* User Name Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by User
                                </label>
                                <select
                                    name="user_name"
                                    value={filters.user_name}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">All Users</option>
                                    {users.map((user, index) => (
                                        <option key={index} value={user}>
                                            {user}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Problem Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Problem
                                </label>
                                <input
                                    type="text"
                                    name="problem"
                                    placeholder="Search problem..."
                                    value={filters.problem}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Clear Filters Button */}
                            <div>
                                <button
                                    onClick={clearFilters}
                                    className="bg-emerald-700 hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Active Filters Info */}
                        {(filters.user_name || filters.problem) && (
                            <div className="mt-3 text-sm text-gray-600">
                                <span className="font-medium">Active filters:</span>
                                {filters.user_name && (
                                    <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                                        User: {filters.user_name}
                                    </span>
                                )}
                                {filters.problem && (
                                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                        Problem: {filters.problem}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reports Table */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            <p className="mt-2 text-gray-600">Loading reports...</p>
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
                                                Problem
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
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
                                        {filteredReports.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    {reports.length === 0 ? "No reports found" : "No reports match your filters"}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredReports.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {report.profiles?.username || "Unknown User"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {report.problems}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                        {report.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDelete(report.id)}
                                                            className="text-red-600 hover:text-red-900 font-medium py-1 px-3 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
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

export default Reports;