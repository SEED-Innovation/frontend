import { z } from 'zod';

// Saudi phone number validation
const SAUDI_PHONE_REGEX = /^\+9665\d{8}$/;

// Password complexity requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const createAdminSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .trim(),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim()
    .toLowerCase(),
  
  phone: z.string()
    .regex(SAUDI_PHONE_REGEX, 'Phone must be in format +9665XXXXXXXX')
    .optional()
    .or(z.literal('')),
  
  password: z.string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(
      PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(
      PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  
  confirmPassword: z.string(),
  
  returnPlainPassword: z.boolean().default(false),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
