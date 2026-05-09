'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FaqItem {
  title: string;
  text: string;
}

export type FaqItems = Array<FaqItem>;

export function Faq() {
  const items: FaqItems = [
    {
      title: 'How is pricing determined for each plan ?',
      text: "Our platform offers flexible pricing options that empower you to choose the perfect fit for your project's needs and budget. Understanding the factors influencing each plan's pricing helps you make an informed decision.",
    },
    {
      title: 'What payment methods are accepted for subscriptions ?',
      text: "We accept various payment methods including credit cards, debit cards, and bank transfers. All transactions are processed securely.",
    },
    {
      title: 'Are there any hidden fees in the pricing ?',
      text: "No, we believe in transparent pricing. All fees are clearly displayed upfront with no hidden charges.",
    },
    {
      title: 'Is there a discount for annual subscriptions ?',
      text: "Yes, we offer discounted rates for annual subscriptions. Contact our sales team for more details.",
    },
    {
      title: 'Do you offer refunds on subscription cancellations ?',
      text: "Refund policies vary by plan. Please review our terms of service or contact support for specific refund information.",
    },
    {
      title: 'Can I add extra features to my current plan ?',
      text: "Yes, you can upgrade your plan or add additional features at any time. Contact our support team for assistance.",
    },
  ];

  const generateItems = () => {
    return (
      <Accordion type="single" collapsible>
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.text}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ</CardTitle>
      </CardHeader>
      <CardContent className="py-3">{generateItems()}</CardContent>
    </Card>
  );
}
