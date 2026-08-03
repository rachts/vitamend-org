import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runVerificationPipeline } from '../lib/ai-verification-engine';

// Mock models and notifications
vi.mock('@/models/Medicine', () => ({
  Medicine: {
    findById: vi.fn(),
    countDocuments: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
  MedicineStatus: ['pending', 'approved', 'rejected', 'under_review', 'distributed', 'expired']
}));

vi.mock('@/models/VerificationLog', () => ({
  VerificationLog: {
    create: vi.fn(),
  }
}));

vi.mock('@/models/Inventory', () => ({
  Inventory: {
    findOne: vi.fn(),
    create: vi.fn(),
  }
}));

vi.mock('../lib/notifications', () => ({
  notifyReviewers: vi.fn(),
}));

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

// Mock Gemini
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      };
    }),
  };
});

describe('runVerificationPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  it('should handle a successful verification where the medicine is approved', async () => {
    // We mock the DB fetching
    const { Medicine } = await import('@/models/Medicine');
    const mockSave = vi.fn();
    const mockMedicine = {
      _id: '123',
      name: 'Amoxicillin',
      save: mockSave,
    };
    (Medicine.findById as any).mockResolvedValue(mockMedicine);
    (Medicine.countDocuments as any).mockResolvedValue(0);

    // Mock Gemini Responses
    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            name: "Amoxicillin",
            manufacturer: "Sun Pharma",
            expiryDate: "2030-01-01",
            confidence: 95
          })
        }
      })
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            isTampered: false,
            tamperConfidence: 99,
            isRecalled: false,
            recallReason: null,
            aiReasoning: "Looks safe."
          })
        }
      });

    const result = await runVerificationPipeline('123', [{ data: 'base64', mimeType: 'image/jpeg' }]);
    
    expect(result.success).toBe(true);
    expect(result.decision).toBe('approved');
    expect(mockSave).toHaveBeenCalled();
  });

  it('should reject if medicine is expired', async () => {
    const { Medicine } = await import('@/models/Medicine');
    const mockSave = vi.fn();
    (Medicine.findById as any).mockResolvedValue({
      _id: '123',
      name: 'Amoxicillin',
      save: mockSave,
    });
    (Medicine.countDocuments as any).mockResolvedValue(0);

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            name: "Amoxicillin",
            expiryDate: "2020-01-01", // EXPIRED!
            confidence: 90
          })
        }
      })
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            isTampered: false,
            tamperConfidence: 99,
            isRecalled: false,
            recallReason: null,
            aiReasoning: "Safe from tampering."
          })
        }
      });

    const result = await runVerificationPipeline('123', [{ data: 'base64', mimeType: 'image/jpeg' }]);
    
    expect(result.success).toBe(true);
    expect(result.decision).toBe('rejected');
  });

  it('should mark for under_review if confidence is low', async () => {
    const { Medicine } = await import('@/models/Medicine');
    const mockSave = vi.fn();
    (Medicine.findById as any).mockResolvedValue({
      _id: '123',
      name: 'Amoxicillin',
      save: mockSave,
    });
    (Medicine.countDocuments as any).mockResolvedValue(0);

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            name: "Amoxicillin",
            expiryDate: "2030-01-01",
            confidence: 60 // LOW CONFIDENCE!
          })
        }
      })
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            isTampered: false,
            tamperConfidence: 99,
            isRecalled: false,
            recallReason: null,
            aiReasoning: "Safe from tampering."
          })
        }
      });

    const result = await runVerificationPipeline('123', [{ data: 'base64', mimeType: 'image/jpeg' }]);
    
    expect(result.success).toBe(true);
    expect(result.decision).toBe('under_review');
  });
});
