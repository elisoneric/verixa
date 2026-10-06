export interface BvnVerificationData {
  bvn: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  consent?: boolean;
  variant?: 'match' | 'full' | 'advance';
}

export interface NinVerificationData {
  nin: string;
  firstName?: string;
  lastName?: string;
  consent?: boolean;
  tier?: 'basic' | 'advance' | 'premium' | 'slip';
}

export interface BankAccountVerificationData {
  accountNumber: string;
  bankCode: string;
  consent?: boolean;
}

export interface NinAdvanceVerificationData {
  nin: string;
  consent?: boolean;
}

export interface NinAdvanceResult {
  nin: string;
  trackingId: string;
  firstName: string;
  surname: string;
  middleName: string;
  gender: string;
  birthdate: string;
  address: string;
  addressLine1: string;
  state: string;
  lga?: string;
  phoneNumber?: string;
  photo: string; // base64 string
  signature?: string;
  profession?: string;
  educationalLevel?: string;
  nextOfKin?: any;
}

export interface PhoneNumberVerificationData {
  phoneNumber: string;
  consent?: boolean;
  variant?: 'basic' | 'advance';
}

export interface CacVerificationData {
  rcNumber: string;
  companyType?: string; // 'COMPANY', 'BUSINESS_NAME', 'INCORPORATED_TRUSTEES', etc.
  consent?: boolean;
  variant?: 'basic' | 'advance' | 'tin';
}

export interface NubanKycVerificationData {
  accountNumber: string;
  bankCode: string;
  consent?: boolean;
}

export interface SmsDispatchData {
  destination: string;
  message: string;
  channel?: 'sms' | 'whatsapp' | 'voice';
  senderId?: string;
  priority?: boolean;
}

export interface AirtimePurchaseData {
  amount: number;
  destination: string | string[];
}

export interface DataPurchaseData {
  plan: string;
  destination: string;
}

export interface VerificationResponse<T> {
  status: 'success' | 'failed';
  data?: T;
  meta: {
    provider: string;
    reference: string;
  };
}

export interface IVerificationProvider {
  providerName: string;
  verifyBvn(data: BvnVerificationData): Promise<VerificationResponse<any>>;
  verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>>;
  verifyNinAdvance(data: NinAdvanceVerificationData): Promise<VerificationResponse<NinAdvanceResult>>;
  verifyBankAccount(data: BankAccountVerificationData): Promise<VerificationResponse<any>>;
  verifyPhoneNumber?(data: PhoneNumberVerificationData): Promise<VerificationResponse<any>>;
  verifyCac?(data: CacVerificationData): Promise<VerificationResponse<any>>;
  verifyNubanKycStatus?(data: NubanKycVerificationData): Promise<VerificationResponse<any>>;
  sendSms?(data: SmsDispatchData): Promise<any>;
  purchaseAirtime?(data: AirtimePurchaseData): Promise<any>;
  purchaseData?(data: DataPurchaseData): Promise<any>;
  getDataPlans?(): Promise<any>;
  getUpstreamBalance?(): Promise<any>;
}
