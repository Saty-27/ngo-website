import { storage } from "./storage";

/**
 * Creates a default admin user if it doesn't already exist
 */
export async function createDefaultAdmin() {
  try {
    // Check if the new admin user already exists
    const existingAdmin = await storage.getUserByUsername("ngoadmin");
    
    if (!existingAdmin) {
      console.log("Creating default admin user...");
      
      // Create the new admin user
      const adminUser = await storage.createUser({
        username: "ngoadmin",
        password: "ngoadmin234",
        email: "admin@ngowebsite.org",
        name: "NGO Website Admin",
        role: "admin"
      });
      
      console.log(`Default admin user created with ID: ${adminUser.id}`);
    } else {
      console.log("Default admin user already exists");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
}