import mysql from "mysql2/promise"

// cPanel MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "cpanel_user",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "cpanel_database",
  charset: "utf8mb4",
  timezone: "+00:00",
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // cPanel specific settings
  ssl: false, // Usually disabled in cPanel
  multipleStatements: false, // Security best practice
}

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 5, // Lower limit for shared hosting
  queueLimit: 0,
  idleTimeout: 300000, // 5 minutes
  acquireTimeout: 60000,
})

// Test connection function with better error handling
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log("✅ cPanel MySQL connection successful")
    return true
  } catch (error: any) {
    console.error("❌ cPanel MySQL connection failed:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      host: dbConfig.host,
      database: dbConfig.database,
    })
    return false
  }
}

// Execute query function with better error handling
export async function executeQuery(query: string, params: any[] = []) {
  let connection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error: any) {
    console.error("Database query error:", {
      message: error.message,
      code: error.code,
      query: query.substring(0, 100) + "...",
    })
    throw new Error(`Database error: ${error.message}`)
  } finally {
    if (connection) connection.release()
  }
}

// Get single record
export async function getOne(query: string, params: any[] = []) {
  try {
    const results = (await executeQuery(query, params)) as any[]
    return results[0] || null
  } catch (error) {
    console.error("Database getOne error:", error)
    throw error
  }
}

// Get multiple records
export async function getMany(query: string, params: any[] = []) {
  try {
    const results = await executeQuery(query, params)
    return results as any[]
  } catch (error) {
    console.error("Database getMany error:", error)
    throw error
  }
}

// Insert record and return inserted ID
export async function insertOne(query: string, params: any[] = []) {
  try {
    const result = (await executeQuery(query, params)) as any
    return result.insertId
  } catch (error) {
    console.error("Database insert error:", error)
    throw error
  }
}

// Update records and return affected rows
export async function updateMany(query: string, params: any[] = []) {
  try {
    const result = (await executeQuery(query, params)) as any
    return result.affectedRows
  } catch (error) {
    console.error("Database update error:", error)
    throw error
  }
}

// Delete records and return affected rows
export async function deleteMany(query: string, params: any[] = []) {
  try {
    const result = (await executeQuery(query, params)) as any
    return result.affectedRows
  } catch (error) {
    console.error("Database delete error:", error)
    throw error
  }
}

// Transaction support (simplified for cPanel)
export async function transaction(callback: (connection: any) => Promise<any>) {
  let connection
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError)
      }
    }
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// Health check function for cPanel
export async function healthCheck() {
  try {
    const result = await getOne("SELECT 1 as health")
    return result?.health === 1
  } catch (error) {
    console.error("Health check failed:", error)
    return false
  }
}

export default pool
