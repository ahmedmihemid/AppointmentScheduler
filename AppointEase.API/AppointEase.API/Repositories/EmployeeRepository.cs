using AppointEase.API.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly string _connectionString;

        public EmployeeRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<Employee> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Employees WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return MapEmployee(reader);
                        }
                    }
                }
            }
            
            return null;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            var employees = new List<Employee>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Employees WHERE IsActive = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            employees.Add(MapEmployee(reader));
                        }
                    }
                }
            }
            
            return employees;
        }

        public async Task<IEnumerable<Employee>> GetByProviderAsync(int providerId)
        {
            var employees = new List<Employee>();
            
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"SELECT * FROM Employees WHERE ProviderId = @ProviderId AND IsActive = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@ProviderId", providerId);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            employees.Add(MapEmployee(reader));
                        }
                    }
                }
            }
            
            return employees;
        }

        public async Task<Employee> CreateAsync(Employee employee)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    INSERT INTO Employees (ProviderId, FirstName, LastName, Email, Phone, Position, Department, WorkingHours, IsActive)
                    VALUES (@ProviderId, @FirstName, @LastName, @Email, @Phone, @Position, @Department, @WorkingHours, @IsActive);
                    SELECT SCOPE_IDENTITY();";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@ProviderId", employee.ProviderId);
                    command.Parameters.AddWithValue("@FirstName", employee.FirstName);
                    command.Parameters.AddWithValue("@LastName", employee.LastName);
                    command.Parameters.AddWithValue("@Email", employee.Email);
                    command.Parameters.AddWithValue("@Phone", string.IsNullOrEmpty(employee.Phone) ? DBNull.Value : (object)employee.Phone);
                    command.Parameters.AddWithValue("@Position", string.IsNullOrEmpty(employee.Position) ? DBNull.Value : (object)employee.Position);
                    command.Parameters.AddWithValue("@Department", employee.Department);
                    command.Parameters.AddWithValue("@WorkingHours", string.IsNullOrEmpty(employee.WorkingHours) ? DBNull.Value : (object)employee.WorkingHours);
                    command.Parameters.AddWithValue("@IsActive", employee.IsActive);
                    
                    employee.Id = Convert.ToInt32(await command.ExecuteScalarAsync());
                }
            }
            
            return employee;
        }

        public async Task<Employee> UpdateAsync(int id, Employee employee)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                const string sql = @"
                    UPDATE Employees
                    SET FirstName = @FirstName,
                        LastName = @LastName,
                        Email = @Email,
                        Phone = @Phone,
                        Position = @Position,
                        Department = @Department,
                        WorkingHours = @WorkingHours,
                        IsActive = @IsActive
                    WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@FirstName", employee.FirstName);
                    command.Parameters.AddWithValue("@LastName", employee.LastName);
                    command.Parameters.AddWithValue("@Email", employee.Email);
                    command.Parameters.AddWithValue("@Phone", string.IsNullOrEmpty(employee.Phone) ? DBNull.Value : (object)employee.Phone);
                    command.Parameters.AddWithValue("@Position", string.IsNullOrEmpty(employee.Position) ? DBNull.Value : (object)employee.Position);
                    command.Parameters.AddWithValue("@Department", employee.Department);
                    command.Parameters.AddWithValue("@WorkingHours", string.IsNullOrEmpty(employee.WorkingHours) ? DBNull.Value : (object)employee.WorkingHours);
                    command.Parameters.AddWithValue("@IsActive", employee.IsActive);
                    
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
                const string sql = @"UPDATE Employees SET IsActive = 0 WHERE Id = @Id";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        private Employee MapEmployee(SqlDataReader reader)
        {
            return new Employee
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                LastName = reader.GetString(reader.GetOrdinal("LastName")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.IsDBNull(reader.GetOrdinal("Phone")) ? null : reader.GetString(reader.GetOrdinal("Phone")),
                Position = reader.IsDBNull(reader.GetOrdinal("Position")) ? null : reader.GetString(reader.GetOrdinal("Position")),
                Department = reader.GetString(reader.GetOrdinal("Department")),
                WorkingHours = reader.IsDBNull(reader.GetOrdinal("WorkingHours")) ? null : reader.GetString(reader.GetOrdinal("WorkingHours")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
            };
        }
    }
}