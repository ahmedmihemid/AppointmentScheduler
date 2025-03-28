using AppointEase.API.Auth;
using AppointEase.API.DTOs;
using AppointEase.API.Models;
using AppointEase.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IProviderRepository _providerRepository;
        private readonly IServiceRepository _serviceRepository;

        public AppointmentsController(
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IProviderRepository providerRepository,
            IServiceRepository serviceRepository)
        {
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _providerRepository = providerRepository;
            _serviceRepository = serviceRepository;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetById(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                return NotFound();

            // Check if the user has access to this appointment
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);

            // User can only view appointments they are involved in
            if (currentUser.Role == UserRole.Customer && appointment.CustomerId != currentUser.Id)
                return Forbid();
            else if (currentUser.Role == UserRole.Provider && provider != null && appointment.ProviderId != provider.Id)
                return Forbid();
            else if (currentUser.Role != UserRole.Admin && currentUser.Role != UserRole.Customer && currentUser.Role != UserRole.Provider)
                return Forbid();

            return Ok(appointment);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetByCustomer(int customerId)
        {
            // Check if the user has access to these appointments
            var currentUser = (User)HttpContext.Items["User"];
            
            // Only the customer or admin can view their appointments
            if (currentUser.Id != customerId && currentUser.Role != UserRole.Admin)
                return Forbid();

            var appointments = await _appointmentRepository.GetByCustomerIdAsync(customerId);
            return Ok(appointments);
        }

        [HttpGet("provider/{providerId}")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetByProvider(int providerId)
        {
            // Check if the user has access to these appointments
            var currentUser = (User)HttpContext.Items["User"];
            var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);
            
            // Only the provider or admin can view these appointments
            if ((currentUser.Role == UserRole.Provider && provider != null && provider.Id != providerId) && currentUser.Role != UserRole.Admin)
                return Forbid();

            var appointments = await _appointmentRepository.GetByProviderIdAsync(providerId);
            return Ok(appointments);
        }

        [HttpGet("status/{status}")]
        [Authorize(UserRole.Admin)]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetByStatus(string status)
        {
            if (!Enum.TryParse<AppointmentStatus>(status, true, out var appointmentStatus))
                return BadRequest("Invalid appointment status");

            var appointments = await _appointmentRepository.GetByStatusAsync(appointmentStatus);
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> Create(AppointmentCreateDTO appointmentDto)
        {
            // Check if the user has permission to create this appointment
            var currentUser = (User)HttpContext.Items["User"];
            
            // Customer can only create appointments for themselves
            if (currentUser.Role == UserRole.Customer && appointmentDto.CustomerId != currentUser.Id)
                return Forbid();
            
            // Provider can only create appointments for their own services
            if (currentUser.Role == UserRole.Provider)
            {
                var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);
                if (provider == null || provider.Id != appointmentDto.ProviderId)
                    return Forbid();
            }

            // Check if the service exists and belongs to the provider
            var service = await _serviceRepository.GetByIdAsync(appointmentDto.ServiceId);
            if (service == null)
                return BadRequest("Invalid service");
            if (service.ProviderId != appointmentDto.ProviderId)
                return BadRequest("Service does not belong to the selected provider");

            // Create the appointment
            var appointment = new Appointment
            {
                CustomerId = appointmentDto.CustomerId,
                ProviderId = appointmentDto.ProviderId,
                ServiceId = appointmentDto.ServiceId,
                EmployeeId = appointmentDto.EmployeeId,
                Date = appointmentDto.Date,
                Status = AppointmentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            var createdAppointment = await _appointmentRepository.CreateAsync(appointment);
            return CreatedAtAction(nameof(GetById), new { id = createdAppointment.Id }, createdAppointment);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<Appointment>> UpdateStatus(int id, AppointmentUpdateDTO updateDto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                return NotFound();

            // Check if the user has permission to update this appointment
            var currentUser = (User)HttpContext.Items["User"];
            
            // Customer can only cancel their own appointments
            if (currentUser.Role == UserRole.Customer)
            {
                if (appointment.CustomerId != currentUser.Id)
                    return Forbid();
                
                // Customer can only cancel appointments
                if (updateDto.Status != AppointmentStatus.Canceled)
                    return Forbid();
            }
            
            // Provider can only update appointments for their own services
            if (currentUser.Role == UserRole.Provider)
            {
                var provider = await _providerRepository.GetByUserIdAsync(currentUser.Id);
                if (provider == null || provider.Id != appointment.ProviderId)
                    return Forbid();
            }

            // Update the appointment status
            var updatedAppointment = await _appointmentRepository.UpdateStatusAsync(id, updateDto.Status);
            return Ok(updatedAppointment);
        }
    }
}