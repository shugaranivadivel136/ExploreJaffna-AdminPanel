import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Calendar, User, Search, Filter, RefreshCw, Edit, Shield, User as UserIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editLoading, setEditLoading] = useState(null); // Added for role editing
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });

  // 🔄 Fetch users from profiles table
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } else {
        setUsers(data || []);
        setFilteredUsers(data || []);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔍 Filter users based on search and filter
  useEffect(() => {
    let result = users;

    // Search filter
    if (filters.search) {
      result = result.filter(user =>
        user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(user => {
        if (filters.status === "active") return true;
        if (filters.status === "inactive") return false;
        return true;
      });
    }

    setFilteredUsers(result);
  }, [filters.search, filters.status, users]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all"
    });
  };

  // ❌ Delete user using API route
  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username || user.email}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(user.id);

    try {
      // Call the database function
      const { error } = await supabase
        .rpc('delete_user', { user_id: user.id });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('User deleted successfully from both profile and auth');
      
      // Remove user from local state immediately
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setFilteredUsers(prev => prev.filter(u => u.id !== user.id));

    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error.message.includes('permission denied')) {
        toast.error('Admin privileges required to delete users from auth system');
      } else {
        toast.error(`Failed to delete user: ${error.message}`);
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  // ✏️ Edit user role
  const handleEditRole = async (user, newRole) => {
    setEditLoading(user.id);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`User role updated to ${newRole}`);
      
      // Update user in local state
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, role: newRole } : u
      ));
      setFilteredUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, role: newRole } : u
      ));

    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(`Failed to update role: ${error.message}`);
    } finally {
      setEditLoading(null);
    }
  };

  // Toggle table visibility
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  // Role badge component
  const RoleBadge = ({ role, user, onEdit }) => {
    const isAdmin = role === 'admin';
    
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isAdmin 
            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {isAdmin ? (
            <Shield className="w-3 h-3 mr-1" />
          ) : (
            <UserIcon className="w-3 h-3 mr-1" />
          )}
          {role || 'user'}
        </span>
        
        <button
          onClick={() => {
            const newRole = role === 'admin' ? 'user' : 'admin';
            if (window.confirm(`Change ${user.username || user.email} role to ${newRole}?`)) {
              onEdit(user, newRole);
            }
          }}
          disabled={editLoading === user.id}
          className="text-gray-500 hover:text-gray-700 disabled:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 disabled:cursor-not-allowed"
          title={`Change to ${role === 'admin' ? 'user' : 'admin'}`}
        >
          {editLoading === user.id ? (
            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-gray-600"></div>
          ) : (
            <Edit className="h-3 w-3" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Users Management</h1>
          <p className="text-blue-100">Manage and view all registered users from the mobile app</p>
        </div>
        
        <div className="p-6 md:p-8">
          {/* Toggle Table Button */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Users Directory</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh Users'}
              </button>
              <button
                onClick={toggleTableVisibility}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <span className="mr-2">{isTableVisible ? '▲' : '▼'}</span>
                {isTableVisible ? 'Hide Users' : 'View All Users'}
              </button>
            </div>
          </div>

          {/* Filter Section - Only shown when table is visible */}
          {isTableVisible && (
            <div className="mb-6 bg-gradient-to-r from-pink-50 to-orange-50 p-5 rounded-xl border border-pink-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-pink-600" />
                Filter Users
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      name="search"
                      placeholder="Search by name, username, or email..."
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-pink-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          )}

          {/* Users List - Only shown when table is visible */}
          {isTableVisible && (loading && !users.length ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <User className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    {users.length === 0 ? 'No users yet' : 'No matching users found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {users.length === 0 ? 'Users will appear here once they register' : 'Try adjusting your search or filters'}
                  </p>
                  {(filters.search || filters.status !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">User</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Contact</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden xl:table-cell">Joined</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">User ID</th>
                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {user.full_name || user.username || "No Name"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{user.username || "nousername"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden md:table-cell">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 mt-1">
                                {user.phone}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <RoleBadge 
                              role={user.role} 
                              user={user} 
                              onEdit={handleEditRole}
                            />
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden xl:table-cell">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-green-500" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-700 hidden lg:table-cell">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {user.id.slice(0, 8)}...
                            </code>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleDelete(user)}
                                disabled={deleteLoading === user.id}
                                className="text-red-600 hover:text-red-800 disabled:text-red-300 transition-colors p-1 rounded-md hover:bg-red-50 disabled:cursor-not-allowed"
                                title="Delete User"
                              >
                                {deleteLoading === user.id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
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
}