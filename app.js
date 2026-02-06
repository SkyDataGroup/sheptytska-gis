/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';



/* ==============================
   GLOBAL STATE
================================ */
let map;
let geoData;

let currentFilters = {
  debt: true,
  noDebt: true,
  ownership: "all"
};

/* ==============================
   MAP INIT
================================ */
map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: [24.23, 50.39],
  zoom: 13
});

map.on("load", () => {
  loadBuildings();
});

/* ==============================
   LOAD GEOJSON
================================ */
async function loadBuildings() {
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
        "#ef4444",     // debt
        "#3b82f6"      // no debt
      ],
      "fill-opacity": 0.55
    }
  });

  map.addLayer({
    id: "buildings-outline",
    type: "line",
    source: "buildings",
    paint: {
      "line-color": "rgba(255,255,255,0.35)",
      "line-width": 0.6
    }
  });

  applyFilters();
  updateStatsFiltered();
  registerMapEvents();
}

/* ==============================
   MAP EVENTS
================================ */
function registerMapEvents() {
  map.on("mousemove", "buildings", e => {
    map.getCanvas().style.cursor = "pointer";

    const p = e.features[0].properties;

    document.getElementById("info-panel").innerHTML = `
      <h3>Будівля: ${p.building_id}</h3>
      <div>Тип: ${p.build_type || "—"}</div>
      <div>Власність: ${p.ownership}</div>
      <div>Податок: ${p.tax_amount} грн</div>
      <div>Борг: ${p.tax_amount > 0 ? p.tax_amount + " грн" : "немає"}</div>
    `;
  });

  map.on("mouseleave", "buildings", () => {
    map.getCanvas().style.cursor = "";
    document.getElementById("info-panel").innerHTML =
      "<p>Наведіть курсор на будівлю</p>";
  });
}

/* ==============================
   FILTERS
================================ */
function applyFilters() {
  let filter = ["all"];

  // debt filters
  if (currentFilters.debt && !currentFilters.noDebt) {
    filter.push([">", ["get", "tax_amount"], 0]);
  }

  if (!currentFilters.debt && currentFilters.noDebt) {
    filter.push(["==", ["get", "tax_amount"], 0]);
  }

  // ownership
  if (currentFilters.ownership !== "all") {
    filter.push([
      "==",
      ["get", "ownership"],
      currentFilters.ownership
    ]);
  }

  map.setFilter("buildings", filter);
  updateStatsFiltered();
}

/* ==============================
   FILTER UI
================================ */
document.getElementById("filterDebt").onchange = e => {
  currentFilters.debt = e.target.checked;
  applyFilters();
};

document.getElementById("filterNoDebt").onchange = e => {
  currentFilters.noDebt = e.target.checked;
  applyFilters();
};

document.getElementById("ownershipFilter").onchange = e => {
  currentFilters.ownership = e.target.value;
  applyFilters();
};

/* ==============================
   ANALYTICS
================================ */
function updateStatsFiltered() {
  if (!geoData) return;

  const features = geoData.features.filter(f => {
    const tax = Number(f.properties.tax_amount);
    const own = f.properties.ownership;

    if (!currentFilters.debt && tax > 0) return false;
    if (!currentFilters.noDebt && tax === 0) return false;
    if (currentFilters.ownership !== "all" && own !== currentFilters.ownership)
      return false;

    return true;
  });

  const debtors = features.filter(f => f.properties.tax_amount > 0);
  const sumDebt = debtors.reduce(
    (sum, f) => sum + Number(f.properties.tax_amount),
    0
  );

  document.getElementById("stat-total").innerText = features.length;
  document.getElementById("stat-debtors").innerText = debtors.length;
  document.getElementById("stat-sum").innerText = sumDebt + " грн";
}

/* ==============================
   SEARCH
================================ */
document.getElementById("searchInput").oninput = e => {
  const q = e.target.value.toLowerCase();

  if (!q) {
    map.setFilter("buildings", null);
    applyFilters();
    return;
  }

  map.setFilter("buildings", [
    "in",
    ["downcase", ["get", "building_id"]],
    q
  ]);
};
