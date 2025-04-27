import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from '@shared/schema';

const faqs: FAQ[] = [
  {
    question: "How does the AI image transformation work?",
    answer: "We use specialized prompting and AI to make magic happen! Our technology analyzes your image, interprets your instructions, and generates a new version that matches your description while maintaining the core elements of the original. Our proprietary approach ensures high-quality transformations that preserve the identity of your subject while applying creative changes."
  },
  {
    question: "What types of images work best with your tool?",
    answer: "Our tool works well with most types of images, including portraits, landscapes, product photos, interior designs, and more. Clear, well-lit images typically produce the best results. The AI may struggle with extremely blurry images, heavily distorted images, or images with multiple complex elements that might confuse the transformation process."
  },
  {
    question: "How long does it take to process an image?",
    answer: "Most transformations are completed within 15-30 seconds, depending on the complexity of your request and current system load. More complex transformations or highly detailed prompts may take a bit longer. Priority processing is available for Pro users."
  },
  {
    question: "Can I use the transformed images commercially?",
    answer: "Free and Basic plan users receive a personal use license for their transformed images. Pro plan subscribers receive commercial usage rights for their transformations. However, please note that you must have the appropriate rights to the original image you upload for transformation."
  },
  {
    question: "How can I get the best results from my prompts?",
    answer: "For best results, be specific and descriptive in your prompts. Include details about the style (e.g., \"oil painting,\" \"watercolor,\" \"photorealistic\"), mood (e.g., \"dramatic,\" \"cheerful,\" \"mysterious\"), and specific elements you want to change or enhance. You can also reference artists or specific styles (e.g., \"in the style of Van Gogh\" or \"cyberpunk aesthetic\")."
  }
];

export default function FaqSection() {
  return (
    <section id="faq" className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-xl text-gray-600">Got questions? We've got answers</p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left px-6 py-4 font-medium text-base hover:no-underline hover:text-primary-500">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
