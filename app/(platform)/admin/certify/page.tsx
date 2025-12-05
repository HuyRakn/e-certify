"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Wallet, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { WalletIndicator } from "@/app/components/wallet-indicator";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { verifyProgramPDA } from "@/lib/utils/soulbound-verification";

type CsvRow = {
  student_email: string;
  student_name: string;
  major: string;
  issue_date: string;
  wallet?: string;
};

type MintResult = {
  student: string;
  tx?: string;
  error?: string;
};

type StudentStatus = {
  student: string;
  status: 'pending' | 'generating' | 'uploading-image' | 'uploading-metadata' | 'minting' | 'done' | 'error';
  error?: string;
  tx?: string;
};

export default function CertifyPage() {
  // Wallet integration
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [collectionMint, setCollectionMint] = useState(process.env.NEXT_PUBLIC_APEC_COLLECTION || "");
  const [merkleTree, setMerkleTree] = useState(process.env.MERKLE_TREE || "");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MintResult[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [soulboundConfirmed, setSoulboundConfirmed] = useState(false);

  // Verify Program PDA on mount
  useEffect(() => {
    const pdaInfo = verifyProgramPDA();
    console.log('Program Authority PDA:', pdaInfo.pda);
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!connected || !publicKey) {
        setWalletBalance(null);
        return;
      }

      setBalanceLoading(true);
      try {
        const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_API_KEY_URL || 
                      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
                      'https://api.devnet.solana.com';
        const connection = new Connection(rpcUrl, 'confirmed');
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setWalletBalance(null);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [connected, publicKey]);

  const parseCSV = (file: File): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          // Validate required headers
          const requiredHeaders = ['student_email', 'student_name', 'major', 'issue_date'];
          const headers = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          // Transform and validate data
          const rows = results.data
            .map((row: any) => ({
              student_email: row.student_email || '',
              student_name: row.student_name || '',
              major: row.major || '',
              issue_date: row.issue_date || new Date().toISOString().split('T')[0],
              wallet: row.wallet || '',
            } as CsvRow))
            .filter((row: CsvRow) => row.student_email && row.student_name);

          resolve(rows);
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setStatus("");

    try {
      const parsed = await parseCSV(file);
      setCsvData(parsed);
      setStatus(`Parsed ${parsed.length} student records. Ready to mint.`);
      
      // Initialize student statuses
      setStudentStatuses(
        parsed.map((row) => ({
          student: row.student_email || row.student_name,
          status: 'pending' as const,
        }))
      );
    } catch (error: any) {
      setStatus(`Error parsing CSV: ${error.message}`);
      setCsvData([]);
      setStudentStatuses([]);
    }
  };

  const updateStudentStatus = (student: string, status: StudentStatus['status'], error?: string, tx?: string) => {
    setStudentStatuses((prev) =>
      prev.map((s) =>
        s.student === student ? { ...s, status, error, tx } : s
      )
    );
  };

  const runBatchMint = async () => {
    // Check wallet connection
    if (!connected || !publicKey) {
      setStatus("Please connect your wallet first.");
      return;
    }

    // Check wallet balance
    if (walletBalance !== null && walletBalance < 0.1) {
      setStatus(`Insufficient balance: ${walletBalance.toFixed(4)} SOL. Please ensure you have at least 0.1 SOL for transaction fees.`);
      return;
    }

    if (!collectionMint || !merkleTree) {
      setStatus("Please provide Collection Mint and Merkle Tree addresses.");
      return;
    }

    if (csvData.length === 0) {
      setStatus("Please upload a CSV file with student data.");
      return;
    }

    if (!soulboundConfirmed) {
      setStatus("Please confirm that you understand credentials will be Soulbound.");
      return;
    }

    setLoading(true);
    setStatus("Processing credentials...");
    setResults([]);
    setProgress({ current: 0, total: csvData.length });

    // Initialize all students as pending
    setStudentStatuses(
      csvData.map((row) => ({
        student: row.student_email || row.student_name,
        status: 'pending' as const,
      }))
    );

    try {
      // Process in batches using Promise.all for parallel processing
      const BATCH_SIZE = 5; // Process 5 students at a time
      const batches: CsvRow[][] = [];
      
      for (let i = 0; i < csvData.length; i += BATCH_SIZE) {
        batches.push(csvData.slice(i, i + BATCH_SIZE));
      }

      const allResults: MintResult[] = [];

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Process batch in parallel
        const batchPromises = batch.map(async (row) => {
          const studentId = row.student_email || row.student_name;
          
          try {
            // Update status: generating
            updateStudentStatus(studentId, 'generating');
            
            // Call API for this student
            const response = await fetch('/api/mint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                collectionMint,
                merkleTree,
                rows: [row], // Single student per request for now
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Mint request failed');
            }

            const result = data.results?.[0];
            if (result?.tx) {
              updateStudentStatus(studentId, 'done', undefined, result.tx);
              allResults.push(result);
            } else {
              throw new Error(result?.error || 'Unknown error');
            }
          } catch (error: any) {
            updateStudentStatus(studentId, 'error', error.message);
            allResults.push({
              student: studentId,
              error: error.message || 'Unknown error',
            });
          } finally {
            setProgress((prev) => ({
              ...prev,
              current: prev.current + 1,
            }));
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches to avoid overwhelming the network
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setResults(allResults);
      const successful = allResults.filter(r => r.tx).length;
      const failed = allResults.filter(r => r.error).length;
      setStatus(
        `Processing complete! ${successful} successful, ${failed} failed.`
      );
    } catch (e: any) {
      setStatus(`Error: ${e?.message || 'Unknown error'}`);
      console.error('Mint error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Issue Certificates</h1>
        <p className="text-muted-foreground mt-2">
          Batch mint cNFT certificates for students using CSV upload
        </p>
      </div>

      {/* Wallet Connection Card */}
      {!connected && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Wallet className="h-5 w-5" />
              Wallet Connection Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              Please connect your Solana wallet to mint certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-4">
              <WalletIndicator />
              <p className="text-sm text-orange-700 text-center">
                Connect your wallet (Phantom, Solflare, etc.) to proceed with batch minting
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Info Card */}
      {connected && publicKey && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Wallet Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">Wallet Address:</span>
                <span className="text-sm font-mono text-green-700">
                  {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">Balance:</span>
                <span className="text-sm font-semibold text-green-700">
                  {balanceLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : walletBalance !== null ? (
                    `${walletBalance.toFixed(4)} SOL`
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>
              {walletBalance !== null && walletBalance < 0.1 && (
                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>Low balance. You may need more SOL for transaction fees.</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnect()}
                className="w-full mt-2"
              >
                Disconnect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Set up collection and Merkle tree addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Collection Mint Address
              </label>
              <Input
                placeholder="Enter collection mint address"
                value={collectionMint}
                onChange={(e) => setCollectionMint(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Merkle Tree Address
              </label>
              <Input
                placeholder="Enter Merkle tree address"
                value={merkleTree}
                onChange={(e) => setMerkleTree(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Soulbound Confirmation Card */}
        {connected && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
                <ShieldCheck className="h-4 w-4" />
                Soulbound Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-blue-800 space-y-2">
                <p>
                  All credentials will be minted with <strong>Soulbound</strong> protection.
                  Students will <strong>NOT</strong> be able to transfer their credentials.
                </p>
                <p className="font-mono text-[10px] bg-blue-100 p-2 rounded">
                  Program Authority PDA: {verifyProgramPDA().pda.slice(0, 16)}...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="soulbound-confirm"
                  checked={soulboundConfirmed}
                  onChange={(e) => setSoulboundConfirmed(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="soulbound-confirm" className="text-xs text-blue-800 cursor-pointer">
                  I understand credentials will be Soulbound (non-transferable)
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CSV Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Student Data</CardTitle>
            <CardDescription>
              Upload a CSV file with columns: student_email, student_name, major, issue_date, wallet (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {csvFile ? csvFile.name : 'Click to upload CSV'}
                </span>
              </label>
            </div>
            {csvData.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>{csvData.length} students loaded</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      {loading && progress.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
            <CardDescription>
              {progress.current} of {progress.total} students processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {Math.round((progress.current / progress.total) * 100)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      {status && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status.includes('complete') || status.includes('successful') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : status.includes('Error') ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : null}
              <p className="text-sm">{status}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Statuses */}
      {studentStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Processing Status</CardTitle>
            <CardDescription>
              Real-time status for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {studentStatuses.map((studentStatus, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border flex items-center justify-between ${
                    studentStatus.status === 'done'
                      ? 'bg-green-50 border-green-200'
                      : studentStatus.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : studentStatus.status === 'pending'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {studentStatus.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : studentStatus.status === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : studentStatus.status === 'pending' ? (
                      <div className="h-4 w-4 rounded-full bg-gray-300" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    <span className="font-medium text-sm">{studentStatus.student}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {studentStatus.status === 'generating' && 'Generating image...'}
                    {studentStatus.status === 'uploading-image' && 'Uploading image...'}
                    {studentStatus.status === 'uploading-metadata' && 'Uploading metadata...'}
                    {studentStatus.status === 'minting' && 'Minting...'}
                    {studentStatus.status === 'done' && studentStatus.tx && (
                      <span className="text-green-600">Success: {studentStatus.tx.slice(0, 8)}...</span>
                    )}
                    {studentStatus.status === 'error' && (
                      <span className="text-red-600">{studentStatus.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Card */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Minting Results</CardTitle>
            <CardDescription>
              Detailed results for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    result.tx
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.student}</span>
                    {result.tx ? (
                      <span className="text-xs text-green-600">
                        Success: {result.tx.slice(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-xs text-red-600">
                        Error: {result.error || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          onClick={runBatchMint}
          disabled={!connected || !soulboundConfirmed || !collectionMint || !merkleTree || csvData.length === 0 || loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Mint Certificates
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
