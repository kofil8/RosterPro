import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
}: PricingCardProps) {
  return (
    <div
      className={`p-8 rounded-lg border ${
        highlighted ? "border-blue-600 shadow-xl scale-105" : "bg-white"
      }`}
    >
      <h3 className='text-2xl font-bold mb-2'>{name}</h3>
      <p className='text-gray-600 mb-4'>{description}</p>
      <div className='mb-6'>
        <span className='text-4xl font-bold'>{price}</span>
        <span className='text-gray-600'>/month</span>
      </div>
      <ul className='space-y-3 mb-6'>
        {features.map((feature, index) => (
          <li key={index} className='flex items-center gap-2'>
            <svg
              className='w-5 h-5 text-green-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href='/register'>
        <Button
          className='w-full'
          variant={highlighted ? "default" : "outline"}
        >
          Get Started
        </Button>
      </Link>
    </div>
  );
}

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small teams",
      features: [
        "Up to 10 employees",
        "Unlimited rosters",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: "$79",
      description: "For growing businesses",
      features: [
        "Up to 50 employees",
        "Unlimited rosters",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "For large organizations",
      features: [
        "Unlimited employees",
        "Unlimited rosters",
        "Full analytics suite",
        "24/7 support",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <section id='pricing' className='container mx-auto px-4 py-20 bg-gray-50'>
      <h2 className='text-3xl md:text-4xl font-bold text-center mb-4'>
        Simple, Transparent Pricing
      </h2>
      <p className='text-center text-gray-600 mb-12 max-w-2xl mx-auto'>
        Choose the perfect plan for your team. All plans include a 14-day free
        trial.
      </p>
      <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            highlighted={plan.highlighted}
          />
        ))}
      </div>
    </section>
  );
}

