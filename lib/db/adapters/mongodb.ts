// MongoDB Adapter - Server-side implementation
import type {
  DatabaseAdapter,
  Donation,
  DonationInput,
  Medicine,
  Volunteer,
  VolunteerInput,
  Profile,
  DbResult,
  InitResult,
} from "../types"

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ""}/api`

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API call failed: ${response.statusText}`)
  }

  return response.json()
}

export const mongodbAdapter: DatabaseAdapter = {
  async initDatabase(): Promise<InitResult> {
    try {
      return await apiCall<InitResult>("/init", { method: "POST" })
    } catch (error: unknown) {
      return {
        success: false,
        message: `Failed to initialize MongoDB: ${(error as Error).message}`,
      }
    }
  },

  // Donations
  async submitDonation(data: DonationInput, imageUrls: string[] = []): Promise<DbResult<{ id: string }>> {
    try {
      return await apiCall<DbResult<{ id: string }>>("/donations", {
        method: "POST",
        body: JSON.stringify({ ...data, imageUrls }),
      })
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message }
    }
  },

  async getDonations(): Promise<Donation[]> {
    try {
      const res = await apiCall<{ data: Donation[] }>("/donations")
      return res.data || []
    } catch {
      return []
    }
  },

  async getDonationById(id: string): Promise<Donation | null> {
    try {
      const res = await apiCall<{ data: Donation }>(`/donations/${id}`)
      return res.data || null
    } catch {
      return null
    }
  },

  async updateDonationStatus(id: string, status: Donation["status"]): Promise<DbResult<void>> {
    try {
      await apiCall(`/donations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message }
    }
  },

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    try {
      const res = await apiCall<{ data: Medicine[] }>("/medicines")
      return res.data || []
    } catch {
      return []
    }
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const res = await apiCall<{ data: Medicine }>(`/medicines/${id}`)
      return res.data || null
    } catch {
      return null
    }
  },

  // Volunteers
  async submitVolunteer(data: VolunteerInput): Promise<DbResult<{ id: string }>> {
    try {
      return await apiCall<DbResult<{ id: string }>>("/volunteers", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message }
    }
  },

  async getVolunteers(): Promise<Volunteer[]> {
    try {
      const res = await apiCall<{ data: Volunteer[] }>("/volunteers")
      return res.data || []
    } catch {
      return []
    }
  },

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const res = await apiCall<{ data: Profile }>(`/profiles/${userId}`)
      return res.data || null
    } catch {
      return null
    }
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<DbResult<void>> {
    try {
      await apiCall(`/profiles/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify(profile),
      })
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: (error as Error).message }
    }
  },

  // Storage - MongoDB typically uses GridFS or external storage
  async uploadImage(): Promise<string | null> {
    return null // Implement via API route if needed
  },

  async uploadMultipleImages(): Promise<string[]> {
    return []
  },

  async deleteImage(): Promise<boolean> {
    return false
  },
}
