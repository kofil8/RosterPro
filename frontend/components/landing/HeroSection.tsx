import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    icon: ShieldCheck,
    label: "HMRC audit-ready outputs",
    value: "Compliance built-in",
  },
  { icon: Clock, label: "Admin hours saved monthly", value: "50+" },
  { icon: BarChart3, label: "Payroll accuracy on first run", value: "98%" },
];

const highlights = [
  "Automated rostering with conflict prevention for domiciliary care teams.",
  "Accurate payroll calculations across overtime, enhancements, and travel time.",
  "Role-based access for directors, schedulers, accountants, and carers.",
];

export function HeroSection() {
  return (
    <section className='relative overflow-hidden bg-slate-950 text-slate-100'>
      {/* Background Accents */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl'></div>
        <div className='absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl'></div>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(222,89%,70%)/8%,transparent_55%)]'></div>
        <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent'></div>
      </div>

      <div className='container relative z-10 mx-auto px-4 py-24 md:py-32'>
        <div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
          {/* Badge */}
          <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur'>
            <ShieldCheck className='h-4 w-4 text-emerald-300' />
            <span className='text-sm font-medium text-slate-100/80'>
              Purpose-built for UK home care providers
            </span>
          </div>

          {/* Heading */}
          <h1 className='text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl'>
            Payroll certainty for every rostered shift.
          </h1>

          {/* Description */}
          <p className='mt-6 max-w-3xl text-lg text-slate-200/80 sm:text-xl md:text-2xl'>
            Replace fragile spreadsheets with a secure, end-to-end roster and
            payroll platform designed for UK domiciliary care teams. Track hours,
            approvals, and payments with clarity your managers, accountants, and
            carers can trust.
          </p>

          {/* CTA */}
          <div className='mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6'>
            <Link href='/register' className='w-full sm:w-auto'>
              <Button
                size='lg'
                className='group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 text-base font-semibold text-slate-950 shadow-xl transition-all hover:bg-emerald-300 hover:shadow-emerald-500/40 sm:w-auto'
              >
                Get Started
                <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
              </Button>
            </Link>
            <Link href='/login' className='w-full sm:w-auto'>
              <Button
                size='lg'
                variant='outline'
                className='flex w-full items-center justify-center gap-2 rounded-xl border-white/25 bg-white/5 text-base font-semibold text-slate-100 transition-all hover:border-white/40 hover:bg-white/10 sm:w-auto'
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Highlights */}
          <div className='mt-12 grid w-full gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8'>
            <div className='grid gap-4 text-left md:grid-cols-3 md:gap-6'>
              {highlights.map((item) => (
                <div
                  key={item}
                  className='flex items-start gap-3 rounded-2xl bg-slate-900/40 p-4'
                >
                  <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300' />
                  <p className='text-sm font-medium text-slate-100/80 md:text-base'>
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className='rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-left shadow-lg shadow-emerald-500/5'
                >
                  <div className='mb-4 flex items-center gap-3 text-emerald-300'>
                    <Icon className='h-5 w-5' />
                    <span className='text-xs uppercase tracking-[0.18em] text-emerald-200/80'>
                      {label}
                    </span>
                  </div>
                  <p className='text-3xl font-semibold text-white'>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className='absolute bottom-0 left-0 right-0'>
        <svg
          viewBox='0 0 1440 120'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='w-full'
        >
          <path
            d='M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z'
            fill='white'
          />
        </svg>
      </div>
    </section>
  );
}

