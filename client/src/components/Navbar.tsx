import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import logoImage from "../assets/logo-new.png";
import { useAuth } from "@/hooks/useAuth";
import { Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  freeCredits: number;
  paidCredits: number;
}

export default function Navbar({ freeCredits, paidCredits }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const totalCredits = freeCredits + paidCredits;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm bg-gradient-to-r from-white via-primary-50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-2 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <img
              src={logoImage}
              alt="ImageRefresh Logo"
              className="h-12 md:h-14"
              style={{ maxWidth: "280px" }}
            />
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/ideas"
            className="header-menu text-[#333333] hover:text-[#FF7B54] transition text-lg font-bold"
          >
            Ideas
          </Link>
          <Link
            href="/product-image-lab"
            className="header-menu text-[#333333] hover:text-[#FF7B54] transition text-lg font-bold"
          >
            Product Image Lab
          </Link>
          <Link
            href="/pricing"
            className="header-menu text-[#333333] hover:text-[#FF7B54] transition text-lg font-bold"
          >
            Pricing
          </Link>
          <Link
            href="/help"
            className="header-menu text-[#333333] hover:text-[#FF7B54] transition text-lg font-bold"
          >
            Help
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="hidden sm:block text-sm font-medium">
                <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full flex items-center">
                  <Bot className="h-4 w-4 mr-1 text-primary-600" />
                  {totalCredits} credits
                </span>
              </div>
              <Link href="/buy-credits">
                <Button className="hidden sm:block bg-[#FF7B54] hover:bg-secondary-600 text-white border-none">
                  Buy Credits
                </Button>
              </Link>
            </>
          )}

          {/* User account dropdown or auth buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center">
                  <span className="mr-1">{user.username}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/transformations">My Images</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/auth?tab=login">
                <Button
                  variant="outline"
                  className="bg-[#333333] text-[#f2f2f2] hover:bg-neutral-800 border-[#f2f2f2]"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-[#FF7B54] hover:bg-secondary-600 text-white border-none">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="md:hidden z-50 flex items-center justify-center hover:bg-opacity-90 relative"
                style={{
                  backgroundColor: 'rgba(255, 123, 84, 0.95)', // Using #FF7B54 (secondary color) with high opacity
                  color: 'white',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid white',
                  position: 'relative'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#333333]">
              <div className="flex items-center mb-6 pt-4">
                <img
                  src={logoImage}
                  alt="ImageRefresh Logo"
                  className="h-10"
                  style={{ maxWidth: "220px" }}
                />
              </div>
              <div className="flex flex-col space-y-4">
                <Link
                  href="/ideas"
                  className="header-menu py-2 text-white hover:text-[#FF7B54] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ideas
                </Link>
                <Link
                  href="/product-image-lab"
                  className="header-menu py-2 text-white hover:text-[#FF7B54] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Product Image Lab
                </Link>
                <Link
                  href="/pricing"
                  className="header-menu py-2 block text-white hover:text-[#FF7B54] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/help"
                  className="header-menu py-2 text-white hover:text-[#FF7B54] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help
                </Link>
                <div className="pt-4 border-t border-gray-600">
                  {user && (
                    <>
                      <div className="text-sm font-medium mb-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full flex items-center">
                          <Bot className="h-4 w-4 mr-1 text-primary-600" />
                          {totalCredits} credits
                        </span>
                      </div>
                      <Link href="/buy-credits">
                        <Button
                          className="w-full mb-3 bg-[#FF7B54] hover:bg-secondary-600 text-white border-none"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Buy Credits
                        </Button>
                      </Link>
                    </>
                  )}

                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full mb-2 bg-[#333333] text-[#f2f2f2] hover:bg-neutral-800 border-[#f2f2f2]"
                        >
                          My Account
                        </Button>
                      </Link>
                      <Link
                        href="/transformations"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full mb-2 bg-[#333333] text-[#f2f2f2] hover:bg-neutral-800 border-[#f2f2f2]"
                        >
                          My Images
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:text-[#FF7B54]"
                        onClick={() => {
                          logoutMutation.mutate();
                          setIsMenuOpen(false);
                        }}
                      >
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth?tab=login"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full mb-2 bg-[#333333] text-[#f2f2f2] hover:bg-neutral-800 border-[#f2f2f2]"
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-[#FF7B54] hover:bg-secondary-600 text-white border-none">
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
