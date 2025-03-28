using AppointEase.API.DTOs;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AppointEase.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public AppointmentsController(IAppointmentRepository appointmentRepository)
        {
            _appointmentRepository = appointmentRepository;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDTO>> GetById(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            // Check if user has permission to access this appointment
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Provider" && appointment.CustomerId != userId)
            {
                return Forbid();
            }

            return Ok(MapToDTO(appointment));
        }

        [HttpGet("customer")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<IEnumerable<AppointmentDTO>>> GetByCustomer()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var appointments = await _appointmentRepository.GetByCustomerIdAsync(userId);
            return Ok(MapToDTO(appointments));
        }

        [HttpGet("provider")]
        [Authorize(Roles = "Provider")]
        public async Task<ActionResult<IEnumerable<AppointmentDTO>>> GetByProvider()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            // Note: In a real implementation, you would need to get the provider ID from the user ID
            // For simplicity, I'm assuming provider ID is same as user ID
            var appointments = await _appointmentRepository.GetByProviderIdAsync(userId);
            return Ok(MapToDTO(appointments));
        }

        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AppointmentDTO>>> GetByStatus(AppointmentStatus status)
        {
            var appointments = await _appointmentRepository.GetByStatusAsync(status);
            return Ok(MapToDTO(appointments));
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<AppointmentDTO>> Create(AppointmentCreateDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            // Ensure the customer ID in the DTO matches the authenticated user's ID
            if (dto.CustomerId != userId)
            {
                return BadRequest("CustomerId in request does not match authenticated user");
            }

            var appointment = new Appointment
            {
                CustomerId = dto.CustomerId,
                ProviderId = dto.ProviderId,
                ServiceId = dto.ServiceId,
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                Status = AppointmentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            var createdAppointment = await _appointmentRepository.CreateAsync(appointment);
            return CreatedAtAction(nameof(GetById), new { id = createdAppointment.Id }, MapToDTO(createdAppointment));
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<AppointmentDTO>> UpdateStatus(int id, AppointmentUpdateDTO dto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Providers can update status of their own appointments
            // Customers can only cancel their own appointments
            // Admins can update status of any appointment
            if (userRole == "Admin" || 
                (userRole == "Provider" && appointment.ProviderId == userId) ||
                (userRole == "Customer" && appointment.CustomerId == userId && dto.Status == AppointmentStatus.Canceled))
            {
                var updatedAppointment = await _appointmentRepository.UpdateStatusAsync(id, dto.Status);
                return Ok(MapToDTO(updatedAppointment));
            }

            return Forbid();
        }

        private AppointmentDTO MapToDTO(Appointment appointment)
        {
            return new AppointmentDTO
            {
                Id = appointment.Id,
                CustomerId = appointment.CustomerId,
                ProviderId = appointment.ProviderId,
                ServiceId = appointment.ServiceId,
                EmployeeId = appointment.EmployeeId,
                Date = appointment.Date,
                CustomerName = appointment.CustomerName,
                ProviderName = appointment.ProviderName,
                ServiceName = appointment.ServiceName,
                ServiceCategory = appointment.ServiceCategory.ToString(),
                Duration = appointment.Duration,
                Status = appointment.Status.ToString(),
                CreatedAt = appointment.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            };
        }

        private IEnumerable<AppointmentDTO> MapToDTO(IEnumerable<Appointment> appointments)
        {
            var dtos = new List<AppointmentDTO>();
            foreach (var appointment in appointments)
            {
                dtos.Add(MapToDTO(appointment));
            }
            return dtos;
        }
    }
}
