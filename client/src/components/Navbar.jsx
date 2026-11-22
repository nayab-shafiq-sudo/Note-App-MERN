import { Book, BookA, BookOpen, LogOut, User } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios";
import { getData } from "@/context/UserContext";
import { toast } from "sonner";

const Navbar = () => {
  const {user, setUser} = getData();
  const accessToken = localStorage.getItem('accessToken')

  const handleLogout = async () =>{
    try {
      const res = await axios.post('http://localhost:3000/user/logout',{}, {
        headers:{
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (res.data.success){
        setUser(null)
        toast.success(res.data.message)
        localStorage.clear()
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <nav className="px-2 py-4 border-b border-gray-200 bg-transparent">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/** logo section */}
        <div className="flex gap-2 items-center">
          <BookOpen className="h-6 w-6 text-green-800" />
          <h1 className="font-bold text-xl">
            <span className="text-green-600">Notes</span>
            <span>app</span>
          </h1>
        </div>
        {/** links section */}
        <div className="flex gap-6 items-center">
          <ul className="flex gap-6 items-center font-semibold">
            <li>Features</li>
            <li>Pricing</li>
            <li>About</li>
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" />}>
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><User/>Profile</DropdownMenuItem>
                      <DropdownMenuItem><BookA/>Notes</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleLogout}><LogOut/>Logout</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to={"/login"} className="text-green-700">
                Login
              </Link>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
