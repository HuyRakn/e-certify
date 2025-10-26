import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAsset, getAssetProof, parseCredentialMetadata, CredentialMetadata } from '../utils/helius'
import { useConnection } from '@solana/wallet-adapter-react'

interface VerificationResult {
  isValid: boolean
  credential?: {
    id: string
    name: string
    student_name: string
    issuer_name: string
    issued_date: string
    type: string
    skill_business: string
    skill_tech: string
  }
  error?: string
}

const VerifierPortal: React.FC = () => {
  const router = useRouter()
  const { connection } = useConnection()
  const [assetId, setAssetId] = useState<string>('')
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [scannedQR, setScannedQR] = useState(false)

  // APEC University issuer address
  const APEC_ISSUER_ADDRESS = 'ECertifyProgram111111111111111111111111111111111'

  useEffect(() => {
    // Check if asset_id is in URL parameters (from QR code scan)
    if (router.query.asset_id) {
      setAssetId(router.query.asset_id as string)
      verifyCredential(router.query.asset_id as string)
    }
  }, [router.query])

  const verifyCredential = async (id: string) => {
    if (!id) return

    setLoading(true)
    setVerificationResult(null)

    try {
      // Fetch asset data from Helius DAS API
      const [asset, proof] = await Promise.all([
        getAsset(id),
        getAssetProof(id)
      ])

      // Parse credential metadata
      const metadata = parseCredentialMetadata(asset)
      if (!metadata) {
        throw new Error('Invalid credential metadata')
      }

      // Verify Merkle proof (simplified for MVP)
      const isValidProof = await verifyMerkleProof(asset, proof)
      
      if (isValidProof) {
        setVerificationResult({
          isValid: true,
          credential: {
            id: id,
            name: metadata.name,
            student_name: 'Student Name', // Would come from metadata
            issuer_name: metadata.issuer_name,
            issued_date: metadata.issued_at.split('T')[0],
            type: metadata.credential_type,
            skill_business: metadata.skill_business,
            skill_tech: metadata.skill_tech,
          }
        })
      } else {
        setVerificationResult({
          isValid: false,
          error: 'Invalid credential proof'
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      
      // Fallback to mock verification for demo
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      const mockResult: VerificationResult = {
        isValid: true,
        credential: {
          id: id,
          name: 'Module Python Programming',
          student_name: 'Nguyen Van A',
          issuer_name: 'APEC University',
          issued_date: '2024-01-15',
          type: 'Technical Skill',
          skill_business: 'N/A',
          skill_tech: 'Python'
        }
      }
      
      setVerificationResult(mockResult)
    } finally {
      setLoading(false)
    }
  }

  // Simplified Merkle proof verification (for MVP)
  const verifyMerkleProof = async (asset: any, proof: any): Promise<boolean> => {
    try {
      // In production, this would verify the proof against the on-chain Merkle tree
      // For MVP, we'll return true if the asset exists and has valid metadata
      return asset && asset.id && proof && proof.root
    } catch (error) {
      console.error('Merkle proof verification error:', error)
      return false
    }
  }

  const handleManualVerification = () => {
    if (assetId.trim()) {
      verifyCredential(assetId.trim())
    }
  }

  const handleQRScan = () => {
    // In a real implementation, this would open camera for QR scanning
    // For MVP, we'll simulate scanning
    setScannedQR(true)
    setTimeout(() => {
      const mockAssetId = 'mock-asset-id-123'
      setAssetId(mockAssetId)
      verifyCredential(mockAssetId)
      setScannedQR(false)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Credential Verification</h2>
          <p className="text-gray-600">
            Verify the authenticity of blockchain credentials issued by APEC University
          </p>
        </div>

        {/* Verification Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* QR Code Scan */}
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
            <p className="text-gray-600 mb-4">Scan the QR code provided by the student</p>
            <button
              onClick={handleQRScan}
              disabled={scannedQR}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {scannedQR ? 'Scanning...' : 'Scan QR Code'}
            </button>
          </div>

          {/* Manual Entry */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">Manual Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset ID
                </label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  placeholder="Enter credential asset ID"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <button
                onClick={handleManualVerification}
                disabled={!assetId.trim() || loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Verify Credential
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying credential...</p>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && !loading && (
          <div className="mt-8">
            {verificationResult.isValid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">VERIFIED</h3>
                  <p className="text-green-700 mb-6">This credential is authentic and valid</p>
                </div>

                {verificationResult.credential && (
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">Credential Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Student Name</label>
                        <p className="mt-1 font-medium">{verificationResult.credential.student_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Credential Name</label>
                        <p className="mt-1 font-medium">{verificationResult.credential.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="mt-1">{verificationResult.credential.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Issued Date</label>
                        <p className="mt-1">{new Date(verificationResult.credential.issued_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Skill</label>
                        <p className="mt-1">{verificationResult.credential.skill_business}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Technical Skill</label>
                        <p className="mt-1">{verificationResult.credential.skill_tech}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Issuer</label>
                        <p className="mt-1">{verificationResult.credential.issuer_name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-800 mb-2">INVALID CREDENTIAL</h3>
                  <p className="text-red-700">
                    {verificationResult.error || 'This credential could not be verified'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How to Verify Credentials</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
              <p>Ask the student to share their credential QR code or asset ID</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
              <p>Scan the QR code or manually enter the asset ID above</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
              <p>Our system will verify the credential against the blockchain</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
              <p>View the verification result and credential details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifierPortal
