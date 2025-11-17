import Link from 'next/link'
import { FileText, Upload, MessageSquare, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-100 mb-4">
            Welcome to your Personal Business ChatGPT
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Upload documents, ask questions, get answered
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 text-center">
            <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Upload Documents</h3>
            <p className="text-gray-400 text-sm">
              Support for PDF, DOCX, XLSX, and TXT files up to 10MB
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 text-center">
            <FileText className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Smart Processing</h3>
            <p className="text-gray-400 text-sm">
              Automatically extracts and chunks text for optimal retrieval
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 text-center">
            <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Ask Questions</h3>
            <p className="text-gray-400 text-sm">
              Get accurate answers from your documents using AI
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 text-center">
            <Shield className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Secure & Private</h3>
            <p className="text-gray-400 text-sm">
              Your documents are private and only accessible to you
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-200 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="bg-blue-900/50 rounded-full w-12 h-12 flex items-center justify-center text-blue-400 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-200 mb-2">Upload Your Documents</h3>
              <p className="text-gray-400 text-sm">
                Upload PDF, Word, Excel, or text files to your personal library
              </p>
            </div>

            <div>
              <div className="bg-green-900/50 rounded-full w-12 h-12 flex items-center justify-center text-green-400 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-200 mb-2">AI Processing</h3>
              <p className="text-gray-400 text-sm">
                Documents are processed and indexed using Google Gemini AI
              </p>
            </div>

            <div>
              <div className="bg-purple-900/50 rounded-full w-12 h-12 flex items-center justify-center text-purple-400 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-200 mb-2">Get Answers</h3>
              <p className="text-gray-400 text-sm">
                Ask questions and receive accurate answers with source citations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
