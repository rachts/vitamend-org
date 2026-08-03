"use client"
import { useState, useEffect, useCallback } from "react"
import { getDb, type DatabaseAdapter, type Donation, type Medicine, type Volunteer } from "./index"

// Hook to get the database adapter
export function useDb() {
  const [db, setDb] = useState<DatabaseAdapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDb()
      .then(setDb)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return { db, loading, error }
}

// Hook for donations
export function useDonations() {
  const { db, loading: dbLoading, error: dbError } = useDb()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = useCallback(async () => {
    if (!db) return
    setLoading(true)
    try {
      const data = await db.getDonations()
      setDonations(data)
      setError(null)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [db])

  useEffect(() => {
    if (db) fetchDonations()
  }, [db, fetchDonations])

  return {
    donations,
    loading: dbLoading || loading,
    error: dbError || error,
    refetch: fetchDonations,
  }
}

// Hook for medicines
export function useMedicines() {
  const { db, loading: dbLoading, error: dbError } = useDb()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicines = useCallback(async () => {
    if (!db) return
    setLoading(true)
    try {
      const data = await db.getMedicines()
      setMedicines(data)
      setError(null)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [db])

  useEffect(() => {
    if (db) fetchMedicines()
  }, [db, fetchMedicines])

  return {
    medicines,
    loading: dbLoading || loading,
    error: dbError || error,
    refetch: fetchMedicines,
  }
}

// Hook for volunteers
export function useVolunteers() {
  const { db, loading: dbLoading, error: dbError } = useDb()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVolunteers = useCallback(async () => {
    if (!db) return
    setLoading(true)
    try {
      const data = await db.getVolunteers()
      setVolunteers(data)
      setError(null)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [db])

  useEffect(() => {
    if (db) fetchVolunteers()
  }, [db, fetchVolunteers])

  return {
    volunteers,
    loading: dbLoading || loading,
    error: dbError || error,
    refetch: fetchVolunteers,
  }
}
