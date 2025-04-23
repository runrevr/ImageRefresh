import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface CtaSectionProps {
  onClick: () => void;
}

export default function CtaSection({ onClick }: CtaSectionProps) {
  return (
    <section className="mb-16">
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your images?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Start with your free transformation today and see the magic of AI image editing.
        </p>
        <Button 
          onClick={onClick}
          size="lg" 
          className="bg-white text-primary-600 hover:bg-gray-100"
        >
          <Wand2 className="h-5 w-5 mr-2" />
          Try It Free
        </Button>
      </div>
    </section>
  );
}
