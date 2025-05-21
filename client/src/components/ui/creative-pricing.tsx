import { Button } from "@/components/ui/button";
import { Check, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
    name: string;
    icon: React.ReactNode;
    price: number;
    description: string;
    features: string[];
    popular?: boolean;
    color: string;
}

function CreativePricing({
    tag = "Simple Pricing",
    title = "Make Short Videos That Pop",
    description = "Edit, enhance, and go viral in minutes",
    tiers,
}: {
    tag?: string;
    title?: string;
    description?: string;
    tiers: PricingTier[];
}) {
    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="text-center space-y-6 mb-16">
                <h2 className="text-3xl md:text-4xl text-brand-primary font-bungee">
                    {tag}
                </h2>
                <div className="relative">
                    <h3 className="text-4xl md:text-5xl font-bungee text-[#333333]">
                        {title}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-3 bg-brand-primary/20 
                        rounded-full blur-sm" />
                    </h3>
                </div>
                <p className="text-xl text-[#333333] font-montserrat">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier, index) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "relative group",
                            "transition-all duration-300",
                            index === 0 && "rotate-[-1deg]",
                            index === 1 && "rotate-[1deg]",
                            index === 2 && "rotate-[-2deg]"
                        )}
                    >
                        <div
                            className={cn(
                                "absolute inset-0 bg-white dark:bg-dark",
                                "border border-dark dark:border-light",
                                "rounded-lg shadow-lg",
                                "transition-all duration-300",
                                "group-hover:shadow-xl",
                                "group-hover:translate-y-[-2px]"
                            )}
                        />

                        <div className="relative p-6">
                            {tier.popular && (
                                <div
                                    className="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 
                                    font-handwritten px-3 py-1 rounded-full rotate-12 text-sm border-2 border-zinc-900"
                                >
                                    Popular!
                                </div>
                            )}

                            <div className="mb-6">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full mb-4",
                                        "flex items-center justify-center",
                                        "border-2 border-zinc-900 dark:border-white",
                                        `text-${tier.color}-500`
                                    )}
                                >
                                    {tier.icon}
                                </div>
                                <h3 className="font-bungee text-2xl text-dark dark:text-light">
                                    {tier.name}
                                </h3>
                                <p className="font-montserrat text-body dark:text-light">
                                    {tier.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6 font-montserrat">
                                <span className="text-4xl font-bold text-dark dark:text-light">
                                    ${tier.price}
                                </span>
                                <span className="text-body dark:text-light">
                                    /month
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                {tier.features.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-brand-primary
                                            flex items-center justify-center"
                                        >
                                            <Check className="w-3 h-3 text-brand-primary" />
                                        </div>
                                        <span className="font-montserrat text-lg text-dark dark:text-light">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={cn(
                                    "w-full h-12 font-montserrat text-lg relative",
                                    "border border-dark dark:border-light rounded-md",
                                    "transition-all duration-300",
                                    tier.popular
                                        ? [
                                              "bg-brand-secondary text-white",
                                              "hover:bg-brand-secondary/90",
                                          ]
                                        : [
                                              "bg-brand-primary text-white",
                                              "hover:bg-brand-primary/90",
                                          ]
                                )}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute -z-10 inset-0 overflow-hidden">
                <div className="absolute top-40 left-20 text-4xl rotate-12">
                    ✎
                </div>
                <div className="absolute bottom-40 right-20 text-4xl -rotate-12">
                    ✏️
                </div>
            </div>
        </div>
    );
}


export { CreativePricing, type PricingTier }