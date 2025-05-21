'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'

// Import logo
import logoImage from '../../assets/logo.png'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center">
              <img src={logoImage} alt="ImageRefresh Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold text-[#2A7B9B]">ImageRefresh</span>
            </a>
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link href="/upload">
            <a className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Image Transformations
            </a>
          </Link>
          <Link href="/product-image-lab">
            <a className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Product Lab
            </a>
          </Link>
          <Link href="/pricing">
            <a className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Pricing
            </a>
          </Link>
          <Link href="/login">
            <a className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Sign In
            </a>
          </Link>

          <Button size="sm" className="rounded-full bg-[#2A7B9B] hover:bg-[#2A7B9B]/90">
            Get Started
          </Button>
        </nav>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-background pb-32 md:hidden",
          {
            "hidden": !isOpen,
          }
        )}
      >
        <div className="grid grid-flow-row auto-rows-max p-6">
          <Link href="/upload">
            <a className="flex w-full items-center py-3 text-base font-medium" onClick={() => setIsOpen(false)}>
              Image Transformations
            </a>
          </Link>
          <Link href="/product-image-lab">
            <a className="flex w-full items-center py-3 text-base font-medium" onClick={() => setIsOpen(false)}>
              Product Lab
            </a>
          </Link>
          <Link href="/pricing">
            <a className="flex w-full items-center py-3 text-base font-medium" onClick={() => setIsOpen(false)}>
              Pricing
            </a>
          </Link>
          <Link href="/login">
            <a className="flex w-full items-center py-3 text-base font-medium" onClick={() => setIsOpen(false)}>
              Sign In
            </a>
          </Link>
          <div className="mt-4">
            <Button className="w-full rounded-full bg-[#2A7B9B] hover:bg-[#2A7B9B]/90">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}