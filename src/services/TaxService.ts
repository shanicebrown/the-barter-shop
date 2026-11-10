import { supabase } from '../config/supabase';

export type TaxSummary = {
  totalBarters: number;
  servicesProvidedValue: number;
  servicesReceivedValue: number;
  netBarterValue: number;
  cashReceived: number;
  cashPaid: number;
  barterBucksEarned: number;
};

export type TaxTransaction = {
  date: string;
  partner: string;
  serviceProvided: string;
  providedValue: number;
  serviceReceived: string;
  receivedValue: number;
  type: string;
  cashAmount: number;
  status: string;
};

export function generateStatementId(year: number, userId: string): string {
  return `TBS-TAX-${year}-${userId.slice(0, 8).toUpperCase()}`;
}

export function generateStatementText(params: {
  year: number;
  generatedDate: string;
  statementId: string;
  fullName: string;
  username: string;
  memberSince: string;
  summary: TaxSummary;
  transactions: TaxTransaction[];
}): string {
  const { year, generatedDate, statementId, fullName, username, memberSince, summary, transactions } = params;

  let transactionRows = '';
  transactions.forEach((t, i) => {
    transactionRows += `${i + 1}. ${t.date} | ${t.partner} | Provided: ${t.serviceProvided} ($${t.providedValue}) | Received: ${t.serviceReceived} ($${t.receivedValue}) | ${t.type} | Cash: $${t.cashAmount} | ${t.status}\n`;
  });

  return `THE BARTER SHOP INC.
ANNUAL BARTER ACTIVITY STATEMENT

Tax Year: ${year}
Generated: ${generatedDate}
Statement ID: ${statementId}

────────────────────────────────────────

MEMBER INFORMATION

Member Name: ${fullName}
Username: ${username}
Member Since: ${memberSince}
Statement Period: January 1 — December 31, ${year}

────────────────────────────────────────

IMPORTANT DISCLAIMER

This statement is provided for your records and tax preparation purposes. The Barter Shop Inc. is not a tax advisor. Barter transactions may be taxable as ordinary income at fair market value. Please consult a qualified tax professional regarding your reporting obligations. See IRS Publication 525 for guidance on bartering income.

────────────────────────────────────────

BARTER ACTIVITY SUMMARY

Total barters completed: ${summary.totalBarters}
Services provided value: $${summary.servicesProvidedValue.toLocaleString()}
Services received value: $${summary.servicesReceivedValue.toLocaleString()}
Net barter value: $${summary.netBarterValue.toLocaleString()}
Partial cash received: $${summary.cashReceived.toLocaleString()}
Partial cash paid: $${summary.cashPaid.toLocaleString()}
Barter Bucks earned: ${summary.barterBucksEarned} BB

────────────────────────────────────────

TRANSACTION DETAIL

${transactionRows || 'No completed transactions for this tax year.'}

────────────────────────────────────────

The fair market values shown above are based on the amounts agreed upon by both parties at the time of the barter agreement. These values may constitute taxable income. For IRS guidance on barter income see: irs.gov/taxtopics/tc420

The Barter Shop Inc.
info@thebartershop.app
thebartershop.app
Governing law: State of Colorado`;
}

// Demo data for display
export function getDemoTaxData(year: number): {
  summary: TaxSummary;
  transactions: TaxTransaction[];
} {
  return {
    summary: {
      totalBarters: 12,
      servicesProvidedValue: 3600,
      servicesReceivedValue: 3400,
      netBarterValue: 3400,
      cashReceived: 200,
      cashPaid: 100,
      barterBucksEarned: 24,
    },
    transactions: [
      { date: 'Jan 15', partner: 'Aaliyah R.', serviceProvided: 'Fitness Training', providedValue: 300, serviceReceived: 'Hair Styling', receivedValue: 250, type: 'Full Barter', cashAmount: 0, status: 'Completed' },
      { date: 'Feb 8', partner: 'Jordan K.', serviceProvided: 'Fitness Training', providedValue: 300, serviceReceived: 'Photography', receivedValue: 400, type: 'Partial', cashAmount: 100, status: 'Completed' },
      { date: 'Mar 22', partner: 'Sofia M.', serviceProvided: 'Fitness Training', providedValue: 300, serviceReceived: 'Logo Design', receivedValue: 300, type: 'Full Barter', cashAmount: 0, status: 'Completed' },
      { date: 'Apr 10', partner: 'Carlos V.', serviceProvided: 'Fitness Training', providedValue: 300, serviceReceived: 'Meal Prep', receivedValue: 250, type: 'Full Barter', cashAmount: 0, status: 'Completed' },
      { date: 'May 5', partner: 'Zoe W.', serviceProvided: 'Fitness Training', providedValue: 300, serviceReceived: 'Massage', receivedValue: 200, type: 'Partial', cashAmount: 100, status: 'Completed' },
    ],
  };
}

// Fetch real data from Supabase
export async function fetchTaxData(userId: string, year: number): Promise<{
  summary: TaxSummary;
  transactions: TaxTransaction[];
} | null> {
  try {
    const { data: barters, error } = await supabase
      .from('barters')
      .select('*')
      .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
      .eq('status', 'completed')
      .eq('tax_year', year);

    if (error || !barters || barters.length === 0) {
      return null;
    }

    let providedValue = 0;
    let receivedValue = 0;
    let cashReceived = 0;
    let cashPaid = 0;

    const transactions: TaxTransaction[] = barters.map((b: any) => {
      const isRequester = b.requester_id === userId;
      const pVal = isRequester ? b.party_a_service_value || 0 : b.party_b_service_value || 0;
      const rVal = isRequester ? b.party_b_service_value || 0 : b.party_a_service_value || 0;
      providedValue += pVal;
      receivedValue += rVal;
      if (b.cash_amount > 0) {
        if (isRequester) cashPaid += b.cash_amount;
        else cashReceived += b.cash_amount;
      }
      return {
        date: new Date(b.completed_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        partner: isRequester ? 'Provider' : 'Requester',
        serviceProvided: 'Service',
        providedValue: pVal,
        serviceReceived: 'Service',
        receivedValue: rVal,
        type: b.barter_type || 'full',
        cashAmount: b.cash_amount || 0,
        status: 'Completed',
      };
    });

    return {
      summary: {
        totalBarters: barters.length,
        servicesProvidedValue: providedValue,
        servicesReceivedValue: receivedValue,
        netBarterValue: receivedValue,
        cashReceived,
        cashPaid,
        barterBucksEarned: barters.length * 2,
      },
      transactions,
    };
  } catch (e) {
    console.log('Tax data fetch error:', e);
    return null;
  }
}
