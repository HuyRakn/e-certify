// Demo/Mock certificate data for pitching and testing
// This simulates real on-chain certificates for demo purposes

export interface DemoCertificate {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
      description?: string;
      attributes: Array<{ trait_type: string; value: string }>;
    };
    json_uri?: string;
  };
  grouping: Array<{ group_key: string; group_value: string }>;
  ownership: {
    owner: string;
  };
}

// Generate realistic Solana wallet addresses for demo
const generateDemoWallet = (index: number) => {
  const base = `5${index.toString().padStart(43, '0')}`;
  return base.slice(0, 44);
};

// Demo certificates - 8 realistic samples
export const DEMO_CERTIFICATES: DemoCertificate[] = [
  {
    id: 'cert-001-solana-engineer',
    content: {
      metadata: {
        name: 'Solana Blockchain Engineer',
        symbol: 'APEC-SOL',
        attributes: [
          { trait_type: 'Major', value: 'Computer Science' },
          { trait_type: 'Issued Date', value: '2025-01-15' },
          { trait_type: 'Credential Type', value: 'Professional Certification' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Grade', value: 'A+' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Technical Skills' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-002-bachelor-entrepreneurship',
    content: {
      metadata: {
        name: 'Bachelor of Entrepreneurship',
        symbol: 'APEC-BE',
        attributes: [
          { trait_type: 'Major', value: 'Entrepreneurship' },
          { trait_type: 'Issued Date', value: '2025-01-20' },
          { trait_type: 'Credential Type', value: 'Degree' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'GPA', value: '3.8/4.0' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Academic Degree' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-003-web3-developer',
    content: {
      metadata: {
        name: 'Web3 Full-Stack Developer',
        symbol: 'APEC-WEB3',
        attributes: [
          { trait_type: 'Major', value: 'Software Engineering' },
          { trait_type: 'Issued Date', value: '2025-01-10' },
          { trait_type: 'Credential Type', value: 'Professional Certification' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Skills', value: 'React, Solana, Anchor, Rust' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Technical Skills' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-004-business-strategy',
    content: {
      metadata: {
        name: 'Strategic Business Management',
        symbol: 'APEC-SBM',
        attributes: [
          { trait_type: 'Major', value: 'Business Administration' },
          { trait_type: 'Issued Date', value: '2025-01-05' },
          { trait_type: 'Credential Type', value: 'Course Completion' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Hours', value: '120 hours' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Business Skills' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-005-smart-contract-audit',
    content: {
      metadata: {
        name: 'Smart Contract Security Audit',
        symbol: 'APEC-SCA',
        attributes: [
          { trait_type: 'Major', value: 'Cybersecurity' },
          { trait_type: 'Issued Date', value: '2025-01-22' },
          { trait_type: 'Credential Type', value: 'Professional Certification' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Certification Body', value: 'APEC Security Lab' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Security' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-006-dapp-development',
    content: {
      metadata: {
        name: 'Decentralized Application Development',
        symbol: 'APEC-DAPP',
        attributes: [
          { trait_type: 'Major', value: 'Computer Science' },
          { trait_type: 'Issued Date', value: '2025-01-18' },
          { trait_type: 'Credential Type', value: 'Course Completion' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Projects', value: '5 dApps built' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Technical Skills' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-007-digital-marketing',
    content: {
      metadata: {
        name: 'Digital Marketing & Growth Strategy',
        symbol: 'APEC-DM',
        attributes: [
          { trait_type: 'Major', value: 'Marketing' },
          { trait_type: 'Issued Date', value: '2025-01-12' },
          { trait_type: 'Credential Type', value: 'Professional Certification' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Certification', value: 'Google Ads Certified' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Marketing' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
  {
    id: 'cert-008-ai-ml-fundamentals',
    content: {
      metadata: {
        name: 'AI & Machine Learning Fundamentals',
        symbol: 'APEC-AI',
        attributes: [
          { trait_type: 'Major', value: 'Data Science' },
          { trait_type: 'Issued Date', value: '2025-01-30' },
          { trait_type: 'Credential Type', value: 'Course Completion' },
          { trait_type: 'Institution', value: 'APEC University' },
          { trait_type: 'Models Trained', value: '10+ ML models' },
        ],
      },
    },
    grouping: [
      { group_key: 'collection', group_value: 'APEC_COLLECTION' },
      { group_key: 'category', group_value: 'Data Science' },
    ],
    ownership: {
      owner: generateDemoWallet(1),
    },
  },
];

// Get demo certificates for a specific wallet address
export function getDemoCertificatesForWallet(walletAddress: string): DemoCertificate[] {
  // Return all demo certificates (they all belong to demo wallet)
  // In production, this would filter by actual wallet ownership
  return DEMO_CERTIFICATES.map(cert => ({
    ...cert,
    ownership: {
      owner: walletAddress, // Map to the actual connected wallet
    },
  }));
}

// Get demo certificate by ID
export function getDemoCertificateById(assetId: string): DemoCertificate | null {
  return DEMO_CERTIFICATES.find(cert => cert.id === assetId) || null;
}

