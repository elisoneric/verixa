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
import {
  generatePdfSlip,
  generateDocxSlip,
  generateDigitalNinCardPdf,
  generateDigitalNinCardSvg,
} from '../../slips/slip-generator.util';

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

    const isSandboxDojahBvn = data.bvn === '22222222222';

    if (data.variant === 'match') {
      return {
        status: 'success',
        data: {
          bvn: { value: isSandboxDojahBvn ? '22222222222' : `${data.bvn.slice(0, 1)}*****${data.bvn.slice(-5)}`, status: true },
          first_name: { confidence_value: 100, status: true },
          last_name: { confidence_value: 100, status: true },
        },
        meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
      };
    }

    const firstName = isSandboxDojahBvn ? 'JOHN' : (data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase());
    const lastName = isSandboxDojahBvn ? 'MUSA' : (data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase());
    const middleName = isSandboxDojahBvn ? 'DOE' : 'CHUKWUEMEKA';
    const dob = isSandboxDojahBvn ? '1990-01-11' : (data.dob || '1992-05-16');
    const phoneNumber = isSandboxDojahBvn ? '09011111111' : `0${faker.string.numeric(10)}`;

    return {
      status: 'success',
      data: {
        bvn: isSandboxDojahBvn ? '22222222222' : `${data.bvn.slice(0, 1)}*****${data.bvn.slice(-5)}`,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        date_of_birth: dob,
        phone_number1: phoneNumber,
        phone_number: phoneNumber,
        gender: 'Male',
        enrollment_bank: '058',
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
      return this.verifyNinAdvance({ nin: data.nin, isSlip: true });
    }

    const isSandboxDojahNin = data.nin === '70123456789';
    const firstName = isSandboxDojahNin ? 'JOHN' : (data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase());
    const lastName = isSandboxDojahNin ? 'MUSA' : (data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase());
    const middleName = isSandboxDojahNin ? 'DOE' : 'CHUKWUEMEKA';
    const phone = isSandboxDojahNin ? '09011111111' : `080${faker.string.numeric(8)}`;
    const dob = isSandboxDojahNin ? '1990-01-11' : '1982-01-01';

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
        gender: 'Male',
        middle_name: middleName,
        photo: photoBase64,
        date_of_birth: dob,
        phone_number: phone,
        employment_status: 'unemployed',
        marital_status: 'single',
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
    const isSandboxDojah = data.nin === '70123456789';
    const firstName = isSandboxDojah ? 'JOHN' : firstNames[seed % firstNames.length];
    const surname = isSandboxDojah ? 'MUSA' : surnames[(seed + 3) % surnames.length];
    const middleName = isSandboxDojah ? 'DOE' : middleNames[(seed + 5) % middleNames.length];
    const gender = 'MALE';
    const dob = isSandboxDojah ? '1990-01-11' : '1990-01-01';
    const phone = isSandboxDojah ? '09011111111' : `080${faker.string.numeric(8)}`;
    const address = isSandboxDojah ? '2, ANON STREET' : '1, EXAMPLE STREET';
    const lga = isSandboxDojah ? 'Lagos West' : 'Ikeja';
    const state = 'Lagos';
    const trackingId = isSandboxDojah ? 'VNX-7012-3456-7890' : `VNX-${faker.string.numeric(4)}-${faker.string.numeric(4)}-${faker.string.numeric(4)}`;

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
    let docxBase64 = '';
    let cardPdfBase64 = '';
    let cardSvg = '';

    try {
      const pdfBuf = await generatePdfSlip({
        nin: data.nin,
        trackingId,
        firstName,
        surname,
        middleName,
        gender: gender === 'MALE' ? 'M' : 'F',
        address,
        addressLine1: `${lga}, ${state}`,
        state: `${state} STATE`,
        photo: photoBase64,
      });
      ninIdPdfBase64 = pdfBuf.toString('base64');
    } catch {
      ninIdPdfBase64 = '';
    }

    try {
      const docxBuf = await generateDocxSlip({
        nin: data.nin,
        trackingId,
        firstName,
        surname,
        middleName,
        gender,
        address,
        addressLine1: lga,
        state,
        photo: photoBase64,
      });
      docxBase64 = docxBuf.toString('base64');
    } catch {
      docxBase64 = '';
    }

    try {
      const cardBuf = await generateDigitalNinCardPdf({
        nin: data.nin,
        trackingId,
        firstName,
        surname,
        middleName,
        gender,
        birthdate: dob,
        photo: photoBase64,
      });
      cardPdfBase64 = cardBuf.toString('base64');
      cardSvg = await generateDigitalNinCardSvg({
        nin: data.nin,
        trackingId,
        firstName,
        surname,
        middleName,
        gender,
        birthdate: dob,
        photo: photoBase64,
      });
    } catch {
      cardPdfBase64 = '';
    }

    return {
      status: 'success',
      data: {
        nin: data.nin,
        first_name: firstName,
        last_name: surname,
        middle_name: middleName,
        date_of_birth: dob,
        phone_number: phone,
        photo: photoBase64,
        gender: 'Male',
        birth_country: 'nigeria',
        birth_lga: lga,
        birth_state: state,
        residence_address_line_1: address,
        residence_status: 'birth',
        residence_town: lga,
        residence_lga: lga,
        residence_state: state,
        origin_lga: lga,
        origin_place: lga,
        origin_state: state,
        nok_first_name: 'JANE',
        nok_middle_name: 'AMINA',
        nok_last_name: surname,
        nok_town: lga,
        nok_lga: lga,
        nok_address_line_1: address,
        employment_status: 'unemployed',
        marital_status: 'single',
        height: '171',
        tracking_id: trackingId,
        trackingId,
        firstName,
        surname,
        middleName,
        address,
        addressLine1: lga,
        state,
        nok_firstname: 'JANE',
        nok_lastname: surname,
        nin_id: ninIdPdfBase64,
        pdfBase64: ninIdPdfBase64,
        docxBase64,
        cardPdfBase64,
        cardSvg,
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

    const isSandboxDojah = data.phoneNumber === '09011111111' || data.phoneNumber === '2349011111111' || data.phoneNumber.endsWith('011111111');
    const firstName = isSandboxDojah ? 'JOHN' : 'OLUWATOBI';
    const middleName = isSandboxDojah ? 'DOE' : 'SAMUEL';
    const lastName = isSandboxDojah ? 'MUSA' : 'ADELEKE';
    const dob = isSandboxDojah ? '1990-01-11' : '1991-04-12';

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
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        gender: 'Male',
        nationality: 'NGA',
        date_of_birth: dob,
        phone_number: '09011111111',
        msisdn: data.phoneNumber.startsWith('234') ? data.phoneNumber : `234${data.phoneNumber.replace(/^0/, '')}`,
        photo: photoBase64,
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
