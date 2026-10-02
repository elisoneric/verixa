import { Injectable } from '@nestjs/common';
import { 
  IVerificationProvider, 
  BvnVerificationData, 
  NinVerificationData, 
  BankAccountVerificationData, 
  VerificationResponse 
} from './verification.provider.interface';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker/locale/en_NG'; // Use Nigerian locale if available, fallback to en

@Injectable()
export class MockProvider implements IVerificationProvider {
  providerName = 'verixa_mock';

  async verifyBvn(data: BvnVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (data.bvn === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    const firstName = data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase();
    const lastName = data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase();
    // Simulate Nigerian phone number 080...
    const phoneNumber = `0${faker.string.numeric(10)}`;

    return {
      status: 'success',
      data: {
        bvn: data.bvn,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
        phone_number: phoneNumber,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNin(data: NinVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 350));

    if (data.nin === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    const firstName = data.firstName?.toUpperCase() || faker.person.firstName().toUpperCase();
    const lastName = data.lastName?.toUpperCase() || faker.person.lastName().toUpperCase();

    return {
      status: 'success',
      data: {
        nin: data.nin,
        first_name: firstName,
        last_name: lastName,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }

  async verifyNinAdvance(data: { nin: string }): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 450));

    if (data.nin === '00000000000') {
      return {
        status: 'failed',
        meta: { provider: this.providerName, reference: uuidv4() },
      };
    }

    // Realistic Nigerian names
    const firstNames = ['BABATUNDE', 'CHUKWUDI', 'OLUMIDE', 'EMMANUEL', 'IBRAHIM', 'CHINEDU', 'TEMITOPE', 'ZAINAB', 'NGOZI', 'AISHA'];
    const surnames = ['ADEBAYO', 'OKONKWO', 'BALOGUN', 'BELLO', 'EZE', 'DANJUMA', 'OGUNLEWE', 'ABUBAKAR', 'NWOSU', 'SANUSI'];
    const middleNames = ['OLUWASEUN', 'SOMTOCHUKWU', 'AYOMIDE', 'IFEANYI', 'DAUDA', 'CHIDIEBERE', 'ENIOLA', 'YAKUBU', 'OLATUNJI'];

    // Deterministic or seeded selection based on digits
    const seed = data.nin.split('').reduce((acc, c) => acc + parseInt(c, 10) || 0, 0);
    const firstName = firstNames[seed % firstNames.length];
    const surname = surnames[(seed + 3) % surnames.length];
    const middleName = middleNames[(seed + 5) % middleNames.length];
    const gender = seed % 2 === 0 ? 'MALE' : 'FEMALE';

    // Format realistic tracking ID: VNX-XXXX-XXXX-XXXX
    const trackid = `VNX-${faker.string.numeric(4)}-${faker.string.numeric(4)}-${faker.string.numeric(4)}`;

    // Load default realistic portrait photo from assets
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
        trackingId: trackid,
        firstName,
        surname,
        middleName,
        gender,
        birthdate: '1994-08-16',
        address: '14 ADENIRAN OGUNSANYA STREET',
        addressLine1: 'SURULERE, IKEJA LGA',
        state: 'LAGOS STATE',
        lga: 'SURULERE',
        phoneNumber: `080${faker.string.numeric(8)}`,
        photo: photoBase64,
      },
      meta: { provider: this.providerName, reference: `req_${uuidv4()}` },
    };
  }


  async verifyBankAccount(data: BankAccountVerificationData): Promise<VerificationResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));

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
}
