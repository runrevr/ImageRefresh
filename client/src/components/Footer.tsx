import { Twitter, Instagram, Facebook } from 'lucide-react';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/attached_assets/img%20logo%20small%20trans.png" 
                alt="ImageRefresh Logo" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Transform your photos with the power of AI. 
              Create stunning image transformations with just a few clicks.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">AI Image Editing</Link></li>
              <li><Link href="/ideas" className="text-gray-400 hover:text-white transition">Transformation Ideas</Link></li>
              <li><Link href="/kids-drawing" className="text-gray-400 hover:text-white transition">Drawing to Reality</Link></li>
              <li><Link href="/product-enhancement" className="text-gray-400 hover:text-white transition">Product Enhancement</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Pricing</h3>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing & Credits</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ImageRefresh.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
