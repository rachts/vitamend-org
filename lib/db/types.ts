export interface Donation {
  id: string
  medicine_name: string
  brand: string
  generic_name?: string | null
  dosage: string
  quantity: number
  expiry_date: string
  condition: string
  category: string
  donor_name: string
  donor_email: string
  donor_phone: string
  donor_address: string
  notes?: string | null
  image_urls: string[]
  status: "pending" | "verified" | "distributed" | "rejected"
  verified: boolean
  created_at: string
}

export interface DonationInput {
  medicineName: string
  brand: string
  genericName?: string
  dosage: string
  quantity: number
  expiryDate: string
  condition: string
  category: string
  donorName: string
  donorEmail: string
  donorPhone: string
  donorAddress: string
  notes?: string
  files?: File[]
}

export interface Medicine {
  id: string
  name: string
  brand: string
  generic_name?: string
  dosage: string
  quantity: number
  expiry_date: string
  category: string
  condition: string
  available: boolean
  verified: boolean
  image_urls: string[]
  created_at: string
}

export interface Volunteer {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
  date_of_birth?: string | null
  occupation?: string | null
  experience?: string | null
  availability?: string | null
  role?: string | null
  motivation?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  has_transport: boolean
  can_lift: boolean
  medical_conditions?: string | null
  references?: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export interface VolunteerInput {
  fullName: string
  email: string
  phone: string
  address: string
  dateOfBirth?: string
  occupation?: string
  experience?: string
  availability?: string
  role?: string
  motivation?: string
  emergencyContact?: string
  emergencyPhone?: string
  hasTransport?: boolean
  canLift?: boolean
  medicalConditions?: string
  references?: string
}

export interface Profile {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
  role: string
  created_at: string
}

export interface AuthUser {
  uid: string
  email: string | null
  name: string | null
  image: string | null
  role: string
}

export interface DbResult<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface InitResult {
  success: boolean
  message: string
  alreadyInitialized?: boolean
}

// Database adapter interface - all providers must implement this
export interface DatabaseAdapter {
  // Database initialization method
  initDatabase(): Promise<InitResult>

  // Donations
  submitDonation(data: DonationInput, imageUrls?: string[]): Promise<DbResult<{ id: string }>>
  getDonations(): Promise<Donation[]>
  getDonationById(id: string): Promise<Donation | null>
  updateDonationStatus(id: string, status: Donation["status"]): Promise<DbResult<void>>

  // Medicines
  getMedicines(): Promise<Medicine[]>
  getMedicineById(id: string): Promise<Medicine | null>

  // Volunteers
  submitVolunteer(data: VolunteerInput): Promise<DbResult<{ id: string }>>
  getVolunteers(): Promise<Volunteer[]>

  // Profiles
  getProfile(userId: string): Promise<Profile | null>
  upsertProfile(profile: Partial<Profile> & { id: string }): Promise<DbResult<void>>

  // Storage
  uploadImage(file: File, folder?: string): Promise<string | null>
  uploadMultipleImages(files: File[], folder?: string): Promise<string[]>
  deleteImage(imageUrl: string): Promise<boolean>
}
