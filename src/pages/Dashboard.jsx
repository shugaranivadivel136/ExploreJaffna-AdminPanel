import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  ShoppingCart,
  MessageCircle,
  Clock,
  Award,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Package,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";

// Import your image from the assets folder
import dashboardHeader from "../assets/logos.png";

// Colors for the pie chart
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalPlaces: 0,
    totalRestaurants: 0,
    totalProducts: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [destinationData, setDestinationData] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Function to format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  // Function to get overall average rating from all reviews
  const getOverallAverageRating = async () => {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating');

      if (error) {
        console.error('Error fetching reviews for average rating:', error);
        return 0;
      }

      if (!reviews || reviews.length === 0) {
        return 0;
      }

      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const average = totalRating / reviews.length;
      
      return parseFloat(average.toFixed(1));

    } catch (error) {
      console.error('Error in getOverallAverageRating:', error);
      return 0;
    }
  };

  // Fetch recent activities from database
  const fetchRecentActivities = async () => {
    try {
      // Fetch recent reviews count
      const { data: recentReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recently added places
      const { data: recentPlaces, error: placesError } = await supabase
        .from('places')
        .select('p_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recently added events
      const { data: recentEvents, error: eventsError } = await supabase
        .from('events')
        .select('event_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recently added native products
      const { data: recentProducts, error: productsError } = await supabase
        .from('native_products')
        .select('product_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recently registered users
      const { data: recentUsers, error: usersError } = await supabase
        .from('profiles')
        .select('username, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch TOTAL count of reports from reports table
      const { count: totalReportsCount, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      if (reviewsError || placesError || eventsError || productsError || usersError || reportsError) {
        throw new Error('Error fetching recent activities');
      }

      // Combine all activities and sort by creation date
      const activities = [];

      // Add review activities - show count of recent reviews
      if (recentReviews && recentReviews.length > 0) {
        const reviewCount = recentReviews.length;
        const latestReviewTime = recentReviews[0].created_at;
        activities.push({
          type: 'review',
          event: `We have got ${reviewCount} new reviews from users`,
          time: getTimeAgo(latestReviewTime),
          created_at: latestReviewTime
        });
      }

      // Add report activities - show TOTAL count of reports
      if (totalReportsCount && totalReportsCount > 0) {
        // Get the latest report timestamp for time display
        const { data: latestReport, error: latestReportError } = await supabase
          .from('reports')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        const latestReportTime = latestReport && latestReport.length > 0 ? latestReport[0].created_at : new Date();
        
        activities.push({
          type: 'report',
          event: `We have got ${totalReportsCount} total reports from users`,
          time: getTimeAgo(latestReportTime),
          created_at: latestReportTime
        });
      }

      // Add place activities
      if (recentPlaces) {
        recentPlaces.forEach(place => {
          activities.push({
            type: 'destination',
            event: `New destination "${place.p_name}" published`,
            time: getTimeAgo(place.created_at),
            created_at: place.created_at
          });
        });
      }

      // Add event activities
      if (recentEvents) {
        recentEvents.forEach(event => {
          activities.push({
            type: 'event',
            event: `New event "${event.event_name}" added`,
            time: getTimeAgo(event.created_at),
            created_at: event.created_at
          });
        });
      }

      // Add product activities
      if (recentProducts) {
        recentProducts.forEach(product => {
          activities.push({
            type: 'product',
            event: `New native product "${product.product_name}" added`,
            time: getTimeAgo(product.created_at),
            created_at: product.created_at
          });
        });
      }

      // Add user activities
      if (recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            type: 'user',
            event: `New user "${user.username}" registered`,
            time: getTimeAgo(user.created_at),
            created_at: user.created_at
          });
        });
      }

      // Sort by creation date (newest first) and get top 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentActivities(sortedActivities);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Fallback to empty array if there's an error
      setRecentActivities([]);
    }
  };

  // Fetch user growth data by month
  const fetchUserGrowthData = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at');

      if (error) {
        throw error;
      }

      if (!profiles || profiles.length === 0) {
        setUserGrowthData([]);
        return;
      }

      // Group users by month and year
      const monthlyData = {};
      
      profiles.forEach(profile => {
        const date = new Date(profile.created_at);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthName,
            users: 0,
            fullDate: date
          };
        }
        monthlyData[monthYear].users += 1;
      });

      // Convert to array and sort by date
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => a.fullDate - b.fullDate)
        .map(item => ({
          month: item.month,
          users: item.users
        }));

      setUserGrowthData(sortedData);

    } catch (error) {
      console.error('Error fetching user growth data:', error);
      setUserGrowthData([]);
    }
  };

  // Fetch counts from Supabase
  const fetchCounts = async () => {
    try {
      setLoading(true);
      
      // Fetch users count (from auth.users)
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch places count
      const { count: placesCount, error: placesError } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true });

      // Fetch restaurants count
      const { count: restaurantsCount, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });

      // Fetch native products count
      const { count: productsCount, error: productsError } = await supabase
        .from('native_products')
        .select('*', { count: 'exact', head: true });

      // Fetch reviews count
      const { count: reviewsCount, error: reviewsError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      // Get overall average rating
      const overallRating = await getOverallAverageRating();

      // Update stats state
      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalPlaces: placesCount || 0,
        totalRestaurants: restaurantsCount || 0,
        totalProducts: productsCount || 0,
        totalReviews: reviewsCount || 0
      });

      // Set average rating
      setAverageRating(overallRating);

    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch destination data with average ratings
  const fetchDestinationData = async () => {
    try {
      // Fetch all reviews with place information
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          rating,
          place_id,
          places!inner(p_name)
        `);

      if (error) {
        throw error;
      }

      // If no reviews data, set empty array
      if (!reviewsData || reviewsData.length === 0) {
        setDestinationData([]);
        return;
      }

      // Calculate average rating for each unique place
      const placeRatings = {};
      
      reviewsData.forEach(review => {
        const placeId = review.place_id;
        const placeName = review.places.p_name;
        const rating = review.rating;
        
        if (!placeRatings[placeId]) {
          placeRatings[placeId] = {
            name: placeName,
            totalRating: 0,
            count: 0
          };
        }
        
        placeRatings[placeId].totalRating += rating;
        placeRatings[placeId].count += 1;
      });

      // Convert to array and calculate average ratings
      const placesWithRatings = Object.values(placeRatings).map(place => ({
        name: place.name,
        averageRating: place.count > 0 ? parseFloat((place.totalRating / place.count).toFixed(1)) : 0,
        reviewCount: place.count,
        totalRating: place.totalRating
      }));

      // Sort by average rating (descending) and get top 5
      const topPlaces = placesWithRatings
        .filter(place => place.averageRating > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);

      // Format data for pie chart using only Supabase data
      const pieChartData = topPlaces.map((place, index) => ({
        name: place.name,
        bookings: Math.round((place.averageRating / 5) * 100), // Convert 0-5 rating to percentage
        averagingRating: place.averageRating,
        reviewCount: place.reviewCount,
        color: COLORS[index % COLORS.length],
        isIndividual: true
      }));

      setDestinationData(pieChartData);

    } catch (error) {
      console.error('Error fetching destination data:', error);
      // Only set empty array on error - no fallback data
      setDestinationData([]);
    }
  };

  // Set up real-time subscriptions
  const setupRealtimeSubscriptions = () => {
    // Subscribe to profiles changes
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          fetchCounts();
          fetchUserGrowthData();
          fetchRecentActivities();
          if (payload.eventType === 'INSERT') {
            // Show popup for new user
            const newUser = payload.new;
            alert(`New user "${newUser.username}" has registered!`);
          }
        }
      )
      .subscribe();

    // Subscribe to events changes
    const eventsSubscription = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          fetchCounts();
          fetchRecentActivities();
          if (payload.eventType === 'INSERT') {
            // Show popup for new event
            const newEvent = payload.new;
            alert(`New event "${newEvent.event_name}" has been added!`);
          }
        }
      )
      .subscribe();

    // Subscribe to places changes
    const placesSubscription = supabase
      .channel('places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          fetchCounts();
          fetchDestinationData();
          fetchRecentActivities();
          if (payload.eventType === 'INSERT') {
            // Show popup for new place
            const newPlace = payload.new;
            alert(`New destination "${newPlace.p_name}" has been published!`);
          }
        }
      )
      .subscribe();

    // Subscribe to restaurants changes
    const restaurantsSubscription = supabase
      .channel('restaurants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants'
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    // Subscribe to native_products changes
    const productsSubscription = supabase
      .channel('native_products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'native_products'
        },
        (payload) => {
          fetchCounts();
          fetchRecentActivities();
          if (payload.eventType === 'INSERT') {
            // Show popup for new product
            const newProduct = payload.new;
            alert(`New native product "${newProduct.product_name}" has been added!`);
          }
        }
      )
      .subscribe();

    // Subscribe to reviews changes
    const reviewsSubscription = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          fetchCounts();
          fetchDestinationData();
          fetchRecentActivities();
          if (payload.eventType === 'INSERT') {
            // Show popup for new review
            const newReview = payload.new;
            alert(`We have got new reviews from users!`);
          }
        }
      )
      .subscribe();

    // Subscribe to reports changes
    const reportsSubscription = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          fetchRecentActivities();
          if (payload.eventType === 'INSERT') {
            // Show popup for new report
            alert(`We have got new reports from users!`);
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      profilesSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
      placesSubscription.unsubscribe();
      restaurantsSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      reviewsSubscription.unsubscribe();
      reportsSubscription.unsubscribe();
    };
  };

  useEffect(() => {
    fetchCounts();
    fetchDestinationData();
    fetchUserGrowthData();
    fetchRecentActivities();
    const cleanup = setupRealtimeSubscriptions();

    return cleanup;
  }, []);

  // icon buttons
  const navigateToEvents = () => navigate("/dashboard/events");
  const navigateToUsers = () => navigate("/dashboard/users");
  const navigateToNativeProducts = () => navigate("/dashboard/native_products");
  const navigateToPlaces = () => navigate("/dashboard/places");

  return (
    <div className="space-y-4 p-0 bg-white min-h-screen">
      {/* Header with Full Image- Scrollable Container */}
      <div className="relative overflow-hidden shadow-xl h-100 overflow-y-auto">

        <div 
          className="absolute inset-0 bg-cover bg-center min-h-[800px]"
          style={{ backgroundImage: `url(${dashboardHeader})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 p-8 min-h-[800px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="text-white">
              <h1 className="text-6xl font-bold mb-2">
                Home Page Overview
              </h1>
              <p className="text-blue-100 flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5" />
                Welcome back! Here's your tourism app performance summary
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Events Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <button 
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
              onClick={navigateToEvents}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {loading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                stats.totalEvents
              )}
            </div>
            <div className="flex items-center text-green-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Live count of events</span>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Active Users</CardTitle>
            <button 
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
              onClick={navigateToUsers}
            >
              <Users className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {loading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                stats.totalUsers
              )}
            </div>
            <div className="flex items-center text-pink-100 text-lg">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Live count of active users</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Native Products</CardTitle>
            <button 
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
              onClick={navigateToNativeProducts}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {loading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                stats.totalProducts
              )}
            </div>
            <div className="flex items-center text-emerald-100 text-lg">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Live count of native products</span>
            </div>
          </CardContent>
        </Card>

        {/* Destinations Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Destinations</CardTitle>
            <button 
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
              onClick={navigateToPlaces}
            >
              <MapPin className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {loading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                stats.totalPlaces
              )}
            </div>
            <div className="flex items-center text-green-100 text-lg">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Live count of destinations</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Count Growth Chart */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-black-600" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowthData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={userGrowthData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 14 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip 
                      formatter={(value) => [`${value} users`, 'Total Users']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-lg text-gray-600">
                  <TrendingUp className="h-4 w-4 inline mr-1 text-green-500" />
                  Total user growth over time
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No user data available</p>
                <p className="text-sm">User growth will appear here once users register</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              Top Rated Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {destinationData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={destinationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="bookings"
                    >
                      {destinationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (props.payload.isIndividual) {
                          return [`${value}%`, 'Rating Score'];
                        } else {
                          return [`${value}%`, 'Average Rating Score'];
                        }
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 mt-4">
                  {destinationData.map((destination, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: destination.color }}
                        ></div>
                        <div>
                          <span className="text-lg font-medium">{destination.name}</span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{destination.averagingRating}</span>
                            <span>({destination.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold">{destination.bookings}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No rating data available</p>
                <p className="text-lg">Reviews will appear here once added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'review' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'event' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'destination' ? 'bg-orange-100 text-orange-600' :
                      activity.type === 'product' ? 'bg-green-100 text-green-600' :
                      activity.type === 'user' ? 'bg-pink-100 text-pink-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {activity.type === 'review' && <MessageCircle className="h-6 w-6" />}
                      {activity.type === 'event' && <Calendar className="h-6 w-6" />}
                      {activity.type === 'destination' && <MapPin className="h-6 w-6" />}
                      {activity.type === 'product' && <Package className="h-6 w-6" />}
                      {activity.type === 'user' && <Users className="h-6 w-6" />}
                      {activity.type === 'report' && <AlertTriangle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {activity.event}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activities will appear here once users interact with the system</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <div className="bg-emerald-500 backdrop-blur-sm rounded-lg p-4 shadow-xl text-center">
          <MessageCircle className="h-6 w-6 text-white mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
          <div className="text-lg text-gray-900">Reviews</div>
        </div>
        <div className="bg-emerald-500 backdrop-blur-sm rounded-lg p-4 shadow-xl text-center">
          <Award className="h-6 w-6 text-white mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {loading ? (
              <div className="w-6 h-6 border-2 border-black-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              averageRating || 0
            )}
          </div>
          <div className="text-lg text-gray-900">Avg Rating</div>
        </div>
        <div className="bg-emerald-500 backdrop-blur-sm rounded-lg p-4 shadow-xl text-center">
          <Navigation className="h-6 w-6 text-white mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.totalRestaurants}</div>
          <div className="text-lg text-gray-900">Restaurants</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white backdrop-blur-none p-0 shadow-soft">
        <div className="text-center">
          <p className="text-gray-900 text-lg">
            © 2025 Copyright: <span className="font-semibold text-emelard-600">Syntex Pillers</span>
          </p>
          <p className="text-gray-700 text-sm mt-2">
            Explore Jaffna Tourism Admin Dashboard | All rights reserved
          </p>
          <div className="flex justify-center space-x-4 mt-3">
            <span className="text-gray-600 text-sm">Version 1.0.0</span>
            <span className="text-gray-600 text-sm">•</span>
            <span className="text-gray-600 text-sm">Powered by Supabase & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;