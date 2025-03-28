import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Roles
export enum UserRole {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  ADMIN = 'admin'
}

// Service Categories
export enum ServiceCategory {
  HEALTHCARE = 'Healthcare',
  SPORTS = 'Sports',
  PERSONAL_CARE = 'Personal Care'
}

// Appointment Status
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled'
}

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default('customer'),
  profilePicture: text("profile_picture"),
  dateOfBirth: timestamp("date_of_birth"),
  city: text("city"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services Table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price"), // stored in cents
  category: text("category").notNull(),
  providerId: integer("provider_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Providers Table (extends users with provider-specific info)
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  companyName: text("company_name"),
  address: text("address"),
  category: text("category").notNull(),
  workingHours: json("working_hours"),
  isVerified: boolean("is_verified").default(false),
});

// Employees Table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  department: text("department").notNull(),
  position: text("position").notNull(),
  providerId: integer("provider_id").notNull(),
  workingHours: json("working_hours"),
  isActive: boolean("is_active").default(true),
});

// Appointments Table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  serviceId: integer("service_id").notNull(),
  employeeId: integer("employee_id"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default('pending'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas for Validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  city: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  duration: true,
  price: true,
  category: true,
  providerId: true,
});

export const insertProviderSchema = createInsertSchema(providers).pick({
  userId: true,
  companyName: true,
  address: true,
  category: true,
  workingHours: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  department: true,
  position: true,
  providerId: true,
  workingHours: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  customerId: true,
  providerId: true,
  serviceId: true,
  employeeId: true,
  date: true,
  duration: true,
  notes: true,
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
