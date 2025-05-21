import React from 'react'
import { Link } from 'wouter'
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bungee text-xl mb-4">ImageRefresh</h3>
            <p className="text-gray-400 mb-4">
              Transform your photos with the power of AI. Create stunning transformations with just a few clicks.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Features</h4>
            <ul className="space-y-2">
              <li><Link to="/kids-drawing" className="text-gray-400 hover:text-white">Kids Drawing Transformer</Link></li>
              <li><Link to="/product-image-lab" className="text-gray-400 hover:text-white">Product Image Lab</Link></li>
              <li><Link to="/artistic" className="text-gray-400 hover:text-white">Artistic Transformations</Link></li>
              <li><Link to="/animation" className="text-gray-400 hover:text-white">Animation Effects</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/testimonials" className="text-gray-400 hover:text-white">Testimonials</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail size={16} />
                <span>support@imagerefresh.com</span>
              </li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Form</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 ImageRefresh. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
              <Link to="/cookies" className="text-gray-500 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}