
import { db } from "./db.js";
import { sql } from "drizzle-orm";

export async function initializeNgoTables() {
  console.log("Initializing NGO tables...");
  
  try {
    // Create ngos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ngos (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        registration_number TEXT NOT NULL UNIQUE,
        registration_certificate TEXT,
        website TEXT,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        alternate_phone TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'India',
        pincode TEXT NOT NULL,
        authorized_person_name TEXT,
        authorized_person_designation TEXT,
        authorized_person_phone TEXT,
        authorized_person_email TEXT,
        account_holder_name TEXT,
        bank_name TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        branch_name TEXT,
        upi_id TEXT,
        qr_code TEXT,
        about TEXT,
        mission TEXT,
        vision TEXT,
        established_year INTEGER,
        total_volunteers INTEGER,
        total_beneficiaries INTEGER,
        facebook TEXT,
        twitter TEXT,
        instagram TEXT,
        youtube TEXT,
        linkedin TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ ngos table created");
    
    // Create ngo_users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ngo_users (
        id SERIAL PRIMARY KEY,
        ngo_id INTEGER NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        designation TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'ngo_admin',
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ ngo_users table created");
    
    // Create ngo_campaigns table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ngo_campaigns (
        id SERIAL PRIMARY KEY,
        ngo_id INTEGER NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        short_description TEXT,
        description TEXT,
        goal_amount INTEGER NOT NULL,
        raised_amount INTEGER DEFAULT 0 NOT NULL,
        cover_image TEXT NOT NULL,
        gallery_images JSON,
        category TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        beneficiary_details TEXT,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        admin_remarks TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ ngo_campaigns table created");
    
    // Create ngo_donation_amount_cards table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ngo_donation_amount_cards (
        id SERIAL PRIMARY KEY,
        ngo_campaign_id INTEGER NOT NULL REFERENCES ngo_campaigns(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        label TEXT,
        display_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ ngo_donation_amount_cards table created");

    // Create about_sections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS about_sections (
        id SERIAL PRIMARY KEY,
        section_number INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        icon TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ about_sections table created");

    // Create contact_info table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        location_embed TEXT,
        visiting_hours_office TEXT,
        visiting_hours_saturday TEXT,
        visiting_hours_sunday TEXT,
        visiting_hours_special TEXT,
        getting_here_train TEXT,
        getting_here_bus TEXT,
        getting_here_taxi TEXT,
        getting_here_car TEXT,
        getting_here_airport TEXT,
        guidelines TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ contact_info table created");

    // Create contact_messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        query TEXT,
        about_section_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ contact_messages table created");
    
    console.log("All tables initialized successfully!");
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
}
