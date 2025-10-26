import React, { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import QRCode from 'react-qr-code'
import { 
  getAssetsByOwner, 
  filterAssetsByIssuer, 
  parseCredentialMetadata,
  generateQRCodeData,
  HeliusAsset,
  CredentialMetadata
} from '../utils/helius'

interface Credential {
  id: string
  name: string
  type: string
  skill_business: string
  skill_tech: string
  issuer_name: string
  issued_date: string
  uri: string
  image?: string
  student_name?: string
  student_id?: string
}

const StudentWallet: React.FC = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // APEC University issuer address (would be the actual deployed program address)
  const APEC_ISSUER_ADDRESS = 'ECertifyProgram111111111111111111111111111111111'

  useEffect(() => {
    if (publicKey) {
      fetchCredentials()
    }
  }, [publicKey])

  const fetchCredentials = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      // Fetch assets from Helius DAS API
      const response = await getAssetsByOwner(publicKey.toString())
      
      // Filter for APEC University credentials
      const apecCredentials = filterAssetsByIssuer(response.items, APEC_ISSUER_ADDRESS)

      // Parse credential metadata
      const credentialList: Credential[] = apecCredentials
        .map(asset => {
          const metadata = parseCredentialMetadata(asset)
          if (!metadata) return null

          return {
            id: asset.id,
            name: metadata.name,
            type: metadata.credential_type,
            skill_business: metadata.skill_business,
            skill_tech: metadata.skill_tech,
            issuer_name: metadata.issuer_name,
            issued_date: metadata.issued_at.split('T')[0],
            uri: asset.content?.json_uri || '',
            image: '/api/placeholder/300/200',
            student_name: 'Student Name',
            student_id: metadata.student_id,
          }
        })
        .filter((cred): cred is Credential => cred !== null) as Credential[]

      // If no real credentials found, show mock data for demo
      if (credentialList.length === 0) {
        const mockCredentials: Credential[] = [
          {
            id: 'mock-1',
            name: 'Module Python Programming',
            type: 'Technical Skill',
            skill_business: 'N/A',
            skill_tech: 'Python',
            issuer_name: 'APEC University',
            issued_date: '2024-01-15',
            uri: 'https://arweave.net/example1',
            image: '/api/placeholder/300/200',
            student_name: 'Nguyen Van A',
            student_id: '2024001'
          },
          {
            id: 'mock-2',
            name: 'Startup Finance Fundamentals',
            type: 'Business Skill',
            skill_business: 'Startup Finance',
            skill_tech: 'N/A',
            issuer_name: 'APEC University',
            issued_date: '2024-02-20',
            uri: 'https://arweave.net/example2',
            image: '/api/placeholder/300/200',
            student_name: 'Nguyen Van A',
            student_id: '2024001'
          },
          {
            id: 'mock-3',
            name: 'Dual Degree Certificate',
            type: 'Dual Degree Module',
            skill_business: 'Entrepreneurship',
            skill_tech: 'Full Stack Development',
            issuer_name: 'APEC University',
            issued_date: '2024-03-10',
            uri: 'https://arweave.net/example3',
            image: '/api/placeholder/300/200',
            student_name: 'Nguyen Van A',
            student_id: '2024001'
          }
        ]
        setCredentials(mockCredentials)
      } else {
        setCredentials(credentialList)
      }
    } catch (error) {
      console.error('Error fetching credentials:', error)
      // Fallback to mock data on error
      const mockCredentials: Credential[] = [
        {
          id: 'mock-1',
          name: 'Module Python Programming',
          type: 'Technical Skill',
          skill_business: 'N/A',
          skill_tech: 'Python',
          issuer_name: 'APEC University',
          issued_date: '2024-01-15',
          uri: 'https://arweave.net/example1',
          image: '/api/placeholder/300/200',
          student_name: 'Nguyen Van A',
          student_id: '2024001'
        }
      ]
      setCredentials(mockCredentials)
    } finally {
      setLoading(false)
    }
  }

  const generateShareLink = (credential: Credential) => {
    return `https://verify.ecertify.app?asset_id=${credential.id}`
  }

  const getCredentialTypeColor = (type: string) => {
    switch (type) {
      case 'Technical Skill':
        return 'bg-blue-100 text-blue-800'
      case 'Business Skill':
        return 'bg-green-100 text-green-800'
      case 'Dual Degree Module':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Student Wallet</h2>
        <p className="text-gray-600 mb-6">Connect your wallet to view your credentials</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Credentials</h2>
          <WalletMultiButton />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your credentials...</p>
          </div>
        ) : (
          <>
            {/* Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {credentials.map((credential) => (
                <div
                  key={credential.id}
                  onClick={() => setSelectedCredential(credential)}
                  className="border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={credential.image}
                      alt={credential.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{credential.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCredentialTypeColor(credential.type)}`}>
                      {credential.type}
                    </span>
                    <p className="text-sm text-gray-600">
                      Issued by {credential.issuer_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(credential.issued_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Credential Detail Modal */}
            {selectedCredential && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-bold">{selectedCredential.name}</h3>
                      <button
                        onClick={() => setSelectedCredential(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Credential Image */}
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={selectedCredential.image}
                          alt={selectedCredential.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>

                      {/* Credential Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Type</label>
                          <p className="mt-1">{selectedCredential.type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Issued Date</label>
                          <p className="mt-1">{new Date(selectedCredential.issued_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Business Skill</label>
                          <p className="mt-1">{selectedCredential.skill_business}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Technical Skill</label>
                          <p className="mt-1">{selectedCredential.skill_tech}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Student Name</label>
                          <p className="mt-1">{selectedCredential.student_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Student ID</label>
                          <p className="mt-1">{selectedCredential.student_id || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Issuer</label>
                          <p className="mt-1">{selectedCredential.issuer_name}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-6 border-t">
                        <button
                          onClick={() => setShowQR(true)}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
                        >
                          Generate QR Code
                        </button>
                        <button
                          onClick={() => {
                            const link = generateShareLink(selectedCredential)
                            navigator.clipboard.writeText(link)
                            alert('Share link copied to clipboard!')
                          }}
                          className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700"
                        >
                          Copy Share Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Modal */}
            {showQR && selectedCredential && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                  <h3 className="text-xl font-bold mb-4">Share Credential</h3>
                  <div className="mb-4">
                    <QRCode
                      value={generateShareLink(selectedCredential)}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code to verify the credential
                  </p>
                  <button
                    onClick={() => setShowQR(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StudentWallet