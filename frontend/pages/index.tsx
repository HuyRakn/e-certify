import type { NextPage } from 'next'
import Head from 'next/head'
import { WalletProvider } from '../components/WalletProvider'
import AdminDashboard from '../components/AdminDashboard'
import StudentWallet from '../components/StudentWallet'
import VerifierPortal from '../components/VerifierPortal'
import { useState } from 'react'

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'student' | 'verifier'>('admin')

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Head>
          <title>E-Certify - Blockchain Credential Verification</title>
          <meta name="description" content="Decentralized credential verification platform for APEC University" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              E-Certify
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Blockchain-based credential verification for APEC University
            </p>
            
            {/* Navigation Tabs */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => setActiveTab('student')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Student Wallet
              </button>
              <button
                onClick={() => setActiveTab('verifier')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'verifier'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Verify Credentials
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {activeTab === 'admin' && <AdminDashboard />}
            {activeTab === 'student' && <StudentWallet />}
            {activeTab === 'verifier' && <VerifierPortal />}
          </div>
        </main>
      </div>
    </WalletProvider>
  )
}

export default Home


