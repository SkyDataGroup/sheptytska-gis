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

/* ===============================
   INFO PANEL SCHEMA
================================ */
const INFO_SCHEMA = {
  "Ідентифікація": [
    ["building_id", "ID будівлі"],
    ["build_code", "Код будівлі"],
    ["build_num", "Номер будівлі"],
    ["corp_num", "Корпус"],
    ["str_id", "ID вулиці"],
    ["index", "Індекс"]
  ],

  "Тип та класифікація": [
    ["build_type", "Тип будівлі"],
    ["obj_type", "Тип обʼєкта"],
    ["sub_type", "Підтип"],
    ["category", "Категорія"]
  ],

  "Характеристики": [
    ["area", "Площа"],
    ["floor", "Поверх"],
    ["flat", "Квартира"],
    ["entrance", "Підʼїзд"],
    ["condition", "Стан"]
  ],

  "Власність": [
    ["ownership", "Форма власності"]
  ],

  "Податки та борг": [
    ["tax_amount", "Сума податку"],
    ["taxable", "Оподатковується"],
    ["debt", "Борг"],
    ["debt_is", "Наявність боргу"]
  ],

  "Додатково": [
    ["note", "Примітка"]
  ]
};

/* ===============================
   MAP INIT
================================ */
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

/* ===============================
   FILTER LOGIC
================================ */
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

/* ===============================
   UI EVENTS
================================ */
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

/* ===============================
   ANALYTICS
================================ */
function updateStats() {
  if (!geoData) return;

  const list = geoData.features.filter(f => {
    const tax = Number(f.properties.tax_amount || 0);

    if (!filters.debt && tax > 0) return false;
    if (!filters.noDebt && tax === 0) return false;
    if (
      filters.ownership !== "all" &&
      f.properties.ownership !== filters.ownership
    )
      return false;

    return true;
  });

  const debtors = list.filter(f => Number(f.properties.tax_amount) > 0);
  const sum = debtors.reduce(
    (s, f) => s + Number(f.properties.tax_amount || 0),
    0
  );

  document.getElementById("stat-total").innerText = list.length;
  document.getElementById("stat-debtors").innerText = debtors.length;
  document.getElementById("stat-sum").innerText = sum + " грн";
}

/* ===============================
   INFO PANEL RENDER
================================ */
function renderInfoPanel(properties) {
  let html = "";

  for (const section in INFO_SCHEMA) {
    html += `<h4>${section}</h4>`;

    INFO_SCHEMA[section].forEach(([key, label]) => {
      let value = properties[key];

      if (value === undefined || value === null || value === "") {
        value = "—";
      }

      if (key === "tax_amount" && value !== "—") {
        value = value + " грн";
      }

      if (typeof value === "boolean") {
        value = value ? "так" : "ні";
      }

      html += `
        <div style="margin-bottom:4px; opacity:0.85">
          <strong>${label}:</strong> ${value}
        </div>
      `;
    });
  }

  return html;
}

/* ===============================
   MAP EVENTS
================================ */
function bindMapEvents() {
  map.on("mousemove", "buildings", e => {
    const p = e.features[0].properties;

    document.getElementById("info-panel").innerHTML = `
      <h3>${p.building_id || "Будівля"}</h3>
      ${renderInfoPanel(p)}
    `;
  });

  map.on("mouseleave", "buildings", () => {
    document.getElementById("info-panel").innerHTML =
      "<p>Наведіть курсор на будівлю</p>";
  });
}
