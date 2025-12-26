// app/page.tsx - Landing page with redirect to dashboard if logged in

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContexts';
import Link from 'next/link';
import { Cross, Database, Calendar, Users, Shield, BarChart3, FileCheck } from 'lucide-react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Cross className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Malawi Catholic Church
            <br />
            <span className="text-blue-600">Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A comprehensive platform for managing church operations across all 8 dioceses 
            under the Episcopal Conference of Malawi
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition text-lg"
            >
              Request Access
            </Link>
            <Link
              href="/auth/sign-in"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition border-2 border-blue-600 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Comprehensive Church Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Sacrament Records"
            description="Tamper-proof, searchable records for baptisms, confirmations, marriages, and more with digital certificate generation"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Event Management"
            description="Shared calendar for Masses, retreats, and feasts with RSVP tracking and resource booking"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Member Profiles"
            description="Comprehensive member and family profiles with genealogical connections across generations"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Role-Based Access"
            description="Secure, hierarchical permissions from parish to national ECM level with audit logging"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Reports & Analytics"
            description="Sacrament statistics, attendance tracking, and exportable reports for diocesan oversight"
          />
          <FeatureCard
            icon={<FileCheck className="w-8 h-8" />}
            title="Offline Support"
            description="Work seamlessly even with poor connectivity - perfect for rural parishes"
          />
        </div>
      </section>

      {/* Dioceses Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Serving All Malawi Dioceses
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <DioceseCard name="Archdiocese of Lilongwe" type="Archdiocese" />
            <DioceseCard name="Archdiocese of Blantyre" type="Archdiocese" />
            <DioceseCard name="Diocese of Mangochi" type="Diocese" />
            <DioceseCard name="Diocese of Chikwawa" type="Diocese" />
            <DioceseCard name="Diocese of Dedza" type="Diocese" />
            <DioceseCard name="Diocese of Karonga" type="Diocese" />
            <DioceseCard name="Diocese of Mzuzu" type="Diocese" />
            <DioceseCard name="Diocese of Zomba" type="Diocese" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition">
      <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function DioceseCard({ name, type }: { name: string; type: string }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
      <p className="font-bold text-gray-900">{name}</p>
      <p className="text-sm text-blue-600">{type}</p>
    </div>
  );
}