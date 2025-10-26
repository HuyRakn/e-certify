import React, { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  ECERTIFY_PROGRAM_ID, 
  getIssuerPda, 
  getMerkleTreePda,
  createInitializeIssuerInstruction,
  createCreateMerkleTreeInstruction,
  createIssueCredentialInstruction,
  getIssuerData,
  getMerkleTreeData,
  InitializeIssuerData,
  CreateMerkleTreeData,
  IssueCredentialData
} from '../utils/ecertify'

interface IssuerData {
  authority: string
  name: string
  logo_uri: string
  website: string
}

interface CredentialBatch {
  id: string
  name: string
  maxDepth: number
  maxBufferSize: number
  createdAt: Date
}

const AdminDashboard: React.FC = () => {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [issuerData, setIssuerData] = useState<IssuerData | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [credentialBatches, setCredentialBatches] = useState<CredentialBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'register' | 'batches' | 'issue'>('register')

  // Program ID from utils
  const PROGRAM_ID = ECERTIFY_PROGRAM_ID

  useEffect(() => {
    if (publicKey) {
      checkIssuerRegistration()
    }
  }, [publicKey])

  const checkIssuerRegistration = async () => {
    if (!publicKey) return

    try {
      // Generate PDA for issuer
      const [issuerPda] = getIssuerPda(publicKey)

      // Check if issuer account exists and get data
      const issuerData = await getIssuerData(connection, issuerPda)
      if (issuerData) {
        setIsRegistered(true)
        setIssuerData({
          authority: issuerData.authority.toString(),
          name: issuerData.name,
          logo_uri: issuerData.logo_uri,
          website: issuerData.website
        })
      }
    } catch (error) {
      console.error('Error checking issuer registration:', error)
    }
  }

  const registerIssuer = async () => {
    if (!publicKey || !signTransaction) return

    setLoading(true)
    try {
      // Generate PDA for issuer
      const [issuerPda] = getIssuerPda(publicKey)

      // Create instruction data
      const issuerData: InitializeIssuerData = {
        name: 'APEC University',
        logo_uri: 'https://apecgroup.net/logo.png',
        website: 'https://apecgroup.net'
      }

      // Create transaction using our utility function
      const transaction = createInitializeIssuerInstruction(
        publicKey,
        issuerPda,
        issuerData
      )

      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature)

      setIsRegistered(true)
      setIssuerData({
        authority: publicKey.toString(),
        name: issuerData.name,
        logo_uri: issuerData.logo_uri,
        website: issuerData.website
      })
      
      alert('Issuer registered successfully!')
    } catch (error) {
      console.error('Error registering issuer:', error)
      alert('Error registering issuer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createCredentialBatch = async () => {
    if (!publicKey || !signTransaction) return

    setLoading(true)
    try {
      // Generate PDAs
      const [issuerPda] = getIssuerPda(publicKey)
      const [merkleTreePda] = getMerkleTreePda(publicKey, credentialBatches.length)

      // Create Merkle Tree data
      const merkleTreeData: CreateMerkleTreeData = {
        max_depth: 20,
        max_buffer_size: 64,
        tree_name: 'K2025 Dual-Degree'
      }

      // Create transaction
      const transaction = createCreateMerkleTreeInstruction(
        publicKey,
        issuerPda,
        merkleTreePda,
        merkleTreeData
      )

      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature)

      // Add to local state
      const newBatch: CredentialBatch = {
        id: Math.random().toString(36).substr(2, 9),
        name: merkleTreeData.tree_name,
        maxDepth: merkleTreeData.max_depth,
        maxBufferSize: merkleTreeData.max_buffer_size,
        createdAt: new Date()
      }
      setCredentialBatches([...credentialBatches, newBatch])
      
      alert('Credential batch created successfully!')
    } catch (error) {
      console.error('Error creating credential batch:', error)
      alert('Error creating credential batch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const issueCredentials = async (csvFile: File) => {
    // This would process CSV and mint cNFTs via Bubblegum
    console.log('Processing CSV file:', csvFile.name)
    // Implementation would go here
  }

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <p className="text-gray-600 mb-6">Connect your wallet to access admin features</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <WalletMultiButton />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-2 px-1 border-b-2 font-medium ${
              activeTab === 'register'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Register Issuer
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`pb-2 px-1 border-b-2 font-medium ${
              activeTab === 'batches'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Credential Batches
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`pb-2 px-1 border-b-2 font-medium ${
              activeTab === 'issue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Issue Credentials
          </button>
        </div>

        {/* Register Issuer Tab */}
        {activeTab === 'register' && (
          <div>
            {!isRegistered ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Register APEC University as Issuer</h3>
                <p className="text-gray-600 mb-6">
                  Register your institution to start issuing blockchain credentials
                </p>
                <button
                  onClick={registerIssuer}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Issuer'}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Issuer Registered Successfully</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {issuerData?.name}</p>
                  <p><span className="font-medium">Authority:</span> {issuerData?.authority}</p>
                  <p><span className="font-medium">Website:</span> {issuerData?.website}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credential Batches Tab */}
        {activeTab === 'batches' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Credential Batches</h3>
              <button
                onClick={createCredentialBatch}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Create New Batch
              </button>
            </div>
            
            <div className="grid gap-4">
              {credentialBatches.map((batch) => (
                <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{batch.name}</h4>
                      <p className="text-sm text-gray-600">
                        Max Depth: {batch.maxDepth} | Buffer Size: {batch.maxBufferSize}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {batch.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issue Credentials Tab */}
        {activeTab === 'issue' && (
          <div>
            <h3 className="text-xl font-semibold mb-6">Issue Credentials</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Credential Batch
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Select a batch...</option>
                  {credentialBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential Metadata
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Credential Name"
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select className="border border-gray-300 rounded-lg px-3 py-2">
                    <option>Credential Type</option>
                    <option>Dual Degree Module</option>
                    <option>Business Skill</option>
                    <option>Technical Skill</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Student CSV
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) issueCredentials(file)
                    }}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Click to upload CSV file
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    CSV should contain: student_wallet_address, student_name, student_internal_id
                  </p>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                disabled={credentialBatches.length === 0}
              >
                Start Batch Mint
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
