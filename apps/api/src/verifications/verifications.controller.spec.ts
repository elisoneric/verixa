import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { VerificationsController } from './verifications.controller';
import { MockProvider } from './providers/mock.provider';
import { DojahProvider } from './providers/dojah.provider';
import { BillingService } from '../billing/billing.service';
import { IdentityCacheService } from './identity-cache.service';
import { VerificationLog, VerificationStatus } from './entities/verification-log.entity';
import { Environment } from '../organizations/entities/environment-config.entity';
import { encryptPayload } from '../common/utils/crypto.util';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('VerificationsController', () => {
  let controller: VerificationsController;
  let moduleRef: TestingModule;
  let mockProvider: any;
  let dojahProvider: any;
  let billingService: any;
  let identityCacheService: any;
  let logRepository: any;

  const mockOrgId = 'org-uuid-9999';

  const mockSuccessfulProviderResult = {
    status: 'success',
    data: {
      nin: '12345678901',
      firstName: 'Babajide',
      lastName: 'Sanwo',
    },
    meta: {
      provider: 'direct',
      reference: 'upstream-ref-111',
    },
  };

  beforeEach(async () => {
    mockProvider = {
      verifyBvn: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyNin: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyBankAccount: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyPhoneNumber: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyCac: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyNubanKycStatus: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyTin: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyDriversLicense: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyVotersCard: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyPassport: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
    };

    dojahProvider = {
      verifyBvn: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyNin: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyBankAccount: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyPhoneNumber: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyCac: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyNubanKycStatus: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyTin: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyDriversLicense: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyVotersCard: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
      verifyPassport: jest.fn().mockResolvedValue(mockSuccessfulProviderResult),
    };

    billingService = {
      getEffectiveRate: jest.fn().mockResolvedValue({ effectiveRate: 60, baseRate: 60 }),
      deductCredits: jest.fn().mockResolvedValue(true),
      refundCredits: jest.fn().mockResolvedValue(true),
    };

    identityCacheService = {
      getCachedRecord: jest.fn().mockResolvedValue(null),
      setCachedRecord: jest.fn().mockResolvedValue(undefined),
      generateKey: jest.fn().mockImplementation((org, env, srv, id) => `vx_cache:${env}:${org}:${srv}:${id}`),
    };

    logRepository = {
      save: jest.fn().mockImplementation((val) => Promise.resolve({ id: 'log-1', ...val })),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [VerificationsController],
      providers: [
        { provide: MockProvider, useValue: mockProvider },
        { provide: DojahProvider, useValue: dojahProvider },
        { provide: BillingService, useValue: billingService },
        { provide: IdentityCacheService, useValue: identityCacheService },
        { provide: getRepositoryToken(VerificationLog), useValue: logRepository },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<VerificationsController>(VerificationsController);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  describe('Applicant Consent Validation', () => {
    const mockReq = { organizationId: mockOrgId, environment: Environment.SANDBOX, headers: {} };

    it('should throw BadRequestException when consent is missing or false in manualVerify', async () => {
      await expect(
        controller.manualVerify(mockReq, {
          service: 'nin',
          environment: Environment.SANDBOX,
          payload: { nin: '12345678901' }, // consent missing
        })
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.manualVerify(mockReq, {
          service: 'nin',
          environment: Environment.SANDBOX,
          payload: { nin: '12345678901', consent: false },
        })
      ).rejects.toThrow('Applicant consent is mandatory for regulatory identity lookup');
    });

    it('should allow verification when consent: true or consent: "true"', async () => {
      const res = await controller.manualVerify(mockReq, {
        service: 'nin',
        environment: Environment.SANDBOX,
        payload: { nin: '12345678901', consent: true },
      });
      expect(res.success).toBe(true);
      expect(res.service).toBe('nin');
    });

    it('should reject requests without consent on dedicated verifyBvn endpoint', async () => {
      await expect(
        controller.verifyBvn(mockReq, { bvn: '22233344455', consent: false })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject requests without consent on dedicated verifyNin endpoint', async () => {
      await expect(
        controller.verifyNin(mockReq, { nin: '12345678901' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Manual Verification Routing for All 10 Services (F14)', () => {
    const mockReq = { organizationId: mockOrgId, environment: Environment.SANDBOX, headers: {} };

    const services = [
      { service: 'nin', payload: { nin: '12345678901', consent: true }, providerMethod: 'verifyNin' },
      { service: 'bvn', payload: { bvn: '22233344455', consent: true }, providerMethod: 'verifyBvn' },
      { service: 'nuban', payload: { bankCode: '058', accountNumber: '0123456789', consent: true }, providerMethod: 'verifyBankAccount' },
      { service: 'phone', payload: { phoneNumber: '08012345678', consent: true }, providerMethod: 'verifyPhoneNumber' },
      { service: 'cac', payload: { rcNumber: 'RC123456', consent: true }, providerMethod: 'verifyCac' },
      { service: 'nuban_kyc', payload: { bankCode: '058', accountNumber: '0123456789', consent: true }, providerMethod: 'verifyNubanKycStatus' },
      { service: 'tin', payload: { tin: '12345678-0001', consent: true }, providerMethod: 'verifyTin' },
      { service: 'dl', payload: { licenseNumber: 'DL987654321', consent: true }, providerMethod: 'verifyDriversLicense' },
      { service: 'vin', payload: { vin: 'VIN1234567890', consent: true }, providerMethod: 'verifyVotersCard' },
      { service: 'passport', payload: { passportNumber: 'A12345678', consent: true }, providerMethod: 'verifyPassport' },
    ];

    services.forEach(({ service, payload, providerMethod }) => {
      it(`should successfully route service "${service}" to ${providerMethod}`, async () => {
        const result = await controller.manualVerify(mockReq, {
          service,
          environment: Environment.SANDBOX,
          payload,
        });

        expect(result.success).toBe(true);
        expect(result.service).toBe(service);
        expect(result.reference).toBeDefined();
        expect(result.verifiedAt).toBeDefined();
        expect(mockProvider[providerMethod]).toHaveBeenCalled();
      });
    });

    it('should throw when unsupported service is submitted', async () => {
      await expect(
        controller.manualVerify(mockReq, {
          service: 'unsupported_unknown_service',
          environment: Environment.SANDBOX,
          payload: { consent: true },
        })
      ).rejects.toThrow();
    });
  });

  describe('Environment Switching (Live vs Sandbox)', () => {
    const mockReq = { organizationId: mockOrgId, headers: {} };

    it('should route to DojahProvider when environment is LIVE', async () => {
      await controller.manualVerify(
        { ...mockReq, environment: Environment.LIVE },
        {
          service: 'nin',
          environment: Environment.LIVE,
          payload: { nin: '12345678901', consent: true },
        }
      );
      expect(dojahProvider.verifyNin).toHaveBeenCalled();
      expect(mockProvider.verifyNin).not.toHaveBeenCalled();
    });

    it('should route to MockProvider when environment is SANDBOX', async () => {
      await controller.manualVerify(
        { ...mockReq, environment: Environment.SANDBOX },
        {
          service: 'nin',
          environment: Environment.SANDBOX,
          payload: { nin: '12345678901', consent: true },
        }
      );
      expect(mockProvider.verifyNin).toHaveBeenCalled();
      expect(dojahProvider.verifyNin).not.toHaveBeenCalled();
    });
  });

  describe('Smart Identity Cache & Billing Deductions', () => {
    const mockReq = { organizationId: mockOrgId, environment: Environment.SANDBOX, headers: {} };

    it('should deduct discounted fee and skip upstream provider on Cache Hit', async () => {
      identityCacheService.getCachedRecord.mockResolvedValue({
        data: { nin: '12345678901', firstName: 'CachedUser' },
        cachedAt: new Date().toISOString(),
        sourceProvider: 'direct',
      });
      billingService.getEffectiveRate.mockResolvedValue({ effectiveRate: 20 }); // Discounted cache rate

      const res = await controller.manualVerify(mockReq, {
        service: 'nin',
        environment: Environment.SANDBOX,
        payload: { nin: '12345678901', consent: true },
      });

      expect(res.meta.cached).toBe(true);
      expect(billingService.getEffectiveRate).toHaveBeenCalledWith(mockOrgId, 'nin', true);
      expect(billingService.deductCredits).toHaveBeenCalledWith(
        mockOrgId,
        Environment.SANDBOX,
        20,
        expect.stringContaining('vx_cache_')
      );
      expect(mockProvider.verifyNin).not.toHaveBeenCalled();
      expect(logRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isCached: true, source: 'CACHE', upstreamProvider: 'verixa_smart_cache' })
      );
    });

    it('should deduct standard fee, call upstream provider, and cache result on Cache Miss', async () => {
      identityCacheService.getCachedRecord.mockResolvedValue(null);
      billingService.getEffectiveRate.mockResolvedValue({ effectiveRate: 75 }); // Standard rate

      const res = await controller.manualVerify(mockReq, {
        service: 'nin',
        environment: Environment.SANDBOX,
        payload: { nin: '12345678901', consent: true },
      });

      expect(res.meta.cached).toBe(false);
      expect(billingService.getEffectiveRate).toHaveBeenCalledWith(mockOrgId, 'nin', false);
      expect(billingService.deductCredits).toHaveBeenCalledWith(
        mockOrgId,
        Environment.SANDBOX,
        75,
        expect.any(String)
      );
      expect(mockProvider.verifyNin).toHaveBeenCalled();
      expect(identityCacheService.setCachedRecord).toHaveBeenCalled();
      expect(logRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isCached: false, source: 'LIVE' })
      );
    });

    it('should refund credits and throw InternalServerErrorException when upstream provider fails', async () => {
      identityCacheService.getCachedRecord.mockResolvedValue(null);
      mockProvider.verifyNin.mockRejectedValue(new Error('Upstream HTTP 502 Bad Gateway'));

      await expect(
        controller.manualVerify(mockReq, {
          service: 'nin',
          environment: Environment.SANDBOX,
          payload: { nin: '12345678901', consent: true },
        })
      ).rejects.toThrow(InternalServerErrorException);

      expect(billingService.refundCredits).toHaveBeenCalled();
    });
  });

  describe('getLogDetail', () => {
    it('should retrieve verification log and decrypt encrypted responsePayload', async () => {
      const storedIdentity = { bvn: '22233344455', firstName: 'Ade' };
      logRepository.findOne.mockResolvedValue({
        id: 'log-123',
        org_id: mockOrgId,
        serviceType: 'bvn',
        status: VerificationStatus.SUCCESS,
        environment: Environment.SANDBOX,
        responsePayload: encryptPayload(storedIdentity),
      });

      const res = await controller.getLogDetail({ organizationId: mockOrgId }, 'log-123');
      expect(res.id).toBe('log-123');
      expect(res.responsePayload).toEqual(storedIdentity);
    });

    it('should throw NotFoundException if verification log is not found', async () => {
      logRepository.findOne.mockResolvedValue(null);

      await expect(
        controller.getLogDetail({ organizationId: mockOrgId }, 'non-existent-log')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
