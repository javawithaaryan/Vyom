export const FRAUD_DEMO_PRESETS = [
  {
    id: 'vpn-payment',
    title: 'VPN-based payment',
    description: 'New device + proxy + amount spike',
    data: {
      amount: '8420',
      location: 'Lagos, NG',
      device: 'unknown device / VPN / Tor exit node',
      merchantCategory: 'wire transfer',
    },
  },
  {
    id: 'new-device-transfer',
    title: 'New device transfer',
    description: 'First-seen device, foreign location',
    data: {
      amount: '3200',
      location: 'Bucharest, RO',
      device: 'new device — unrecognized fingerprint',
      merchantCategory: 'money transfer',
    },
  },
  {
    id: 'crypto-fraud',
    title: 'Crypto fraud attempt',
    description: 'High-risk merchant category',
    data: {
      amount: '15000',
      location: 'international',
      device: 'mobile / VPN proxy',
      merchantCategory: 'cryptocurrency',
    },
  },
  {
    id: 'normal-coffee',
    title: 'Normal purchase',
    description: 'Low-risk baseline',
    data: {
      amount: '4.50',
      location: 'Portland, US',
      device: 'Chrome / MacOS / home wifi',
      merchantCategory: 'grocery',
    },
  },
];

export const SCAM_DEMO_PRESETS = [
  {
    id: 'banking-sms',
    title: 'Fake banking SMS',
    description: 'Urgency + account block threat',
    content: `From: alerts@secure-bank-support.net
Subject: URGENT: Your account will be blocked in 10 minutes

Dear customer, unusual activity was detected. Verify your identity immediately by clicking here and entering your OTP and password. Act now or your account will be suspended.`,
  },
  {
    id: 'prize-scam',
    title: 'Prize / lottery scam',
    description: 'Free money pressure',
    content: `CONGRATULATIONS! You have WON $50,000 in our lottery. Send your bank account details and a small processing fee via wire transfer to claim your prize immediately. Limited time only!`,
  },
  {
    id: 'irs-impersonation',
    title: 'Tax impersonation',
    description: 'Government pressure',
    content: `IRS Notice: Your tax refund is pending. Confirm your identity and bank account number today. Failure to respond within 24 hours will result in penalties. Call this number immediately.`,
  },
  {
    id: 'crypto-urgency',
    title: 'Crypto payment pressure',
    description: 'Bitcoin wallet request',
    content: `URGENT: Complete your payment using Bitcoin to wallet address bc1q... Send money now or lose access. Do not tell anyone. This must be done immediately.`,
  },
];
