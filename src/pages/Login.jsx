import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Plane, User } from "lucide-react";
import { supabase } from "../supabaseClient"; // 👈 Import Supabase client

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔹 Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If no user found, optionally create (insert) a new admin user
      if (error.message.includes("Invalid login credentials")) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          alert("Failed to create admin: " + signUpError.message);
          console.error(signUpError);
          return;
        } else {
          alert("Admin account created. Check your email for verification.");
          localStorage.setItem("isAdminLoggedIn", "true");
          navigate("/dashboard");
        }
      } else {
        alert("Login failed: " + error.message);
        console.error(error);
      }
    } else {
      // Successful login
      localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Left side - Hero image */}
      <div
        className="hidden lg:flex lg:flex-1 bg-cover bg-center relative"
        style={{ backgroundImage: `url()` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-tourism-ocean/80 to-tourism-sunset/60" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="flex items-center mb-6">
            <h1 className="text-4xl font-bold">Explore Jaffna</h1>
          </div>
          <p className="text-xl text-center opacity-90"></p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4 lg:hidden">
              <CardTitle className="text-2xl">
                Yarl Wander Nest
              </CardTitle>
            </div>
            <CardTitle className="text-2xl font-semibold  hidden text-center lg:block">
              Admin Panel
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Sign in to your admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className=" block mb-1 text-sm font-medium space-y-2">
                <label className="block mb-1 text-sm font-medium" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tourism.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 block mb-1 text-sm font-medium">
                <label className="block mb-1 text-sm font-medium" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-tourism-ocean to-tourism-ocean-light hover:from-tourism-ocean-dark hover:to-tourism-ocean"
              >
                Sign In
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;