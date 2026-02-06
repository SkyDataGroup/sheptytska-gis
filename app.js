/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';


const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: [24.23, 50.38],
  zoom: 14
});

map.on("load", async () => {
  const res = await fetch("data/buildings_demo2.geojson");
  const data = await res.json();

  map.addSource("buildings", {
    type: "geojson",
    data
  });

  map.addLayer({
    id: "buildings",
    type: "fill",
    source: "buildings",
    paint: {
      "fill-color": [
        "case",
        [">", ["get", "tax_amount"], 0],
        "#dc2626",
        "#3b82f6"
      ],
      "fill-opacity": 0.7
    }
  });

  updateStats(data);

  map.on("mousemove", "buildings", e => {
    const p = e.features[0].properties;
    document.getElementById("info-content").innerHTML = `
      <b>Будівля:</b> ${p.building_id}<br>
      <b>Тип:</b> ${p.build_type || "—"}<br>
      <b>Власність:</b> ${p.ownership}<br>
      <b>Податок:</b> ${p.tax_amount} грн<br>
      <b>Борг:</b> ${p.tax_amount > 0 ? p.tax_amount + " грн" : "немає"}
    `;
  });

  map.on("mouseleave", "buildings", () => {
    document.getElementById("info-content").innerText =
      "Наведіть курсор на будівлю";
  });

  // Layer toggles
  document.getElementById("layerBuildings").onchange = e =>
    map.setLayoutProperty(
      "buildings",
      "visibility",
      e.target.checked ? "visible" : "none"
    );
});

function updateStats(data) {
  const total = data.features.length;
  const debtors = data.features.filter(f => f.properties.tax_amount > 0);
  const sum = debtors.reduce((s, f) => s + Number(f.properties.tax_amount), 0);

  document.getElementById("stat-total").innerText = total;
  document.getElementById("stat-debtors").innerText = debtors.length;
  document.getElementById("stat-sum").innerText = sum + " грн";
}

