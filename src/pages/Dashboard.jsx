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

// Enhanced mock data
const revenueData = [
  {/* month: "Jan", revenue: 45000, visitors: 1200 },
  { month: "Feb", revenue: 52000, visitors: 1400 },
  { month: "Mar", revenue: 48000, visitors: 1300 },
  { month: "Apr", revenue: 61000, visitors: 1800 },
  { month: "May", revenue: 72000, visitors: 2100 },
  { month: "Jun", revenue: 68000, visitors: 1900 },
  { month: "Jul", revenue: 85000, visitors: 2500 */},
];

const destinationData = [
  {/* name: "Jaffna Fort", bookings: 35, color: "#3B82F6" },
  { name: "Nallur Temple", bookings: 28, color: "#EF4444" },
  { name: "Casuarina Beach", bookings: 22, color: "#10B981" },
  { name: "Nagadeepa", bookings: 15, color: "#F59E0B" */},
];

const activityData = [
  {/* time: "2 min ago", event: "New booking received", type: "booking" },
  { time: "5 min ago", event: "User review submitted", type: "review" },
  { time: "1 hour ago", event: "Event published", type: "event" },
  { time: "2 hours ago", event: "New destination added", type: "destination" */},
];

const Dashboard = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const navigateToEvents = () => navigate("/events");
  const navigateToUsers = () => navigate("/users");
  //const navigateToProducts = () => navigate("/products");
  const navigateToPlaces = () => navigate("/places");


  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Welcome back! Here's your tourism app performance summary
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-soft border">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600">System Active</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Events Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">24</div>
            <div className="flex items-center text-blue-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">1,842</div>
            <div className="flex items-center text-pink-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8% from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Native Products</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">156</div>
            <div className="flex items-center text-emerald-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+5 new this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Destinations Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">42</div>
            <div className="flex items-center text-orange-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+3 new locations</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Revenue & Visitors Analytics
            </CardTitle>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                Monthly
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                Quarterly
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              Popular Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Tooltip />
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
                    <span className="text-sm font-medium">{destination.name}</span>
                  </div>
                  <span className="text-sm font-bold">{destination.bookings}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Progress */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-purple-600" />
              Monthly Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Revenue Target</span>
                <span className="font-bold text-purple-600">$68K / $100K</span>
              </div>
              <Progress value={68} className="h-3 bg-purple-100" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">User Acquisition</span>
                <span className="font-bold text-blue-600">1,842 / 2,500</span>
              </div>
              <Progress value={74} className="h-3 bg-blue-100" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Customer Satisfaction</span>
                <span className="font-bold text-green-600">4.8 / 5.0</span>
              </div>
              <Progress value={96} className="h-3 bg-green-100" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Content Published</span>
                <span className="font-bold text-orange-600">42 / 50</span>
              </div>
              <Progress value={84} className="h-3 bg-orange-100" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityData.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                    activity.type === 'review' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'event' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'booking' && <ShoppingCart className="h-4 w-4" />}
                    {activity.type === 'review' && <MessageCircle className="h-4 w-4" />}
                    {activity.type === 'event' && <Calendar className="h-4 w-4" />}
                    {activity.type === 'destination' && <MapPin className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.event}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              View All Activities
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-soft border text-center">
          <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">12.4K</div>
          <div className="text-sm text-gray-600">Page Views</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-soft border text-center">
          <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">324</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-soft border text-center">
          <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">4.8</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-soft border text-center">
          {/*<Plane className="h-6 w-6 text-orange-600 mx-auto mb-2" />*/}
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Bookings</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;