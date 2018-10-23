using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SolidRC.Models;

namespace SolidRC.Controllers
{
  public class RDFController : Controller
  {
    public IActionResult Index()
    {
      return View();
    }
  }
}
