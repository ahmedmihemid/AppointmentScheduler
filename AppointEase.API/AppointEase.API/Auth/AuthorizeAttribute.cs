using AppointEase.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AppointEase.API.Auth
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly IList<UserRole> _roles;

        public AuthorizeAttribute(params UserRole[] roles)
        {
            _roles = roles ?? new UserRole[] { };
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Skip authorization if action is decorated with [AllowAnonymous] attribute
            var allowAnonymous = context.ActionDescriptor.EndpointMetadata.Any(em => em.GetType().Name == "AllowAnonymousAttribute");
            if (allowAnonymous)
                return;

            // Authorization
            var user = (User)context.HttpContext.Items["User"];
            if (user == null)
            {
                // Not logged in or JWT token invalid
                context.Result = new JsonResult(new { message = "Unauthorized" }) 
                { 
                    StatusCode = StatusCodes.Status401Unauthorized 
                };
                return;
            }

            // Role-based authorization
            if (_roles.Any() && !_roles.Contains(user.Role))
            {
                context.Result = new JsonResult(new { message = "Forbidden" }) 
                { 
                    StatusCode = StatusCodes.Status403Forbidden 
                };
                return;
            }
        }
    }
}