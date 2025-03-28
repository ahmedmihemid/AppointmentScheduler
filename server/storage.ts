import { 
  users, type User, type InsertUser, 
  services, type Service, type InsertService,
  providers, type Provider, type InsertProvider,
  employees, type Employee, type InsertEmployee,
  appointments, type Appointment, type InsertAppointment,
  ServiceCategory, AppointmentStatus, UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServicesByProvider(providerId: number): Promise<Service[]>;
  getServicesByCategory(category: ServiceCategory): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Provider operations
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByUserId(userId: number): Promise<Provider | undefined>;
  getProvidersByCategory(category: ServiceCategory): Promise<Provider[]>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<Provider>): Promise<Provider | undefined>;
  
  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeesByProvider(providerId: number): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByCustomer(customerId: number): Promise<Appointment[]>;
  getAppointmentsByProvider(providerId: number): Promise<Appointment[]>;
  getAppointmentsByStatus(status: AppointmentStatus): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private providers: Map<number, Provider>;
  private employees: Map<number, Employee>;
  private appointments: Map<number, Appointment>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private serviceIdCounter: number = 1;
  private providerIdCounter: number = 1;
  private employeeIdCounter: number = 1;
  private appointmentIdCounter: number = 1;
  
  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.providers = new Map();
    this.employees = new Map();
    this.appointments = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "adminpassword", // This will be hashed in auth.ts
      firstName: "System",
      lastName: "Administrator",
      email: "admin@appointease.com",
      role: UserRole.ADMIN,
      phone: "",
      city: ""
    });
  }
  
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt, isActive: true };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Service Methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.providerId === providerId && service.isActive
    );
  }
  
  async getServicesByCategory(category: ServiceCategory): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.category === category && service.isActive
    );
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const createdAt = new Date();
    const service: Service = { ...insertService, id, createdAt, isActive: true };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, updateData: Partial<Service>): Promise<Service | undefined> {
    const service = await this.getService(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updateData };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    const service = await this.getService(id);
    if (!service) return false;
    
    // Soft delete by setting isActive to false
    service.isActive = false;
    this.services.set(id, service);
    return true;
  }
  
  // Provider Methods
  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }
  
  async getProviderByUserId(userId: number): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(
      (provider) => provider.userId === userId
    );
  }
  
  async getProvidersByCategory(category: ServiceCategory): Promise<Provider[]> {
    return Array.from(this.providers.values()).filter(
      (provider) => provider.category === category
    );
  }
  
  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = this.providerIdCounter++;
    const provider: Provider = { ...insertProvider, id, isVerified: false };
    this.providers.set(id, provider);
    return provider;
  }
  
  async updateProvider(id: number, updateData: Partial<Provider>): Promise<Provider | undefined> {
    const provider = await this.getProvider(id);
    if (!provider) return undefined;
    
    const updatedProvider = { ...provider, ...updateData };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }
  
  // Employee Methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }
  
  async getEmployeesByProvider(providerId: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(
      (employee) => employee.providerId === providerId && employee.isActive
    );
  }
  
  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const employee: Employee = { ...insertEmployee, id, isActive: true };
    this.employees.set(id, employee);
    return employee;
  }
  
  async updateEmployee(id: number, updateData: Partial<Employee>): Promise<Employee | undefined> {
    const employee = await this.getEmployee(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...updateData };
    this.employees.set(id, updatedEmployee);
    
    // Update related appointments if employee is updated
    this.updateAppointmentsForEmployee(id, updatedEmployee);
    
    return updatedEmployee;
  }
  
  async deleteEmployee(id: number): Promise<boolean> {
    const employee = await this.getEmployee(id);
    if (!employee) return false;
    
    // Soft delete by setting isActive to false
    employee.isActive = false;
    this.employees.set(id, employee);
    return true;
  }
  
  // Helper to update appointments when employee info changes
  private async updateAppointmentsForEmployee(employeeId: number, updatedEmployee: Employee): Promise<void> {
    const employeeAppointments = Array.from(this.appointments.values()).filter(
      (appointment) => appointment.employeeId === employeeId
    );
    
    // Update each appointment as needed
    for (const appointment of employeeAppointments) {
      // Any appointment-specific updates based on employee changes
      this.appointments.set(appointment.id, appointment);
    }
  }
  
  // Appointment Methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByCustomer(customerId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.customerId === customerId
    );
  }
  
  async getAppointmentsByProvider(providerId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.providerId === providerId
    );
  }
  
  async getAppointmentsByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.status === status
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const createdAt = new Date();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      createdAt, 
      status: AppointmentStatus.PENDING 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    appointment.status = status;
    this.appointments.set(id, appointment);
    return appointment;
  }
}

export const storage = new MemStorage();
