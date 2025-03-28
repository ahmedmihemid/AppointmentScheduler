import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertServiceSchema, 
  insertEmployeeSchema, 
  insertAppointmentSchema,
  AppointmentStatus,
  ServiceCategory,
  UserRole
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // === User routes ===
  
  // Get current user profile
  app.get("/api/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Update user profile
  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
      });
      
      const validData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, validData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // === Service routes ===
  
  // Get all services by category
  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const category = req.params.category as ServiceCategory;
      const services = await storage.getServicesByCategory(category);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get services by provider
  app.get("/api/services/provider/:providerId", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const services = await storage.getServicesByProvider(providerId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new service (for providers)
  app.post("/api/services", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== UserRole.PROVIDER && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const validData = insertServiceSchema.parse(req.body);
      
      // If provider, ensure they can only add services for themselves
      if (req.user.role === UserRole.PROVIDER) {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || provider.id !== validData.providerId) {
          return res.status(403).json({ message: "You can only add services for your own business" });
        }
      }
      
      const service = await storage.createService(validData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update a service
  app.patch("/api/services/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== UserRole.PROVIDER && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const serviceId = parseInt(req.params.id);
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // If provider, ensure they can only update their own services
      if (req.user.role === UserRole.PROVIDER) {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || provider.id !== service.providerId) {
          return res.status(403).json({ message: "You can only update your own services" });
        }
      }
      
      const updateSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        duration: z.number().optional(),
        price: z.number().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      });
      
      const validData = updateSchema.parse(req.body);
      const updatedService = await storage.updateService(serviceId, validData);
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Delete a service (soft delete)
  app.delete("/api/services/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== UserRole.PROVIDER && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const serviceId = parseInt(req.params.id);
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // If provider, ensure they can only delete their own services
      if (req.user.role === UserRole.PROVIDER) {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || provider.id !== service.providerId) {
          return res.status(403).json({ message: "You can only delete your own services" });
        }
      }
      
      const result = await storage.deleteService(serviceId);
      
      if (result) {
        res.status(200).json({ message: "Service deleted successfully" });
      } else {
        res.status(404).json({ message: "Service not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // === Provider routes ===
  
  // Get providers by category
  app.get("/api/providers/category/:category", async (req, res) => {
    try {
      const category = req.params.category as ServiceCategory;
      const providers = await storage.getProvidersByCategory(category);
      
      // Get the full user info for each provider
      const providersWithDetails = await Promise.all(providers.map(async (provider) => {
        const user = await storage.getUser(provider.userId);
        return {
          ...provider,
          userInfo: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profilePicture: user.profilePicture,
            city: user.city,
          } : null
        };
      }));
      
      res.json(providersWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update provider info
  app.patch("/api/providers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const providerId = parseInt(req.params.id);
      const provider = await storage.getProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Check if the user is the provider or an admin
      if (req.user.role === UserRole.PROVIDER) {
        if (provider.userId !== req.user.id) {
          return res.status(403).json({ message: "You can only update your own provider info" });
        }
      } else if (req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateSchema = z.object({
        companyName: z.string().optional(),
        address: z.string().optional(),
        category: z.string().optional(),
        workingHours: z.any().optional(),
      });
      
      const validData = updateSchema.parse(req.body);
      const updatedProvider = await storage.updateProvider(providerId, validData);
      
      res.json(updatedProvider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // === Employee routes ===
  
  // Get employees for a provider
  app.get("/api/employees/provider/:providerId", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const employees = await storage.getEmployeesByProvider(providerId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new employee (admin only)
  app.post("/api/employees", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied. Only administrators can manage employees." });
    }
    
    try {
      const validData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update an employee (admin only)
  app.patch("/api/employees/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied. Only administrators can manage employees." });
    }
    
    try {
      const employeeId = parseInt(req.params.id);
      const employee = await storage.getEmployee(employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        workingHours: z.any().optional(),
        isActive: z.boolean().optional(),
      });
      
      const validData = updateSchema.parse(req.body);
      const updatedEmployee = await storage.updateEmployee(employeeId, validData);
      
      res.json(updatedEmployee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Delete an employee (admin only)
  app.delete("/api/employees/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied. Only administrators can manage employees." });
    }
    
    try {
      const employeeId = parseInt(req.params.id);
      const result = await storage.deleteEmployee(employeeId);
      
      if (result) {
        res.status(200).json({ message: "Employee deleted successfully" });
      } else {
        res.status(404).json({ message: "Employee not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // === Appointment routes ===
  
  // Get appointments for the current user
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      let appointments = [];
      
      if (req.user.role === UserRole.CUSTOMER) {
        appointments = await storage.getAppointmentsByCustomer(req.user.id);
      } else if (req.user.role === UserRole.PROVIDER) {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (provider) {
          appointments = await storage.getAppointmentsByProvider(provider.id);
        }
      } else if (req.user.role === UserRole.ADMIN) {
        // Admins can see all appointments, but we'll limit it for now
        const pendingAppts = await storage.getAppointmentsByStatus(AppointmentStatus.PENDING);
        const confirmedAppts = await storage.getAppointmentsByStatus(AppointmentStatus.CONFIRMED);
        appointments = [...pendingAppts, ...confirmedAppts];
      }
      
      // Enrich appointments with service and provider details
      const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
        const service = await storage.getService(appointment.serviceId);
        const customer = await storage.getUser(appointment.customerId);
        let employee = null;
        
        if (appointment.employeeId) {
          employee = await storage.getEmployee(appointment.employeeId);
        }
        
        return {
          ...appointment,
          serviceName: service?.name,
          serviceCategory: service?.category,
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : null
        };
      }));
      
      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Book a new appointment
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Customers can only book appointments for themselves
      if (req.user.role === UserRole.CUSTOMER) {
        if (req.body.customerId !== req.user.id) {
          return res.status(403).json({ message: "You can only book appointments for yourself" });
        }
      }
      
      const validData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validData);
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update appointment status
  app.patch("/api/appointments/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const statusSchema = z.object({
        status: z.enum([
          AppointmentStatus.PENDING,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.CANCELED
        ])
      });
      
      const { status } = statusSchema.parse(req.body);
      
      // Check permissions
      if (req.user.role === UserRole.CUSTOMER) {
        // Customers can only cancel their own appointments
        if (appointment.customerId !== req.user.id) {
          return res.status(403).json({ message: "You can only update your own appointments" });
        }
        
        // Customers can only cancel appointments, not confirm them
        if (status !== AppointmentStatus.CANCELED) {
          return res.status(403).json({ message: "Customers can only cancel appointments" });
        }
      } else if (req.user.role === UserRole.PROVIDER) {
        // Providers can only update appointments for their services
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || provider.id !== appointment.providerId) {
          return res.status(403).json({ message: "You can only update appointments for your services" });
        }
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, status);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
