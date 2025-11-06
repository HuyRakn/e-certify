"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";

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

export default function CertifyPage() {
  const [collectionMint, setCollectionMint] = useState(process.env.NEXT_PUBLIC_APEC_COLLECTION || "");
  const [merkleTree, setMerkleTree] = useState(process.env.MERKLE_TREE || "");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MintResult[]>([]);

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['student_email', 'student_name', 'major', 'issue_date'];
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return {
        student_email: row.student_email || '',
        student_name: row.student_name || '',
        major: row.major || '',
        issue_date: row.issue_date || new Date().toISOString().split('T')[0],
        wallet: row.wallet || '',
      } as CsvRow;
    }).filter(row => row.student_email && row.student_name);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setStatus("");

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setStatus(`Parsed ${parsed.length} student records. Ready to mint.`);
    } catch (error: any) {
      setStatus(`Error parsing CSV: ${error.message}`);
      setCsvData([]);
    }
  };

  const runBatchMint = async () => {
    if (!collectionMint || !merkleTree) {
      setStatus("Please provide Collection Mint and Merkle Tree addresses.");
      return;
    }

    if (csvData.length === 0) {
      setStatus("Please upload a CSV file with student data.");
      return;
    }

    setLoading(true);
    setStatus("Minting credentials...");
    setResults([]);

    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionMint,
          merkleTree,
          rows: csvData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Mint request failed');
      }

      setResults(data.results || []);
      const successful = data.successful || 0;
      const failed = data.failed || 0;
      setStatus(
        `Minting complete! ${successful} successful, ${failed} failed.`
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
          disabled={!collectionMint || !merkleTree || csvData.length === 0 || loading}
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
