import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Sparkles, Check, Loader2, X } from 'lucide-react'

interface EmailCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailSubmit: (email: string) => Promise<void>
  enhancementCount: number
}

export function EmailCaptureModal({ isOpen, onClose, onEmailSubmit, enhancementCount }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      await onEmailSubmit(email)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="w-6 h-6" /> {/* Spacer */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#C1F50A]" />
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <CardTitle className="text-2xl font-bold text-[#0D7877] mb-2">
            Your Enhanced {enhancementCount > 1 ? 'Images are' : 'Image is'} Ready!
          </CardTitle>
          <p className="text-gray-600">
            Enter your email to download your free enhanced {enhancementCount > 1 ? 'images' : 'image'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0D7877] hover:bg-[#0a5d5f] text-white py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Your Images...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Get My {enhancementCount > 1 ? 'Images' : 'Image'}
                </>
              )}
            </Button>

            {/* Benefits */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>Receive your enhanced {enhancementCount > 1 ? 'images' : 'image'} instantly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>Get exclusive offers and tips</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}