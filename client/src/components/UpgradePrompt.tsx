import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Zap, ArrowRight, Check } from 'lucide-react'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  onSignUp: () => void
  onViewPricing: () => void
}

export function UpgradePrompt({ isOpen, onClose, onSignUp, onViewPricing }: UpgradePromptProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF7B54] to-[#FF7B54] rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-[#FF7B54] mb-2">
            You've Used Your Free Enhancement!
          </CardTitle>
          <p className="text-gray-600">
            Ready to unlock unlimited AI-powered image enhancements? Join thousands of creators who trust our platform.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Unlimited image enhancements</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Priority processing (faster generation)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Advanced enhancement options</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">High-resolution downloads</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Commercial usage rights</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onSignUp}
              className="w-full bg-[#FF7B54] hover:bg-[#e66942] text-white py-3 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={onViewPricing}
              variant="outline"
              className="w-full border-[#FF7B54] text-[#FF7B54] hover:bg-[#FF7B54] hover:text-white py-3"
            >
              View Pricing Plans
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              ✨ Most popular: <span className="font-semibold text-[#FF7B54]">Pro Plan</span> - $29/month
            </p>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 mt-2 underline"
            >
              Maybe later
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}