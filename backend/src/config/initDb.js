/**
 * initDb.js — Database Schema Initializer
 * ==========================================
 * Runs at server startup to create all necessary PostgreSQL tables
 * if they don't already exist.
 *
 * Using "CREATE TABLE IF NOT EXISTS" makes this operation safe to run
 * on every boot — it won't overwrite or duplicate existing data.
 *
 * Tables created:
 *  1. users          — Authentication & role management
 *  2. travel_packages — Tour packages (Staff/Admin manage, Customers view)
 *  3. bookings       — Links customers to packages with status tracking
 *  4. inquiries      — Customer queries sent to the administration
 *
 * Run order matters: tables with foreign keys must be created AFTER
 * the tables they reference.
 */

const { pool } = require("./db");

const initializeDatabase = async () => {
  // Wrap all CREATE TABLE statements in a transaction so they all
  // succeed together or all roll back together on failure.
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ------------------------------------------------------------------
    // 1. USERS TABLE
    // ------------------------------------------------------------------
    // Stores all user accounts regardless of role.
    // The `role` column enforces the 3-tier access model:
    //   - 'customer'  → can browse packages and make bookings
    //   - 'staff'     → can manage packages and update booking statuses
    //   - 'admin'     → full access, including user and inquiry management
    // ------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                  SERIAL PRIMARY KEY,
        full_name           VARCHAR(100)        NOT NULL,
        email               VARCHAR(255)        NOT NULL UNIQUE,
        password_hash       TEXT                NOT NULL,
        role                VARCHAR(20)         NOT NULL DEFAULT 'customer'
                              CHECK (role IN ('customer', 'staff', 'admin')),
        phone_number        VARCHAR(30),
        profile_picture_url TEXT,
        is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
        created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // ------------------------------------------------------------------
    // 2. TRAVEL PACKAGES TABLE
    // ------------------------------------------------------------------
    // Represents a bookable travel package offered by GlobeTrek.
    //
    // `activities`  — Stored as a PostgreSQL TEXT ARRAY (e.g., {"Hiking","Safari"})
    // `images`      — Array of external image URLs (e.g., from Cloudinary)
    // `created_by`  — FK to the staff/admin who created the package
    // `is_active`   — Soft-delete flag; false hides from customer listings
    // ------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS travel_packages (
        id                  SERIAL PRIMARY KEY,
        name                VARCHAR(200)        NOT NULL,
        destination         VARCHAR(150)        NOT NULL,
        description         TEXT                NOT NULL,
        activities          TEXT[]              NOT NULL DEFAULT '{}',
        price_per_person    NUMERIC(10, 2)      NOT NULL CHECK (price_per_person > 0),
        discounted_price    NUMERIC(10, 2)      CHECK (discounted_price > 0),
        cover_image_url     TEXT,
        images              TEXT[]              NOT NULL DEFAULT '{}',
        duration_days       SMALLINT            NOT NULL CHECK (duration_days > 0),
        max_group_size      SMALLINT            NOT NULL CHECK (max_group_size > 0),
        difficulty          VARCHAR(20)         NOT NULL DEFAULT 'easy'
                              CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
        is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
        created_by          INTEGER             REFERENCES users(id) ON DELETE SET NULL,
        created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // ------------------------------------------------------------------
    // 3. BOOKINGS TABLE
    // ------------------------------------------------------------------
    // Records a customer's reservation for a specific travel package.
    //
    // `price_paid`      — Snapshot of the price at booking time. This prevents
    //                     price changes from affecting past bookings.
    // `customizations`  — Free-text field for the customer's special requests
    //                     or travel plan modifications (e.g., dietary needs).
    // `status`          — Booking lifecycle: pending → confirmed → completed
    //                     (or cancelled at any point by staff/admin)
    // `payment_status`  — Tracks whether payment has been collected
    // ------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id                      SERIAL PRIMARY KEY,
        package_id              INTEGER             NOT NULL
                                  REFERENCES travel_packages(id) ON DELETE RESTRICT,
        customer_id             INTEGER             NOT NULL
                                  REFERENCES users(id) ON DELETE RESTRICT,
        number_of_participants  SMALLINT            NOT NULL CHECK (number_of_participants >= 1),
        price_paid              NUMERIC(10, 2)      NOT NULL CHECK (price_paid > 0),
        tour_start_date         DATE                NOT NULL,
        status                  VARCHAR(20)         NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        payment_status          VARCHAR(20)         NOT NULL DEFAULT 'unpaid'
                                  CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
        payment_reference       VARCHAR(100),
        customizations          TEXT,
        created_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
        updated_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // ------------------------------------------------------------------
    // 4. INQUIRIES TABLE
    // ------------------------------------------------------------------
    // Stores customer-submitted questions and messages to the admin team.
    // Guests (non-registered users) can also submit inquiries.
    //
    // `user_id`       — Optional FK; set if the inquiry came from a logged-in user
    // `assigned_to`   — FK to the staff/admin member handling this inquiry
    // `response`      — Staff's reply text, stored when inquiry is resolved
    // `status`        — Workflow states: new → in_progress → resolved → closed
    // ------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id                SERIAL PRIMARY KEY,
        customer_name     VARCHAR(100)        NOT NULL,
        customer_email    VARCHAR(255)        NOT NULL,
        customer_phone    VARCHAR(30),
        subject           VARCHAR(200)        NOT NULL,
        message           TEXT                NOT NULL,
        status            VARCHAR(20)         NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
        user_id           INTEGER             REFERENCES users(id) ON DELETE SET NULL,
        assigned_to       INTEGER             REFERENCES users(id) ON DELETE SET NULL,
        response          TEXT,
        created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // ------------------------------------------------------------------
    // INDEXES — Speed up common query patterns
    // ------------------------------------------------------------------
    // Index on email for fast login lookups (email is also UNIQUE so this
    // index already exists implicitly, but naming it makes it explicit)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
        ON users(email);
    `);

    // Index for fetching all active packages (the most common customer query)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_packages_active
        ON travel_packages(is_active);
    `);

    // Index for fetching all bookings belonging to a specific customer
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_customer
        ON bookings(customer_id);
    `);

    // Index for fetching all inquiries by their workflow status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inquiries_status
        ON inquiries(status);
    `);

    await client.query("COMMIT");
    console.log("✅ Database schema initialized (all tables and indexes are ready).");
  } catch (error) {
    // If anything fails, roll back all changes to keep the DB in a clean state
    await client.query("ROLLBACK");
    console.error("❌ Database schema initialization failed:", error.message);
    throw error; // Re-throw so server.js can catch and exit
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

module.exports = initializeDatabase;
