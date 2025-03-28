using AppointEase.API.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<User> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    SELECT * FROM Users WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapUser(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    SELECT * FROM Users WHERE Username = @Username";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Username", username);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapUser(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            var users = new List<User>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Users WHERE IsActive = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            users.Add(MapUser(reader));
                        }
                    }
                }
            }
            
            return users;
        }

        public async Task<User> CreateAsync(User user)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    INSERT INTO Users (Username, Password, FirstName, LastName, Email, Phone, City, Role, IsActive, CreatedAt)
                    VALUES (@Username, @Password, @FirstName, @LastName, @Email, @Phone, @City, @Role, @IsActive, @CreatedAt);
                    SELECT SCOPE_IDENTITY();";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Username", user.Username);
                    command.Parameters.AddWithValue("@Password", user.Password);
                    command.Parameters.AddWithValue("@FirstName", user.FirstName);
                    command.Parameters.AddWithValue("@LastName", user.LastName);
                    command.Parameters.AddWithValue("@Email", user.Email);
                    command.Parameters.AddWithValue("@Phone", string.IsNullOrEmpty(user.Phone) ? DBNull.Value : (object)user.Phone);
                    command.Parameters.AddWithValue("@City", string.IsNullOrEmpty(user.City) ? DBNull.Value : (object)user.City);
                    command.Parameters.AddWithValue("@Role", user.Role.ToString());
                    command.Parameters.AddWithValue("@IsActive", user.IsActive);
                    command.Parameters.AddWithValue("@CreatedAt", user.CreatedAt);
                    
                    user.Id = Convert.ToInt32(await command.ExecuteScalarAsync());
                }
            }
            
            return user;
        }

        public async Task<User> UpdateAsync(int id, User user)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    UPDATE Users
                    SET FirstName = @FirstName,
                        LastName = @LastName,
                        Email = @Email,
                        Phone = @Phone,
                        City = @City,
                        IsActive = @IsActive
                    WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@FirstName", user.FirstName);
                    command.Parameters.AddWithValue("@LastName", user.LastName);
                    command.Parameters.AddWithValue("@Email", user.Email);
                    command.Parameters.AddWithValue("@Phone", string.IsNullOrEmpty(user.Phone) ? DBNull.Value : (object)user.Phone);
                    command.Parameters.AddWithValue("@City", string.IsNullOrEmpty(user.City) ? DBNull.Value : (object)user.City);
                    command.Parameters.AddWithValue("@IsActive", user.IsActive);
                    
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
                
                // Soft delete - just mark as inactive
                const string sql = @"UPDATE Users SET IsActive = 0 WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        public async Task<bool> IsUsernameUniqueAsync(string username)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = "SELECT COUNT(1) FROM Users WHERE Username = @Username";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Username", username);
                    
                    int count = Convert.ToInt32(await command.ExecuteScalarAsync());
                    return count == 0;
                }
            }
        }

        private User MapUser(SqlDataReader reader)
        {
            return new User
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                Password = reader.GetString(reader.GetOrdinal("Password")),
                FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                LastName = reader.GetString(reader.GetOrdinal("LastName")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.IsDBNull(reader.GetOrdinal("Phone")) ? null : reader.GetString(reader.GetOrdinal("Phone")),
                City = reader.IsDBNull(reader.GetOrdinal("City")) ? null : reader.GetString(reader.GetOrdinal("City")),
                Role = (UserRole)Enum.Parse(typeof(UserRole), reader.GetString(reader.GetOrdinal("Role"))),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };
        }
    }
}