// Supported providers: "supabase" | "firebase" | "mongodb" | "mysql" | "mock"

export type DatabaseProvider = "supabase" | "firebase" | "mongodb" | "mysql" | "mock"

// Set this environment variable to change the database provider
// Default: "mongodb"
export const DB_PROVIDER: DatabaseProvider = (process.env.NEXT_PUBLIC_DB_PROVIDER as DatabaseProvider) || "mongodb"

export const isNextAuthProvider = DB_PROVIDER === "mongodb" || DB_PROVIDER === "mysql" || DB_PROVIDER === "mock"
export const isSupabaseProvider = DB_PROVIDER === "supabase"
export const isFirebaseProvider = DB_PROVIDER === "firebase"

export const dbConfig = {
  provider: DB_PROVIDER,
  isNextAuth: isNextAuthProvider,
  isSupabase: isSupabaseProvider,
  isFirebase: isFirebaseProvider,
}

export const DB_CONFIG = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || "vitamend",
  },
  mysql: {
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  mock: {},
}
