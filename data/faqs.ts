import { FAQItem } from "@/lib/tools/types";

export const FAQS_BY_TOOL_ID: Record<string, FAQItem[]> = {
  "percentage-calculator": [
    {
      question: "What is a percentage?",
      answer: "A percentage is a number or ratio expressed as a fraction of 100. It is denoted using the percent sign (%). For example, 45% means 45 out of 100.",
      formula: "P = (Part / Total) × 100",
      example: "25 out of 200 is (25 / 200) × 100 = 12.5%",
    },
    {
      question: "How do you calculate X% of a number Y?",
      answer: "To calculate X% of Y, multiply the total number Y by the percentage rate X and divide the result by 100.",
      formula: "Result = Y × (X / 100)",
      example: "15% of 250 = 250 × (15 / 100) = 37.5",
    },
    {
      question: "How do you calculate percentage increase?",
      answer: "To calculate percentage increase, subtract the original value from the new value, divide by the original value, and multiply by 100.",
      formula: "Increase % = ((New Value - Original Value) / Original Value) × 100",
      example: "If a price goes from $100 to $125: ((125 - 100) / 100) × 100 = 25% increase",
    },
    {
      question: "How do you calculate percentage decrease?",
      answer: "To calculate percentage decrease, subtract the new value from the original value, divide by the original value, and multiply by 100.",
      formula: "Decrease % = ((Original Value - New Value) / Original Value) × 100",
      example: "If a price drops from $200 to $150: ((200 - 150) / 200) × 100 = 25% decrease",
    },
    {
      question: "How do you calculate percentage difference?",
      answer: "Percentage difference compares two values without assuming one is original. Calculate the absolute difference divided by the average of the two numbers, multiplied by 100.",
      formula: "Difference % = (|A - B| / ((A + B) / 2)) × 100",
      example: "Difference between 10 and 20: |10 - 20| / ((10 + 20) / 2) × 100 = 10 / 15 × 100 = 66.67%",
    },
    {
      question: "How do you calculate a discount amount and final price?",
      answer: "Multiply the original price by the discount percentage to get the discount amount. Subtract the discount amount from the original price to find the final price.",
      formula: "Discount Amount = Price × (Discount % / 100) | Final Price = Price - Discount Amount",
      example: "Item at $80 with 20% discount: Discount = $80 × 0.20 = $16, Final Price = $80 - $16 = $64",
    },
  ],
};
