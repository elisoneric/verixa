import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NinSlipService } from './nin-slip.service';
import { DojahProvider } from '../verifications/providers/dojah.provider';
import { MockProvider } from '../verifications/providers/mock.provider';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { BillingService } from '../billing/billing.service';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { Environment } from '../organizations/entities/environment-config.entity';
import { encryptPayload } from '../common/utils/crypto.util';

describe('NinSlipService', () => {
  let service: NinSlipService;
  let logRepository: any;
  let identityCacheService: any;
  let billingService: any;
  let mockProvider: any;
  let dojahProvider: any;

  const mockOrgId = 'org-uuid-1234';
  const mockNin = '12345678901';

  const mockIdentityData = {
    nin: mockNin,
    trackingId: 'TRK-987654321',
    firstName: 'Fatima',
    surname: 'Aliyu',
    middleName: 'Zahra',
    gender: 'FEMALE',
    birthdate: '1992-04-18',
    address: '15 Gana Street Maitama',
    addressLine1: 'Abuja Municipal',
    state: 'FCT',
    photo: 'dGVzdC1waG90by1iYXNlNjQ=',
  };

  beforeEach(async () => {
    logRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'log-new-id', ...entity })),
    };

    identityCacheService = {
      getCachedRecord: jest.fn(),
      setCachedRecord: jest.fn(),
      generateKey: jest.fn().mockReturnValue('mock-cache-key'),
    };

    billingService = {
      getEffectiveRate: jest.fn().mockResolvedValue({ effectiveRate: 50, baseRate: 50 }),
      deductCredits: jest.fn().mockResolvedValue(true),
      refundCredits: jest.fn().mockResolvedValue(true),
    };

    mockProvider = {
      verifyNin: jest.fn(),
      verifyNinAdvance: jest.fn(),
    };

    dojahProvider = {
      verifyNin: jest.fn(),
      verifyNinAdvance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NinSlipService,
        { provide: DojahProvider, useValue: dojahProvider },
        { provide: MockProvider, useValue: mockProvider },
        { provide: IdentityCacheService, useValue: identityCacheService },
        { provide: BillingService, useValue: billingService },
        { provide: getRepositoryToken(VerificationLog), useValue: logRepository },
      ],
    }).compile();

    service = module.get<NinSlipService>(NinSlipService);
  });

  describe('generateOnDemandSlip (F17)', () => {
    const validLog: Partial<VerificationLog> = {
      id: 'log-uuid-valid-1',
      org_id: mockOrgId,
      environment: Environment.SANDBOX,
      serviceType: 'nin_slip',
      status: VerificationStatus.SUCCESS,
      requestPayload: { nin: mockNin },
      responsePayload: encryptPayload(mockIdentityData),
    };

    it('should throw BadRequestException when logId is missing', async () => {
      await expect(
        service.generateOnDemandSlip({
          logId: '',
          format: 'slip',
          fileType: 'pdf',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when log is not found in database', async () => {
      logRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateOnDemandSlip({
          logId: 'non-existent-log-id',
          format: 'slip',
          fileType: 'pdf',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should enforce tenant isolation and throw NotFoundException on org_id mismatch', async () => {
      logRepository.findOne.mockResolvedValue(validLog);

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'slip',
          fileType: 'pdf',
          organizationId: 'different-org-id',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if log verification status is not SUCCESS', async () => {
      logRepository.findOne.mockResolvedValue({
        ...validLog,
        status: VerificationStatus.FAILED,
      });

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'slip',
          fileType: 'pdf',
          organizationId: mockOrgId,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if serviceType is not NIN-related (e.g. BVN)', async () => {
      logRepository.findOne.mockResolvedValue({
        ...validLog,
        serviceType: 'bvn',
      });

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'slip',
          fileType: 'pdf',
          organizationId: mockOrgId,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on unsupported format', async () => {
      logRepository.findOne.mockResolvedValue(validLog);

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'unsupported_format',
          fileType: 'pdf',
          organizationId: mockOrgId,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on unsupported fileType', async () => {
      logRepository.findOne.mockResolvedValue(validLog);

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'slip',
          fileType: 'png',
          organizationId: mockOrgId,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DOCX request for NIMC Card format', async () => {
      logRepository.findOne.mockResolvedValue(validLog);

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'card',
          fileType: 'docx',
          organizationId: mockOrgId,
        })
      ).rejects.toThrow('DOCX format is not supported for NIMC Card');
    });

    it('should fallback to Smart Identity Cache when decrypted payload lacks demographic fields', async () => {
      logRepository.findOne.mockResolvedValue({
        ...validLog,
        responsePayload: encryptPayload({}), // Empty demographic payload
      });
      identityCacheService.getCachedRecord.mockResolvedValue({
        data: mockIdentityData,
      });

      const result = await service.generateOnDemandSlip({
        logId: validLog.id!,
        format: 'slip',
        fileType: 'pdf',
        organizationId: mockOrgId,
      });

      expect(identityCacheService.getCachedRecord).toHaveBeenCalled();
      expect(result.contentType).toBe('application/pdf');
      expect(result.filename).toBe(`NIN_Standard_Slip_${mockNin}.pdf`);
      expect(result.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    });

    it('should throw BadRequestException when neither response payload nor cache has demographic data', async () => {
      logRepository.findOne.mockResolvedValue({
        ...validLog,
        responsePayload: encryptPayload({}),
      });
      identityCacheService.getCachedRecord.mockResolvedValue(null);

      await expect(
        service.generateOnDemandSlip({
          logId: validLog.id!,
          format: 'slip',
          fileType: 'pdf',
          organizationId: mockOrgId,
        })
      ).rejects.toThrow('Identity demographic data cannot be retrieved from record');
    });

    it('should successfully synthesize NIMC Digital Card PDF', async () => {
      logRepository.findOne.mockResolvedValue(validLog);

      const result = await service.generateOnDemandSlip({
        logId: validLog.id!,
        format: 'card',
        fileType: 'pdf',
        organizationId: mockOrgId,
      });

      expect(result.contentType).toBe('application/pdf');
      expect(result.filename).toBe(`NIN_Digital_Card_${mockNin}.pdf`);
      expect(result.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
      expect(result.sizeBytes).toBe(result.buffer.length);
    });

    it('should successfully synthesize Standard NIN Slip DOCX', async () => {
      logRepository.findOne.mockResolvedValue(validLog);

      const result = await service.generateOnDemandSlip({
        logId: validLog.id!,
        format: 'slip',
        fileType: 'docx',
        organizationId: mockOrgId,
      });

      expect(result.contentType).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(result.filename).toBe(`NIN_Standard_Slip_${mockNin}.docx`);
      expect(result.buffer[0]).toBe(0x50); // ZIP PK header
      expect(result.buffer[1]).toBe(0x4b);
      expect(result.sizeBytes).toBe(result.buffer.length);
    });
  });

  describe('lookupIdentity', () => {
    it('should reject NIN with length !== 11 with BadRequestException', async () => {
      await expect(
        service.lookupIdentity(mockOrgId, Environment.SANDBOX, '12345')
      ).rejects.toThrow('A valid 11-digit NIN is required');
    });

    it('should return cached identity and deduct discounted credits on cache hit', async () => {
      identityCacheService.getCachedRecord.mockResolvedValue({
        data: mockIdentityData,
      });

      const res = await service.lookupIdentity(mockOrgId, Environment.SANDBOX, mockNin);

      expect(res.success).toBe(true);
      expect(res.meta.cached).toBe(true);
      expect(mockProvider.verifyNin).not.toHaveBeenCalled();
      expect(billingService.deductCredits).toHaveBeenCalled();
    });

    it('should refund credits if upstream lookup throws error', async () => {
      identityCacheService.getCachedRecord.mockResolvedValue(null);
      mockProvider.verifyNin.mockRejectedValue(new Error('Network failure'));
      mockProvider.verifyNinAdvance.mockRejectedValue(new Error('Network failure'));

      await expect(
        service.lookupIdentity(mockOrgId, Environment.SANDBOX, mockNin)
      ).rejects.toThrow();

      expect(billingService.refundCredits).toHaveBeenCalled();
    });
  });
});
