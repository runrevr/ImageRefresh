import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [location] = useLocation()
  
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const isActive = (path: string) => {
    return location === path
  }

  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-bungee text-2xl text-white">ImageRefresh</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <Link href="/">
                <span className={cn(
                  "hover:text-blue-400 transition-colors",
                  isActive('/') ? "text-blue-400 font-medium" : "text-gray-300"
                )}>
                  Home
                </span>
              </Link>
              
              <div className="relative group">
                <button className="flex items-center hover:text-blue-400 text-gray-300 transition-colors">
                  Features <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-black rounded-md shadow-lg overflow-hidden z-20 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300">
                  <Link href="/kids-drawing">
                    <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                      Kids Drawing Transformer
                    </span>
                  </Link>
                  <Link href="/product-image-lab">
                    <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                      Product Image Lab
                    </span>
                  </Link>
                  <Link href="/artistic">
                    <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                      Artistic Transformations
                    </span>
                  </Link>
                  <Link href="/animation">
                    <span className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                      Animation Effects
                    </span>
                  </Link>
                </div>
              </div>
              
              <Link href="/pricing">
                <span className={cn(
                  "hover:text-blue-400 transition-colors",
                  isActive('/pricing') ? "text-blue-400 font-medium" : "text-gray-300"
                )}>
                  Pricing
                </span>
              </Link>
              
              <Link href="/about">
                <span className={cn(
                  "hover:text-blue-400 transition-colors",
                  isActive('/about') ? "text-blue-400 font-medium" : "text-gray-300"
                )}>
                  About
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <RainbowButton>Sign Up</RainbowButton>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" onClick={closeMenu}>
              <span className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                isActive('/') 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}>
                Home
              </span>
            </Link>
            
            <div className="space-y-1 pl-3">
              <div className="text-gray-400 px-3 py-1 text-sm">Features</div>
              <Link href="/kids-drawing" onClick={closeMenu}>
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Kids Drawing Transformer
                </span>
              </Link>
              <Link href="/product-image-lab" onClick={closeMenu}>
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Product Image Lab
                </span>
              </Link>
              <Link href="/artistic" onClick={closeMenu}>
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Artistic Transformations
                </span>
              </Link>
              <Link href="/animation" onClick={closeMenu}>
                <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Animation Effects
                </span>
              </Link>
            </div>
            
            <Link href="/pricing" onClick={closeMenu}>
              <span className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                isActive('/pricing') 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}>
                Pricing
              </span>
            </Link>
            
            <Link href="/about" onClick={closeMenu}>
              <span className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                isActive('/about') 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}>
                About
              </span>
            </Link>
            
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <Link href="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-black">
                    Login
                  </Button>
                </Link>
              </div>
              <div className="mt-3 px-5">
                <Link href="/signup" onClick={closeMenu}>
                  <RainbowButton className="w-full">Sign Up</RainbowButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}