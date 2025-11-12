import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className='sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow'>
              <Calendar className='w-6 h-6 text-white' />
            </div>
            <span className='font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Roster & Payroll
            </span>
          </Link>

          <nav className='hidden md:flex items-center gap-8'>
            <Link
              href='#features'
              className='text-gray-600 hover:text-blue-600 transition-colors font-medium'
            >
              Features
            </Link>
            <Link
              href='#about'
              className='text-gray-600 hover:text-blue-600 transition-colors font-medium'
            >
              About
            </Link>
          </nav>

          <div className='flex items-center gap-3'>
            <Link href='/login'>
              <Button variant='ghost' className='font-semibold'>
                Login
              </Button>
            </Link>
            <Link href='/register'>
              <Button className='font-semibold shadow-lg hover:shadow-xl transition-shadow'>
                Get Started
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
