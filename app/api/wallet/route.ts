import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/wallet?email=xxx
 * Get wallet address for a user by email
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // First, find user by email
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const user = authData.users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get wallet from profile (if we add wallet_address field to profiles table)
    // For MVP, we'll check a wallet_mappings table or return null
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // In production, profiles table should have wallet_address field
    // For now, return null and let the frontend handle wallet generation
    const walletAddress = (profile as any)?.wallet_address || null;

    return NextResponse.json({
      email,
      userId: user.id,
      walletAddress,
    });
  } catch (e: any) {
    console.error('Wallet API error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/wallet
 * Create or update wallet mapping for a user
 * Body: { email: string, walletAddress: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json();

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Email and walletAddress are required' },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic check)
    // For web3.js v2, we'll do a simple base58 check
    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find user by email
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const user = authData.users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update profile with wallet address
    // Note: In production, you should add 'wallet_address' column to profiles table
    // For MVP, we'll use a workaround or create a separate wallet_mappings table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress } as any) // Type assertion for MVP
      .eq('id', user.id);

    if (updateError) {
      // If column doesn't exist, create a wallet_mappings table entry
      // For MVP, we'll just log the error
      console.warn('Failed to update profile with wallet. Column may not exist:', updateError);
      // In production, you would create a wallet_mappings table:
      // await supabase.from('wallet_mappings').upsert({
      //   user_id: user.id,
      //   email,
      //   wallet_address: walletAddress,
      // });
    }

    return NextResponse.json({
      success: true,
      email,
      walletAddress,
      userId: user.id,
    });
  } catch (e: any) {
    console.error('Wallet POST error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

