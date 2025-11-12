import { Calendar, Github, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className='bg-gray-900 text-gray-300'>
      <div className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12'>
          {/* Brand Column */}
          <div className='lg:col-span-2'>
            <Link href='/' className='flex items-center gap-2 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-white' />
              </div>
              <span className='font-bold text-2xl text-white'>Roster & Payroll</span>
            </Link>
            <p className='text-gray-400 mb-6 max-w-sm'>
              Internal roster and payroll management system for UK-based care agencies.
              Streamline scheduling, track attendance, and process payroll with confidence.
            </p>
            <div className='flex gap-4'>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors'
              >
                <Twitter className='w-5 h-5' />
              </a>
              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors'
              >
                <Linkedin className='w-5 h-5' />
              </a>
              <a
                href='https://github.com'
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors'
              >
                <Github className='w-5 h-5' />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className='text-white font-semibold text-lg mb-4'>Product</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#features'
                  className='hover:text-blue-400 transition-colors'
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className='text-white font-semibold text-lg mb-4'>Company</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#about'
                  className='hover:text-blue-400 transition-colors'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Press Kit
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className='text-white font-semibold text-lg mb-4'>Support</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href='#contact'
                  className='hover:text-blue-400 transition-colors'
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Status
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-blue-400 transition-colors'
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className='border-t border-gray-800 pt-8 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-blue-400 mt-1' />
              <div>
                <p className='text-white font-medium'>Email</p>
                <a
                  href='mailto:support@company.co.uk'
                  className='text-gray-400 hover:text-blue-400 transition-colors'
                >
                  support@company.co.uk
                </a>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Phone className='w-5 h-5 text-blue-400 mt-1' />
              <div>
                <p className='text-white font-medium'>Phone</p>
                <a
                  href='tel:+1234567890'
                  className='text-gray-400 hover:text-blue-400 transition-colors'
                >
                  +1 (234) 567-890
                </a>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <MapPin className='w-5 h-5 text-blue-400 mt-1' />
              <div>
                <p className='text-white font-medium'>Address</p>
                <p className='text-gray-400'>
                  123 Business St, Suite 100
                  <br />
                  San Francisco, CA 94107
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-gray-400 text-sm'>
            &copy; 2024 Roster & Payroll Management System. All rights reserved. Built for UK care agencies.
          </p>
          <div className='flex gap-6 text-sm'>
            <Link
              href='#'
              className='text-gray-400 hover:text-blue-400 transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='#'
              className='text-gray-400 hover:text-blue-400 transition-colors'
            >
              Terms of Service
            </Link>
            <Link
              href='#'
              className='text-gray-400 hover:text-blue-400 transition-colors'
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

