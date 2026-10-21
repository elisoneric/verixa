import { Injectable } from '@nestjs/common';
import { 
  IVerificationProvider, 
  BvnVerificationData, 
  NinVerificationData, 
  BankAccountVerificationData, 
  PhoneNumberVerificationData,
  CacVerificationData,
  TinVerificationData,
  DriversLicenseVerificationData,
  VotersCardVerificationData,
  PassportVerificationData,
  CreditScoreData,
  FaceMatchData,
  AmlScreeningData,
  PhoneIntelligenceData,
  EmailRiskData,
  NubanKycVerificationData,
  SmsDispatchData,
  AirtimePurchaseData,
  DataPurchaseData,
  VerificationResponse 
} from './verification.provider.interface';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker/locale/en_NG';
import { generatePdfSlip } from '../../slips/slip-generator.util';

@Injectable()
export class MockProvider implements IVerificationProvider {
  providerName = 'verixa_mock';

  async verifyBvn(data: BvnVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    if (data.bvn === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    if (data.variant === 'match') {
      return {
        status: 'success',
        data: {
          bvn: { value: `${data.bvn.slice(0, 1)}*****${data.bvn.slice(-5)}`, status: true },
          first_name: { confidence_value: 100, status: true },
          last_name: { confidence_value: 100, status: true },
        },
        meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
      };
    }

    const firstName = data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase();
    const lastName = data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase();
    const phoneNumber = `0${faker.string.numeric(10)}`;

    return {
      status: 'success',
      data: {
        bvn: `${data.bvn.slice(0, 1)}*****${data.bvn.slice(-5)}`,
        first_name: firstName,
        last_name: lastName,
        middle_name: 'CHUKWUEMEKA',
        date_of_birth: data.dob || '1992-05-16',
        phone_number1: phoneNumber,
        gender: 'Male',
        enrollment_bank: 'GTB',
        enrollment_branch: 'IKEJA',
        level_of_account: 'LEVEL 3',
        nationality: 'NIGERIAN',
        state_of_origin: 'LAGOS',
        lga_of_origin: 'IKEJA',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (data.nin === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    if (data.tier === 'advance' || data.tier === 'premium' || data.tier === 'slip') {
      return this.verifyNinAdvance({ nin: data.nin, isSlip: data.tier === 'slip' });
    }

    const firstName = data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase();
    const lastName = data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase();

    let photoBase64 = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const photoPath = path.resolve(__dirname, '../../slips/assets/default_mock_photo.jpg');
      if (fs.existsSync(photoPath)) {
        photoBase64 = fs.readFileSync(photoPath).toString('base64');
      }
    } catch {
      photoBase64 = '';
    }

    return {
      status: 'success',
      data: {
        nin: data.nin,
        first_name: firstName,
        last_name: lastName,
        middle_name: 'BABATUNDE',
        gender: 'Male',
        date_of_birth: '1990-08-14',
        phone_number: `080${faker.string.numeric(8)}`,
        photo: photoBase64,
        employment_status: 'Employed',
        marital_status: 'Single',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNinAdvance(data: { nin: string; isSlip?: boolean }): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (data.nin === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    const firstNames = ['BABATUNDE', 'CHUKWUDI', 'OLUMIDE', 'EMMANUEL', 'IBRAHIM', 'CHINEDU', 'TEMITOPE', 'ZAINAB', 'NGOZI', 'AISHA'];
    const surnames = ['ADEBAYO', 'OKONKWO', 'BALOGUN', 'BELLO', 'EZE', 'DANJUMA', 'OGUNLEWE', 'ABUBAKAR', 'NWOSU', 'SANUSI'];
    const middleNames = ['OLUWASEUN', 'SOMTOCHUKWU', 'AYOMIDE', 'IFEANYI', 'DAUDA', 'CHIDIEBERE', 'ENIOLA', 'YAKUBU', 'OLATUNJI'];

    const seed = data.nin.split('').reduce((acc, c) => acc + parseInt(c, 10) || 0, 0);
    const firstName = firstNames[seed % firstNames.length];
    const surname = surnames[(seed + 3) % surnames.length];
    const middleName = middleNames[(seed + 5) % middleNames.length];
    const gender = seed % 2 === 0 ? 'MALE' : 'FEMALE';

    const trackid = `VNX-${faker.string.numeric(4)}-${faker.string.numeric(4)}-${faker.string.numeric(4)}`;

    let photoBase64 = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const photoPath = path.resolve(__dirname, '../../slips/assets/default_mock_photo.jpg');
      if (fs.existsSync(photoPath)) {
        photoBase64 = fs.readFileSync(photoPath).toString('base64');
      }
    } catch {
      photoBase64 = '';
    }

    let ninIdPdfBase64 = '';
    if (data.isSlip) {
      try {
        const pdfBuf = await generatePdfSlip({
          nin: data.nin,
          trackingId: trackid,
          firstName,
          surname,
          middleName,
          gender: gender === 'MALE' ? 'M' : 'F',
          address: '14 ADENIRAN OGUNSANYA STREET',
          addressLine1: 'SURULERE, IKEJA LGA',
          state: 'LAGOS STATE',
          photo: photoBase64,
        });
        ninIdPdfBase64 = pdfBuf.toString('base64');
      } catch {
        ninIdPdfBase64 = '';
      }
    }

    return {
      status: 'success',
      data: {
        nin: data.nin,
        first_name: firstName,
        last_name: surname,
        middle_name: middleName,
        firstName,
        surname,
        middleName,
        gender: gender === 'MALE' ? 'Male' : 'Female',
        date_of_birth: '1994-08-16',
        birthdate: '1994-08-16',
        phone_number: `080${faker.string.numeric(8)}`,
        phoneNumber: `080${faker.string.numeric(8)}`,
        photo: photoBase64,
        employment_status: seed % 2 === 0 ? 'employed' : 'unemployed',
        marital_status: seed % 3 === 0 ? 'married' : 'single',
        birth_state: 'Lagos',
        birth_lga: 'Ikeja',
        birth_country: 'Nigeria',
        height: '172',
        title: gender === 'MALE' ? 'Mr' : 'Ms',
        email: `${firstName.toLowerCase()}.${surname.toLowerCase()}@example.com`,
        residence_address_line_1: '14 ADENIRAN OGUNSANYA STREET',
        address: '14 ADENIRAN OGUNSANYA STREET',
        addressLine1: 'SURULERE, IKEJA LGA',
        residence_lga: 'SURULERE',
        lga: 'SURULERE',
        residence_state: 'LAGOS STATE',
        state: 'LAGOS STATE',
        tracking_id: trackid,
        trackingId: trackid,
        nextOfKin: {
          firstName: 'FOLAKE',
          middleName: 'ESTHER',
          lastName: surname,
          town: 'SURULERE',
          lga: 'SURULERE',
          address: '14 ADENIRAN OGUNSANYA STREET',
        },
        nok_firstname: 'FOLAKE',
        nok_lastname: surname,
        ...(data.isSlip ? { nin_id: ninIdPdfBase64 } : {}),
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyBankAccount(data: BankAccountVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    if (data.accountNumber === '0000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    const firstName = faker.person.firstName().toUpperCase();
    const lastName = faker.person.lastName().toUpperCase();

    return {
      status: 'success',
      data: {
        account_name: `${firstName} ${lastName}`,
        account_number: data.accountNumber,
        bank_code: data.bankCode,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNubanKycStatus(data: NubanKycVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    return {
      status: 'success',
      data: {
        account_currency: 'NGN',
        account_name: 'CHIDERA EMMANUEL OKAFOR',
        account_number: `${data.accountNumber.slice(0, 3)}****${data.accountNumber.slice(-3)}`,
        bank: 'GUARANTY TRUST BANK (GTB)',
        kyc_status: '3',
        first_name: 'CHIDERA',
        last_name: 'OKAFOR',
        other_names: 'EMMANUEL',
        identity_type: 'BVN',
        identity_number: '22*******19',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyPhoneNumber(data: PhoneNumberVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      status: 'success',
      data: {
        first_name: 'OLUWATOBI',
        middle_name: 'SAMUEL',
        last_name: 'ADELEKE',
        gender: 'Male',
        nationality: 'NGA',
        date_of_birth: '1991-04-12',
        msisdn: data.phoneNumber.startsWith('234') ? data.phoneNumber : `234${data.phoneNumber.replace(/^0/, '')}`,
        photo: data.variant === 'advance' ? 'data:image/jpeg;base64,mockphoto' : undefined,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyCac(data: CacVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (data.variant === 'tin') {
      return {
        status: 'success',
        data: {
          company_name: 'VERIXA TECH ENTERPRISES LIMITED',
          tax_id: '198472910481',
          company_type: data.companyType || 'COMPANY',
          rc_number: data.rcNumber,
        },
        meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
      };
    }

    return {
      status: 'success',
      data: {
        company_name: 'VERIXA TECH ENTERPRISES LIMITED',
        rc_number: data.rcNumber,
        business_number: data.rcNumber,
        type_of_company: data.companyType || 'COMPANY',
        status: 'Active',
        date_of_registration: '2021-03-15T09:00:00.000Z',
        address: '15 PLOT 4, COMMERCIAL AVENUE, VICTORIA ISLAND',
        state: 'Lagos',
        city: 'Lagos Island',
        lga: 'Eti-Osa',
        affiliates: data.variant === 'advance' ? [
          {
            first_name: 'EMMANUEL',
            last_name: 'BALOGUN',
            affiliate_type: 'DIRECTOR',
            gender: 'MALE',
            phone_number: '+2348039281741',
            nationality: 'Nigerian',
          },
          {
            first_name: 'CHIDINMA',
            last_name: 'OKONKWO',
            affiliate_type: 'SHAREHOLDER',
            gender: 'FEMALE',
            phone_number: '+2348123984712',
            nationality: 'Nigerian',
          }
        ] : undefined,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async sendSms(data: SmsDispatchData): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      status: 'Sent',
      mobile: data.destination,
      message_id: `dj_${uuidv4().replace(/-/g, '')}`,
      reference_id: `ref_${uuidv4().replace(/-/g, '')}`,
    };
  }

  async purchaseAirtime(data: AirtimePurchaseData): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      status: 'Sent',
      mobile: Array.isArray(data.destination) ? data.destination[0] : data.destination,
      amount: `NGN ${data.amount}.00`,
      reference_id: `air_${uuidv4().replace(/-/g, '')}`,
    };
  }

  async purchaseData(data: DataPurchaseData): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      phone_number: data.destination,
      plan: data.plan,
      amount: 1000,
      network: 'MTN NIGERIA 1.5GB',
      reference_id: `dat_${uuidv4().replace(/-/g, '')}`,
    };
  }

  async getDataPlans(): Promise<any[]> {
    return [
      { amount: 500, description: 'MTN 1GB 30 Days Bundle', plan: 'MTN_1GB' },
      { amount: 1000, description: 'MTN 2.5GB 30 Days Bundle', plan: 'MTN_2.5GB' },
      { amount: 1500, description: 'AIRTEL 3GB Monthly Plan', plan: 'AIRTEL_3GB' },
      { amount: 2000, description: 'GLO 5.5GB Monthly Plan', plan: 'GLO_5.5GB' },
      { amount: 1200, description: '9MOBILE 2GB Monthly Plan', plan: '9MOBILE_2GB' },
    ];
  }

  async verifyTin(data: TinVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      status: 'success',
      data: {
        tin: data.tin,
        taxpayer_name: 'APEX TECHNOLOGIES LIMITED',
        tax_office: 'MSTO YABA',
        phone_number: '08031234567',
        email: 'tax@apextech.ng',
        registration_number: '1928374',
        jtb_tin: '10029384712',
        active: true,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyDriversLicense(data: DriversLicenseVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      status: 'success',
      data: {
        license_number: data.licenseNumber,
        first_name: 'CHIDERA',
        last_name: 'OLUTOLA',
        middle_name: 'EMEKA',
        date_of_birth: data.dob || '1988-04-14',
        gender: 'MALE',
        state_of_issue: 'LAGOS',
        issue_date: '2022-03-10',
        expiry_date: '2027-03-09',
        photo: 'data:image/jpeg;base64,mockphoto_frsc',
        status: 'VALID',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyVotersCard(data: VotersCardVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 320));
    return {
      status: 'success',
      data: {
        vin: data.vin,
        first_name: 'CHIDERA',
        last_name: data.lastName || 'OLUTOLA',
        middle_name: 'EMEKA',
        date_of_birth: '1988-04-14',
        gender: 'MALE',
        occupation: 'SOFTWARE ARCHITECT',
        state: data.state || 'LAGOS',
        lga: 'ETI-OSA',
        polling_unit: 'PU 024 LEKKI PHASE 1',
        delimitation: '24-08-05-024',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyPassport(data: PassportVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      status: 'success',
      data: {
        passport_number: data.passportNumber,
        first_name: 'CHIDERA',
        last_name: data.lastName || 'OLUTOLA',
        middle_name: 'EMEKA',
        date_of_birth: data.dob || '1988-04-14',
        gender: 'MALE',
        issue_date: '2020-08-20',
        expiry_date: '2030-08-19',
        issue_place: 'IKOYI, LAGOS',
        nationality: 'NIGERIAN',
        photo: 'data:image/jpeg;base64,mockphoto_nis',
        status: 'ACTIVE',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async getCreditScore(data: CreditScoreData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 450));
    return {
      status: 'success',
      data: {
        bvn: data.bvn,
        credit_score: 742,
        credit_rating: 'EXCELLENT',
        risk_level: 'LOW',
        total_accounts: 5,
        active_accounts: 2,
        closed_accounts: 3,
        total_loan_amount: 1500000,
        outstanding_balance: 180000,
        delinquent_accounts: 0,
        bureau_coverage: ['CRC', 'FIRST_CENTRAL', 'CREDIT_REGISTRY'],
        last_inquiry_date: '2026-09-28',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyFaceMatch(data: FaceMatchData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      status: 'success',
      data: {
        id_type: data.idType,
        id_number: data.idNumber,
        match_status: 'MATCHED',
        confidence_score: 96.8,
        liveness_passed: data.livenessCheck !== false,
        threshold: 80.0,
        registry_name: 'CHIDERA EMEKA OLUTOLA',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async screenAml(data: AmlScreeningData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      status: 'success',
      data: {
        screened_name: data.name,
        match_count: 0,
        risk_level: 'CLEAN',
        is_pep: false,
        is_sanctioned: false,
        sources_checked: ['OFAC', 'UN', 'INTERPOL', 'EU', 'UK_HMT'],
        matches: [],
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async screenPhoneIntelligence(data: PhoneIntelligenceData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 280));
    return {
      status: 'success',
      data: {
        phone_number: data.phoneNumber,
        carrier: 'MTN NIGERIA',
        line_status: 'ACTIVE',
        sim_swap_last_30_days: false,
        sim_swap_date: null,
        caller_id_name: 'CHIDERA EMEKA',
        risk_score: 10,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async checkEmailRisk(data: EmailRiskData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      status: 'success',
      data: {
        email: data.email,
        is_valid_format: true,
        is_deliverable: true,
        is_disposable: false,
        is_free_provider: false,
        domain: data.email.split('@')[1] || 'apextech.ng',
        domain_age_days: 1820,
        breach_count: 0,
        risk_score: 5,
        recommendation: 'ALLOW',
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async getUpstreamBalance(): Promise<{ balance: string; currency: string }> {
    return { balance: '500,000.00', currency: 'NGN' };
  }
}
