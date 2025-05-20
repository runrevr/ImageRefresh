import { CreativePricing } from "@/components/ui/creative-pricing"
import type { PricingTier } from "@/components/ui/creative-pricing"
import { Check, Pencil, Star, Sparkles, Image } from "lucide-react";

const sampleTiers: PricingTier[] = [
    {
        name: "Free",
        icon: <Image className="w-6 h-6" />,
        price: 0,
        description: "Try out our amazing transformations",
        color: "green",
        features: [
            "1 free credit monthly",
            "Each credit = 1 image + 1 edit",
            "Standard resolution output",
            "Limited image history",
        ],
    },
    {
        name: "Core",
        icon: <Pencil className="w-6 h-6" />,
        price: 10,
        description: "Perfect for casual creators",
        color: "blue",
        features: [
            "20 credits per month",
            "Credits reset monthly",
            "HD resolution output",
            "All images stored in your account",
        ],
    },
    {
        name: "Premium",
        icon: <Sparkles className="w-6 h-6" />,
        price: 20,
        description: "For professional needs",
        color: "amber",
        features: [
            "50 credits per month",
            "Credits reset monthly",
            "4K resolution output",
            "Commercial usage rights",
        ],
        popular: true,
    },
];

function CreativePricingDemo() {
    return (
        <CreativePricing 
            tag="Membership Options"
            title="Transform Your Photos With AI"
            description="Choose the perfect plan for your creative needs"
            tiers={sampleTiers} 
        />
    )
}

export { CreativePricingDemo }