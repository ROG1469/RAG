import Link from 'next/link'
import { Briefcase, Users, UserCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
            RAG system
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Intelligent document retrieval and generation for every
          </p>
          <p className="text-2xl text-gray-300 mb-12">
            stakeholder.
          </p>
          <div className="inline-block">
            <p className="text-blue-400 font-semibold text-lg uppercase tracking-wider">
              SELECT YOUR USE CASE
            </p>
          </div>
        </div>

        {/* Use Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Business Owners Card */}
          <Link href="/auth/signup?role=business_owner">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all cursor-pointer group h-full">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-500/20 p-4 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                  <Briefcase className="h-12 w-12 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Business Owners
              </h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Gain strategic insights from your entire document repository. Make data-driven decisions faster with instant access to critical business intelligence.
              </p>
            </div>
          </Link>

          {/* Employees Card */}
          <Link href="/auth/signup?role=employee">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all cursor-pointer group h-full">
              <div className="flex justify-center mb-6">
                <div className="bg-purple-500/20 p-4 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                  <Users className="h-12 w-12 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Employees
              </h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Boost productivity by finding internal procedures, technical docs, and resources instantly. Stop searching, start doing.
              </p>
            </div>
          </Link>

          {/* Customers Card */}
          <Link href="/customer-chat">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all cursor-pointer group h-full">
              <div className="flex justify-center mb-6">
                <div className="bg-green-500/20 p-4 rounded-xl group-hover:bg-green-500/30 transition-colors">
                  <UserCheck className="h-12 w-12 text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Customers
              </h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Get instant answers to your support questions 24/7. Access product manuals and FAQs through our intelligent self-service portal.
              </p>
            </div>
          </Link>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">Already have an account?</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-8 py-3 border border-blue-500 text-base font-medium rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
