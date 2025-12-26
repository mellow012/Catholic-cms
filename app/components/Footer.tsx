// components/Footer.tsx - Page footer component

'use client';

import Link from 'next/link';
import { Cross, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">MCCMS</h3>
                <p className="text-xs text-gray-400">Malawi Catholic</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Church Management System for the Episcopal Conference of Malawi
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/sacraments" className="text-gray-400 hover:text-white transition-colors">
                  Sacraments
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-gray-400 hover:text-white transition-colors">
                  Members
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact ECM</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>P.O. Box 30384, Lilongwe 3, Malawi</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+265 1 758 033</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@ecmmw.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>© {currentYear} Episcopal Conference of Malawi. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Compact footer for dashboard pages
export function CompactFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-600">
        <p>© {currentYear} Episcopal Conference of Malawi</p>
        <div className="flex gap-4">
          <Link href="/help" className="hover:text-blue-600 transition-colors">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}