mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

let map;
let geoData;

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
        "#22d3ee"
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

  bindEvents();
});

function bindEvents() {
  map.on("mousemove", "buildings", e => {
    const p = e.features[0].properties;

    document.getElementById("info-panel").innerHTML = `
      <h3>Будівля ${p.building_id}</h3>
      <div class="row"><span class="label">Тип:</span> ${p.build_type || "—"}</div>
      <div class="row"><span class="label">Власність:</span> ${p.ownership}</div>
      <div class="row"><span class="label">Нарахування:</span> ${p.tax_amount} грн</div>
      <div class="row"><span class="label">Борг:</span> ${p.tax_amount > 0 ? p.tax_amount + " грн" : "немає"}</div>

      <hr style="opacity:.1;margin:12px 0">

      <div class="row"><i class="ri-phone-line"></i> Зателефонувати</div>
      <div class="row"><i class="ri-send-plane-line"></i> PUSH у Приват24</div>
      <div class="row"><i class="ri-message-2-line"></i> Надіслати SMS</div>
    `;
  });

  map.on("mouseleave", "buildings", () => {
    document.getElementById("info-panel").innerHTML =
      `<h3>Обʼєкт не вибрано</h3><p class="muted">Наведіть курсор на будівлю</p>`;
  });
}
