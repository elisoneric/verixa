export interface BvnVerificationData {
  bvn: string;
  firstName?: string;
  lastName?: string;
}

export interface NinVerificationData {
  nin: string;
  firstName?: string;
  lastName?: string;
}

export interface BankAccountVerificationData {
  accountNumber: string;
  bankCode: string;
}

export interface NinAdvanceVerificationData {
  nin: string;
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
}

