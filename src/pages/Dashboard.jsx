import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plane,
  Star,
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
} from "recharts";

// Mock data for charts
const revenueData = [
  
];

const destinationData = [
  
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome! Here's what's happening with your tourism mobile app</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-tourism-ocean shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-tourism-ocean" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"></div>
            <div className="flex items-center text-xs text-tourism-ocean">
              <TrendingUp className="h-3 w-3 mr-1" />

            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-tourism-sunset shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-tourism-sunset" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"></div>
            <div className="flex items-center text-xs text-tourism-sunset">
              <TrendingUp className="h-3 w-3 mr-1" />
              
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-tourism-mint shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Native Products</CardTitle>
            {/* <DollarSign className="h-4 w-4 text-tourism-mint" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"></div>
            <div className="flex items-center text-xs text-tourism-mint">
              <TrendingUp className="h-3 w-3 mr-1" />

            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-tourism-coral shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-tourism-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">  </div>
            <div className="flex items-center text-xs text-tourism-coral">
              <TrendingUp className="h-3 w-3 mr-1" />
    
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-tourism-ocean" />
              
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="hsl(207, 90%, 54%)"
                  fill="hsl(207, 85%, 70%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-tourism-sunset" />
              Popular Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={destinationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="bookings"
                >
                  {destinationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-tourism-coral" />
              Monthly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>  </span>
                <span>  </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>  </span>
                <span>  </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>User Reviews Rating</span>
                <span>  </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

<Card className="shadow-medium">
          <CardHeader>
        
            <CardTitle className="flex items-center gap-2">
              {/* <Plane className="h-5 w-5 text-tourism-mint" /> */}
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-tourism-ocean rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium"> </p>
                  <p className="text-xs text-muted-foreground"> </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-tourism-sunset rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium"> </p>
                  <p className="text-xs text-muted-foreground"> </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-tourism-mint rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium"> </p>
                  <p className="text-xs text-muted-foreground">   </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;