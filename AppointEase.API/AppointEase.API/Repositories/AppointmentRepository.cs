using AppointEase.API.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment> GetByIdAsync(int id);
        Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId);
        Task<IEnumerable<Appointment>> GetByProviderIdAsync(int providerId);
        Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status);
        Task<Appointment> CreateAsync(Appointment appointment);
        Task<Appointment> UpdateStatusAsync(int id, AppointmentStatus status);
    }

    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly string _connectionString;

        public AppointmentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<Appointment> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    SELECT a.*, u1.FirstName + ' ' + u1.LastName AS CustomerName, 
                           p.CompanyName AS ProviderName, s.Name AS ServiceName, 
                           s.Category AS ServiceCategory, s.Duration
                    FROM Appointments a
                    JOIN Users u1 ON a.CustomerId = u1.Id
                    JOIN Providers p ON a.ProviderId = p.Id
                    JOIN Services s ON a.ServiceId = s.Id
                    WHERE a.Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapAppointment(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId)
        {
            var appointments = new List<Appointment>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    SELECT a.*, u1.FirstName + ' ' + u1.LastName AS CustomerName, 
                           p.CompanyName AS ProviderName, s.Name AS ServiceName, 
                           s.Category AS ServiceCategory, s.Duration
                    FROM Appointments a
                    JOIN Users u1 ON a.CustomerId = u1.Id
                    JOIN Providers p ON a.ProviderId = p.Id
                    JOIN Services s ON a.ServiceId = s.Id
                    WHERE a.CustomerId = @CustomerId
                    ORDER BY a.Date DESC";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@CustomerId", customerId);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            appointments.Add(MapAppointment(reader));
                        }
                    }
                }
            }
            
            return appointments;
        }

        public async Task<IEnumerable<Appointment>> GetByProviderIdAsync(int providerId)
        {
            var appointments = new List<Appointment>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    SELECT a.*, u1.FirstName + ' ' + u1.LastName AS CustomerName, 
                           p.CompanyName AS ProviderName, s.Name AS ServiceName, 
                           s.Category AS ServiceCategory, s.Duration
                    FROM Appointments a
                    JOIN Users u1 ON a.CustomerId = u1.Id
                    JOIN Providers p ON a.ProviderId = p.Id
                    JOIN Services s ON a.ServiceId = s.Id
                    WHERE a.ProviderId = @ProviderId
                    ORDER BY a.Date DESC";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@ProviderId", providerId);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            appointments.Add(MapAppointment(reader));
                        }
                    }
                }
            }
            
            return appointments;
        }

        public async Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status)
        {
            var appointments = new List<Appointment>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    SELECT a.*, u1.FirstName + ' ' + u1.LastName AS CustomerName, 
                           p.CompanyName AS ProviderName, s.Name AS ServiceName, 
                           s.Category AS ServiceCategory, s.Duration
                    FROM Appointments a
                    JOIN Users u1 ON a.CustomerId = u1.Id
                    JOIN Providers p ON a.ProviderId = p.Id
                    JOIN Services s ON a.ServiceId = s.Id
                    WHERE a.Status = @Status
                    ORDER BY a.Date DESC";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Status", status.ToString());
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            appointments.Add(MapAppointment(reader));
                        }
                    }
                }
            }
            
            return appointments;
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    INSERT INTO Appointments (CustomerId, ProviderId, ServiceId, EmployeeId, Date, Status, CreatedAt)
                    VALUES (@CustomerId, @ProviderId, @ServiceId, @EmployeeId, @Date, @Status, @CreatedAt);
                    SELECT SCOPE_IDENTITY();";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@CustomerId", appointment.CustomerId);
                    command.Parameters.AddWithValue("@ProviderId", appointment.ProviderId);
                    command.Parameters.AddWithValue("@ServiceId", appointment.ServiceId);
                    command.Parameters.AddWithValue("@EmployeeId", appointment.EmployeeId != null ? (object)appointment.EmployeeId : DBNull.Value);
                    command.Parameters.AddWithValue("@Date", appointment.Date);
                    command.Parameters.AddWithValue("@Status", appointment.Status.ToString());
                    command.Parameters.AddWithValue("@CreatedAt", appointment.CreatedAt);
                    
                    appointment.Id = Convert.ToInt32(await command.ExecuteScalarAsync());
                }
                
                // Get the full appointment details
                return await GetByIdAsync(appointment.Id);
            }
        }

        public async Task<Appointment> UpdateStatusAsync(int id, AppointmentStatus status)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    UPDATE Appointments
                    SET Status = @Status
                    WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@Status", status.ToString());
                    
                    await command.ExecuteNonQueryAsync();
                }
                
                // Get the updated appointment
                return await GetByIdAsync(id);
            }
        }

        private Appointment MapAppointment(SqlDataReader reader)
        {
            return new Appointment
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                ServiceId = reader.GetInt32(reader.GetOrdinal("ServiceId")),
                EmployeeId = reader.IsDBNull(reader.GetOrdinal("EmployeeId")) ? null : reader.GetInt32(reader.GetOrdinal("EmployeeId")),
                Date = reader.GetDateTime(reader.GetOrdinal("Date")),
                CustomerName = reader.GetString(reader.GetOrdinal("CustomerName")),
                ProviderName = reader.GetString(reader.GetOrdinal("ProviderName")),
                ServiceName = reader.GetString(reader.GetOrdinal("ServiceName")),
                ServiceCategory = (ServiceCategory)Enum.Parse(typeof(ServiceCategory), reader.GetString(reader.GetOrdinal("ServiceCategory"))),
                Duration = reader.GetInt32(reader.GetOrdinal("Duration")),
                Status = (AppointmentStatus)Enum.Parse(typeof(AppointmentStatus), reader.GetString(reader.GetOrdinal("Status"))),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };
        }
    }
}
