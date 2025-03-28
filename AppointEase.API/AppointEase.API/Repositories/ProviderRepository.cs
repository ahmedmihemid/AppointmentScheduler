using AppointEase.API.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public class ProviderRepository : IProviderRepository
    {
        private readonly string _connectionString;

        public ProviderRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<Provider> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Providers WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapProvider(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<Provider> GetByUserIdAsync(int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Providers WHERE UserId = @UserId";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserId", userId);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapProvider(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<IEnumerable<Provider>> GetAllAsync()
        {
            var providers = new List<Provider>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Providers";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            providers.Add(MapProvider(reader));
                        }
                    }
                }
            }
            
            return providers;
        }

        public async Task<IEnumerable<Provider>> GetByCategoryAsync(ServiceCategory category)
        {
            var providers = new List<Provider>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Providers WHERE Category = @Category";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Category", category.ToString());
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            providers.Add(MapProvider(reader));
                        }
                    }
                }
            }
            
            return providers;
        }

        public async Task<Provider> CreateAsync(Provider provider)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    INSERT INTO Providers (UserId, CompanyName, Address, Category, Description, WorkingHours, IsVerified)
                    VALUES (@UserId, @CompanyName, @Address, @Category, @Description, @WorkingHours, @IsVerified);
                    SELECT SCOPE_IDENTITY();";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserId", provider.UserId);
                    command.Parameters.AddWithValue("@CompanyName", provider.CompanyName);
                    command.Parameters.AddWithValue("@Address", string.IsNullOrEmpty(provider.Address) ? DBNull.Value : (object)provider.Address);
                    command.Parameters.AddWithValue("@Category", provider.Category.ToString());
                    command.Parameters.AddWithValue("@Description", string.IsNullOrEmpty(provider.Description) ? DBNull.Value : (object)provider.Description);
                    command.Parameters.AddWithValue("@WorkingHours", string.IsNullOrEmpty(provider.WorkingHours) ? DBNull.Value : (object)provider.WorkingHours);
                    command.Parameters.AddWithValue("@IsVerified", provider.IsVerified);
                    
                    provider.Id = Convert.ToInt32(await command.ExecuteScalarAsync());
                }
            }
            
            return provider;
        }

        public async Task<Provider> UpdateAsync(int id, Provider provider)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    UPDATE Providers
                    SET CompanyName = @CompanyName,
                        Address = @Address,
                        Category = @Category,
                        Description = @Description,
                        WorkingHours = @WorkingHours
                    WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@CompanyName", provider.CompanyName);
                    command.Parameters.AddWithValue("@Address", string.IsNullOrEmpty(provider.Address) ? DBNull.Value : (object)provider.Address);
                    command.Parameters.AddWithValue("@Category", provider.Category.ToString());
                    command.Parameters.AddWithValue("@Description", string.IsNullOrEmpty(provider.Description) ? DBNull.Value : (object)provider.Description);
                    command.Parameters.AddWithValue("@WorkingHours", string.IsNullOrEmpty(provider.WorkingHours) ? DBNull.Value : (object)provider.WorkingHours);
                    
                    await command.ExecuteNonQueryAsync();
                }
                
                return await GetByIdAsync(id);
            }
        }

        public async Task<bool> VerifyProviderAsync(int id, bool isVerified)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"UPDATE Providers SET IsVerified = @IsVerified WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@IsVerified", isVerified);
                    
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        private Provider MapProvider(SqlDataReader reader)
        {
            return new Provider
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                CompanyName = reader.GetString(reader.GetOrdinal("CompanyName")),
                Address = reader.IsDBNull(reader.GetOrdinal("Address")) ? null : reader.GetString(reader.GetOrdinal("Address")),
                Category = (ServiceCategory)Enum.Parse(typeof(ServiceCategory), reader.GetString(reader.GetOrdinal("Category"))),
                Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                WorkingHours = reader.IsDBNull(reader.GetOrdinal("WorkingHours")) ? null : reader.GetString(reader.GetOrdinal("WorkingHours")),
                IsVerified = reader.GetBoolean(reader.GetOrdinal("IsVerified"))
            };
        }
    }
}