using AppointEase.API.Auth;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IProviderRepository _providerRepository;

        public EmployeesController(IEmployeeRepository employeeRepository, IProviderRepository providerRepository)
        {
            _employeeRepository = employeeRepository;
            _providerRepository = providerRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetAll()
        {
            var employees = await _employeeRepository.GetAllAsync();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetById(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null)
                return NotFound();

            return Ok(employee);
        }

        [HttpGet("provider/{providerId}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetByProvider(int providerId)
        {
            var employees = await _employeeRepository.GetByProviderAsync(providerId);
            return Ok(employees);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Employee>> Create(Employee employee)
        {
            // Check if user has permission to create this employee
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // Only provider can create employees for their own account, or admin can create for any provider
            if (currentUser.Role == UserRole.Provider && (provider == null || provider.Id != employee.ProviderId))
                return Forbid();
            else if (currentUser.Role != UserRole.Provider && currentUser.Role != UserRole.Admin)
                return Forbid();

            var createdEmployee = await _employeeRepository.CreateAsync(employee);
            return CreatedAtAction(nameof(GetById), new { id = createdEmployee.Id }, createdEmployee);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Employee>> Update(int id, Employee employee)
        {
            var existingEmployee = await _employeeRepository.GetByIdAsync(id);
            if (existingEmployee == null)
                return NotFound();

            // Check if user has permission to update this employee
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // Only provider can update their own employees, or admin can update any employee
            if (currentUser.Role == UserRole.Provider && (provider == null || provider.Id != existingEmployee.ProviderId))
                return Forbid();
            else if (currentUser.Role != UserRole.Provider && currentUser.Role != UserRole.Admin)
                return Forbid();

            // Ensure ProviderId can't be changed
            employee.ProviderId = existingEmployee.ProviderId;
            
            var updatedEmployee = await _employeeRepository.UpdateAsync(id, employee);
            return Ok(updatedEmployee);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> Delete(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null)
                return NotFound();

            // Check if user has permission to delete this employee
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // Only provider can delete their own employees, or admin can delete any employee
            if (currentUser.Role == UserRole.Provider && (provider == null || provider.Id != employee.ProviderId))
                return Forbid();
            else if (currentUser.Role != UserRole.Provider && currentUser.Role != UserRole.Admin)
                return Forbid();

            await _employeeRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}