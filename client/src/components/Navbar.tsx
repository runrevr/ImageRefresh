import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Wand2 } from 'lucide-react';
import { Link } from 'wouter';

interface NavbarProps {
  freeCredits: number;
  paidCredits: number;
}

export default function Navbar({ freeCredits, paidCredits }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const totalCredits = freeCredits + paidCredits;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Wand2 className="h-6 w-6 text-primary-500" />
            <span className="font-bold text-xl text-primary-500">ImageMixer</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#examples" className="text-gray-600 hover:text-primary-500 transition">Examples</a>
          <a href="#pricing" className="text-gray-600 hover:text-primary-500 transition">Pricing</a>
          <a href="#faq" className="text-gray-600 hover:text-primary-500 transition">Help</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-sm text-gray-500">
            <span>{totalCredits}</span> free edit{totalCredits !== 1 ? 's' : ''} remaining
          </div>
          <Link href="#pricing">
            <Button className="hidden sm:block">
              Get More Credits
            </Button>
          </Link>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
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
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-6">
                <a 
                  href="#examples" 
                  className="text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Examples
                </a>
                <a 
                  href="#pricing" 
                  className="text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <a 
                  href="#faq" 
                  className="text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help
                </a>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">
                    {totalCredits} free edit{totalCredits !== 1 ? 's' : ''} remaining
                  </div>
                  <Link href="#pricing">
                    <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                      Get More Credits
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
