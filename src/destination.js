document.getElementById("routeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const start = document.getElementById("start").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const routeList = document.getElementById("routeList");

  routeList.innerHTML = ""; // Clear old results

  if (!start || !destination) {
    alert("Please enter both starting point and destination.");
    return;
  }

  // Fake route suggestions (you can fetch from backend later)
  const sampleRoutes = [
    `Jeepney from ${start} to ${destination} via Main Street`,
    `Jeepney from ${start} to ${destination} via Downtown`,
    `Jeepney from ${start} to ${destination} via City Terminal`
  ];

  sampleRoutes.forEach(route => {
    const li = document.createElement("li");
    li.textContent = route;
    routeList.appendChild(li);
  });
});