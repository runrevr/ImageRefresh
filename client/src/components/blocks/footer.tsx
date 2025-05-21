'use client'
import React from 'react'
import { Link } from 'wouter'

// Import logo
import logoImage from '../../assets/logo.png'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-[#F8F9FA] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and tagline */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/">
              <a className="flex items-center">
                <img src={logoImage} alt="ImageRefresh Logo" className="h-8 w-auto mr-2" />
                <span className="text-xl font-bold text-[#2A7B9B]">ImageRefresh</span>
              </a>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Transform your product photos with AI-powered tools designed for businesses of all sizes.
            </p>
          </div>
          
          {/* Products column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/upload">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Image Transformations
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/product-image-lab">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Product Lab
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/api">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    API Access
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/enterprise">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Enterprise Solutions
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/gallery">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Gallery
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Blog
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/docs">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Documentation
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Help Center
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Pricing
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Contact
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <a className="text-sm text-gray-600 hover:text-[#2A7B9B]">
                    Careers
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} ImageRefresh. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/terms">
              <a className="text-sm text-gray-500 hover:text-[#2A7B9B]">
                Terms
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-sm text-gray-500 hover:text-[#2A7B9B]">
                Privacy
              </a>
            </Link>
            <Link href="/cookies">
              <a className="text-sm text-gray-500 hover:text-[#2A7B9B]">
                Cookies
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}