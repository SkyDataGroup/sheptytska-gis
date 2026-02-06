/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';


let map;
let geoData;

const filters = {
  debt: true,
  noDebt: true,
  ownership: "all"
};

map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: [24.23, 50.39],
  zoom: 13
});

map.on("load", async () => {
  const res = await fetch("./data/buildings_demo2.geojson");
  geoData = await res.json();

  map.addSource("buildings", {
    type: "geojson",
    data: geoData
  });

  map.addLayer({
    id: "buildings",
    type: "fill",
    source: "buildings",
    paint: {
      "fill-color": [
        "case",
        [">", ["get", "tax_amount"], 0],
        "#ef4444",
        "#3b82f6"
      ],
      "fill-opacity": 0.55
    }
  });

  map.addLayer({
    id: "outline",
    type: "line",
    source: "buildings",
    paint: {
      "line-color": "rgba(255,255,255,0.3)",
      "line-width": 0.5
    }
  });

  applyFilters();
  updateStats();
  bindMapEvents();
});

/* FILTER LOGIC */
function applyFilters() {
  const filter = ["all"];

  if (filters.debt && !filters.noDebt) {
    filter.push([">", ["get", "tax_amount"], 0]);
  }
  if (!filters.debt && filters.noDebt) {
    filter.push(["==", ["get", "tax_amount"], 0]);
  }
  if (filters.ownership !== "all") {
    filter.push(["==", ["get", "ownership"], filters.ownership]);
  }

  map.setFilter("buildings", filter);
  updateStats();
}

/* UI EVENTS */
document.getElementById("filterDebt").onchange = e => {
  filters.debt = e.target.checked;
  applyFilters();
};
document.getElementById("filterNoDebt").onchange = e => {
  filters.noDebt = e.target.checked;
  applyFilters();
};
document.getElementById("ownershipFilter").onchange = e => {
  filters.ownership = e.target.value;
  applyFilters();
};

/* ANALYTICS */
function updateStats() {
  const list = geoData.features.filter(f => {
    const tax = f.properties.tax_amount;
    if (!filters.debt && tax > 0) return false;
    if (!filters.noDebt && tax === 0) return false;
    if (filters.ownership !== "all" && f.properties.ownership !== filters.ownership) return false;
    return true;
  });

  const debtors = list.filter(f => f.properties.tax_amount > 0);
  const sum = debtors.reduce((s, f) => s + Number(f.properties.tax_amount), 0);

  document.getElementById("stat-total").innerText = list.length;
  document.getElementById("stat-debtors").innerText = debtors.length;
  document.getElementById("stat-sum").innerText = sum + " грн";
}

/* MAP HOVER */
function bindMapEvents() {
  map.on("mousemove", "buildings", e => {
    const p = e.features[0].properties;

    document.getElementById("info-panel").innerHTML = `
      <h3>${p.building_id}</h3>
      <div>Тип: ${p.build_type || "—"}</div>
      <div>Власність: ${p.ownership}</div>
      <div>Податок: ${p.tax_amount} грн</div>
      <div>Борг: ${p.tax_amount > 0 ? p.tax_amount + " грн" : "немає"}</div>
    `;
  });

  map.on("mouseleave", "buildings", () => {
    document.getElementById("info-panel").innerHTML =
      "<p>Наведіть курсор на будівлю</p>";
  });
}
