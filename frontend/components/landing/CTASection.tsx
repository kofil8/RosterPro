import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className='py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden'>
      <div className='absolute inset-0 bg-grid-pattern opacity-10'></div>
      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>
            Ready to Streamline Your Roster & Payroll Management?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Get started with the Roster & Payroll Management System designed for UK care agencies.
            Automate scheduling, track attendance, and process payroll with confidence.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/register'>
              <Button
                size='lg'
                variant='secondary'
                className='text-lg px-10 py-7 bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-2xl'
              >
                Get Started
                <ArrowRight className='w-5 h-5 ml-2' />
              </Button>
            </Link>
            <Link href='/login'>
              <Button
                size='lg'
                variant='outline'
                className='text-lg px-10 py-7 border-2 border-white text-white hover:bg-white/10 font-semibold'
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

