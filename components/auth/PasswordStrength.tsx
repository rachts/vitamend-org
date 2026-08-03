import React from 'react';

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, text: '', color: 'bg-[#F1F5F9]' };
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (score <= 2) return { score, text: 'Vulnerable', color: 'bg-[#EF4444]', textClass: 'text-[#DC2626]' };
    if (score <= 4) return { score, text: 'Moderate', color: 'bg-[#F59E0B]', textClass: 'text-[#D97706]' };
    return { score, text: 'Cryptographically Strong', color: 'bg-[#10B981]', textClass: 'text-[#065F46]' };
  };

  const { score, text, color, textClass } = getStrength(password);

  return (
    <div className="w-full space-y-1.5 mt-2 font-body select-none">
      <div className="flex justify-between items-center text-[12px]">
        <span className="text-[#64748B]">Key Entropy Rating:</span>
        <span className={`font-medium ${textClass || 'text-[#94A3B8]'}`}>
          {password ? text : 'Awaiting input'}
        </span>
      </div>
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`flex-1 rounded-sm transition-all duration-200 ${
              index <= score ? color : 'bg-[#E2E8F0]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
