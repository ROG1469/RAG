import Link from 'next/link'
import { FileText, Upload, MessageSquare, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            RAG System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload documents and ask questions powered by AI
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
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
            <p className="text-gray-600 text-sm">
              Support for PDF, DOCX, XLSX, and TXT files up to 10MB
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Processing</h3>
            <p className="text-gray-600 text-sm">
              Automatically extracts and chunks text for optimal retrieval
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ask Questions</h3>
            <p className="text-gray-600 text-sm">
              Get accurate answers from your documents using AI
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">
              Your documents are private and only accessible to you
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Upload Your Documents</h3>
              <p className="text-gray-600 text-sm">
                Upload PDF, Word, Excel, or text files to your personal library
              </p>
            </div>

            <div>
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center text-green-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600 text-sm">
                Documents are processed and indexed using Google Gemini AI
              </p>
            </div>

            <div>
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Get Answers</h3>
              <p className="text-gray-600 text-sm">
                Ask questions and receive accurate answers with source citations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

