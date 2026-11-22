import React, { useState } from "react";
import { getData } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = getData();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData)

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/user/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (res.data.success) {
        navigate("/");
        setUser(res.data.user);
        localStorage.setItem("accessToken", res.data.accessToken);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen md:h-[760px] bg-green-100 overflow-hidden ">
      <div className="min-h-screen flex flex-col to-muted/20">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-start space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-green-600">
                Login to your account
              </h1>
              <p className="text-gray-600">
                Start organizing your thoughts and ideas today
              </p>
            </div>
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-green-600">
                  Login
                </CardTitle>
                <CardDescription className="text-center ">
                  Login to your account to get started with NoteApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to={"/forgot-password"}
                        className="text-[12px] text-gray-500"
                      >
                        Forgot Password
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        required
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent "
                        variant="ghost"
                      >
                        {showPassword ? (
                          <EyeClosed className="text-gray-600 w-4 h-4" />
                        ) : (
                          <Eye className="text-gray-600 w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-center text-sm">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-green-600 hover:underline font-medium"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 w-4 h-4" /> Logging
                      into your account..
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;
