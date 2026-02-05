import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { planId, billingCycle, walletAddress } = await req.json();
    
    // Simulate blockchain transaction processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate random transaction success/failure (95% success rate)
    const success = Math.random() > 0.05;
    
    if (!success) {
      return NextResponse.json(
        { error: 'Transaction failed', code: 'TRANSACTION_FAILED' },
        { status: 400 }
      );
    }

    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
    const planMap: any = {
      basic: { queryLimit: 100 },
      premium: { queryLimit: 1000 },
      enterprise: { queryLimit: -1 },
    };

    const response = {
      success: true,
      transactionHash,
      plan: {
        id: planId,
        name: planId,
        displayName: planId.charAt(0).toUpperCase() + planId.slice(1),
      },
      queriesRemaining: planMap[planId]?.queryLimit || 100,
      expiryDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}