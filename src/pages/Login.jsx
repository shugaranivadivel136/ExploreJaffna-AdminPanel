import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield, 
  MapPin, 
  Plane, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔹 Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If no user found, don't auto-create - show error
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials.");
        } else {
          setError("Login failed: " + error.message);
          console.error(error);
        }
      } else {
        // Successful login - check user role
        if (data.user) {
          const userRole = await checkUserRole(data.user.id);
          
          if (userRole === 'admin') {
            // User is admin - allow access
            localStorage.setItem("isAdminLoggedIn", "true");
            localStorage.setItem("adminEmail", data.user.email);
            localStorage.setItem("userId", data.user.id);
            navigate("/dashboard");
          } else {
            // User is not admin - show error and sign out
            setError("Access denied. You do not have admin privileges.");
            await supabase.auth.signOut();
          }
        } else {
          setError("User data not found. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError("Failed to send reset email: " + error.message);
        console.error(error);
      } else {
        setResetSent(true);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setForgotPassword(false);
    setResetSent(false);
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Plane className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-blue-900"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Explore Jaffna
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Admin Portal - Restricted Access
            </p>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 gap-6 mt-8 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-blue-100">Manage Tourism Content</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-blue-100">Admin Access Only</span>
            </div>
          </div>

          {/* Footer Text */}
          <div className="absolute bottom-8 text-center">
            <p className="text-blue-200/60 text-sm">
              Restricted to authorized administrators only
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Explore Jaffna
            </h1>
            <p className="text-gray-600 mt-2">Admin Portal - Restricted Access</p>
          </div>

          <Card className="w-full shadow-2xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {forgotPassword ? "Reset Password" : "Admin Portal"}
              </CardTitle>
              <p className="text-gray-500 text-sm mt-2">
                {forgotPassword 
                  ? "Enter your email to reset your password" 
                  : "Sign in with admin credentials to access dashboard"
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {forgotPassword ? (
                // Forgot Password Form
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {resetSent ? (
                    // Success Message
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Check Your Email
                        </h3>
                        <p className="text-gray-600 text-sm">
                          We've sent a password reset link to <strong>{email}</strong>. 
                          Please check your inbox and follow the instructions to reset your password.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-xs text-yellow-800">
                          💡 <strong>Tip:</strong> If you don't see the email, check your spam folder.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleBackToLogin}
                        className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </div>
                  ) : (
                    // Reset Password Form
                    <>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-cyan-600" />
                          Email Address
                        </label>
                        <div className="relative">
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="admin@yarlwandernest.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200"
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
                      >
                        {resetLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Reset Link...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Send Reset Link</span>
                          </div>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToLogin}
                        className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </>
                  )}
                </form>
              ) : (
                // Login Form
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-cyan-600" />
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@yarlwandernest.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Lock className="w-4 h-4 mr-2 text-cyan-600" />
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotPassword(true)}
                        className="text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12 bg-white/50 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-200"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying Access...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Access Dashboard</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* Security Notice */}
              {!forgotPassword && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-cyan-800">Admin Access Only</p>
                      <p className="text-xs text-cyan-600 mt-1">
                        This portal is restricted to users with admin privileges. 
                        Regular users will not be granted access.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Info */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Need admin access? Contact{" "}
                  <a 
                    href="mailto:support@yarlwandernest.com" 
                    className="text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    support@yarlwandernest.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <div className="text-center mt-6 lg:hidden">
            <p className="text-xs text-gray-500">
              © 2025 Explore Jaffna. Admin Access Required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;