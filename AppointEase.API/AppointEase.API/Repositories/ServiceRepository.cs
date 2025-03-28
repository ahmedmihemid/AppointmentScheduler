using AppointEase.API.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly string _connectionString;

        public ServiceRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<Service> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Services WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapService(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            var services = new List<Service>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Services WHERE IsActive = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            services.Add(MapService(reader));
                        }
                    }
                }
            }
            
            return services;
        }

        public async Task<IEnumerable<Service>> GetByProviderAsync(int providerId)
        {
            var services = new List<Service>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Services WHERE ProviderId = @ProviderId AND IsActive = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@ProviderId", providerId);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            services.Add(MapService(reader));
                        }
                    }
                }
            }
            
            return services;
        }

        public async Task<IEnumerable<Service>> GetByCategoryAsync(ServiceCategory category)
        {
            var services = new List<Service>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Services WHERE Category = @Category AND IsActive = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Category", category.ToString());
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            services.Add(MapService(reader));
                        }
                    }
                }
            }
            
            return services;
        }

        public async Task<Service> CreateAsync(Service service)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    INSERT INTO Services (ProviderId, Name, Description, Category, Duration, Price, IsActive, CreatedAt)
                    VALUES (@ProviderId, @Name, @Description, @Category, @Duration, @Price, @IsActive, @CreatedAt);
                    SELECT SCOPE_IDENTITY();";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@ProviderId", service.ProviderId);
                    command.Parameters.AddWithValue("@Name", service.Name);
                    command.Parameters.AddWithValue("@Description", string.IsNullOrEmpty(service.Description) ? DBNull.Value : (object)service.Description);
                    command.Parameters.AddWithValue("@Category", service.Category.ToString());
                    command.Parameters.AddWithValue("@Duration", service.Duration);
                    command.Parameters.AddWithValue("@Price", service.Price);
                    command.Parameters.AddWithValue("@IsActive", service.IsActive);
                    command.Parameters.AddWithValue("@CreatedAt", service.CreatedAt);
                    
                    service.Id = Convert.ToInt32(await command.ExecuteScalarAsync());
                }
            }
            
            return service;
        }

        public async Task<Service> UpdateAsync(int id, Service service)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    UPDATE Services
                    SET Name = @Name,
                        Description = @Description,
                        Category = @Category,
                        Duration = @Duration,
                        Price = @Price,
                        IsActive = @IsActive
                    WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@Name", service.Name);
                    command.Parameters.AddWithValue("@Description", string.IsNullOrEmpty(service.Description) ? DBNull.Value : (object)service.Description);
                    command.Parameters.AddWithValue("@Category", service.Category.ToString());
                    command.Parameters.AddWithValue("@Duration", service.Duration);
                    command.Parameters.AddWithValue("@Price", service.Price);
                    command.Parameters.AddWithValue("@IsActive", service.IsActive);
                    
                    await command.ExecuteNonQueryAsync();
                }
                
                return await GetByIdAsync(id);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                // Soft delete by setting IsActive to false
                const string sql = @"UPDATE Services SET IsActive = 0 WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        private Service MapService(SqlDataReader reader)
        {
            return new Service
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                Category = (ServiceCategory)Enum.Parse(typeof(ServiceCategory), reader.GetString(reader.GetOrdinal("Category"))),
                Duration = reader.GetInt32(reader.GetOrdinal("Duration")),
                Price = reader.GetInt32(reader.GetOrdinal("Price")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };
        }
    }
}