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
            "3 Free Transformations",
            "Basic Image Styles",
            "Standard Resolution",
            "Watermarked Exports",
        ],
    },
    {
        name: "Creator",
        icon: <Pencil className="w-6 h-6" />,
        price: 19,
        description: "Perfect for casual creators",
        color: "amber",
        features: [
            "25 Transformations/Month",
            "50+ Premium Styles",
            "High-Resolution Exports",
            "No Watermarks",
        ],
    },
    {
        name: "Pro",
        icon: <Sparkles className="w-6 h-6" />,
        price: 49,
        description: "For professional needs",
        color: "purple",
        features: [
            "Unlimited Transformations",
            "100+ Premium Styles",
            "4K Resolution Exports",
            "Priority Processing",
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