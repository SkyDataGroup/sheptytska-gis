/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';


let buildingsData;
let debtFilter = { withDebt: true, withoutDebt: true };
let ownershipFilter = 'all';
let debtMode = false;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.23, 50.38],
  zoom: 13
});

map.on('load', async () => {
  const res = await fetch('data/buildings_demo2.geojson');
  buildingsData = await res.json();

  map.addSource('buildings', {
    type: 'geojson',
    data: buildingsData
  });

  map.addLayer({
    id: 'buildings-fill',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'debt_is'], 1], '#e74c3c',
        '#3498db'
      ],
      'fill-opacity': 0.65
    }
  });

  map.addLayer({
    id: 'buildings-outline',
    type: 'line',
    source: 'buildings',
    paint: {
      'line-color': '#ffffff',
      'line-width': 0.4
    }
  });

  updateAnalytics();
});

/* ================= FILTERS ================= */

function applyFilters() {
  const filtered = {
    type: 'FeatureCollection',
    features: buildingsData.features.filter(f => {
      const debtOk =
        (f.properties.debt_is === 1 && debtFilter.withDebt) ||
        (f.properties.debt_is === 0 && debtFilter.withoutDebt);

      const ownerOk =
        ownershipFilter === 'all' ||
        f.properties.ownership === ownershipFilter;

      const debtModeOk =
        !debtMode || f.properties.debt_is === 1;

      return debtOk && ownerOk && debtModeOk;
    })
  };

  map.getSource('buildings').setData(filtered);
  updateAnalytics(filtered.features);
}

/* ================= ANALYTICS ================= */

function updateAnalytics(features = buildingsData.features) {
  const total = features.length;
  const debtors = features.filter(f => f.properties.debt_is === 1);
  const debtSum = debtors.reduce(
    (sum, f) => sum + Number(f.properties.debt_amount || 0),
    0
  );

  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-debtors').innerText = debtors.length;
  document.getElementById('stat-sum').innerText =
    debtSum.toLocaleString() + ' грн';
}

/* ================= UI HOOKS ================= */

// чекбокси
document.getElementById('withDebt').onchange = e => {
  debtFilter.withDebt = e.target.checked;
  applyFilters();
};

document.getElementById('withoutDebt').onchange = e => {
  debtFilter.withoutDebt = e.target.checked;
  applyFilters();
};

// форма власності
document.getElementById('ownership').onchange = e => {
  ownershipFilter = e.target.value;
  applyFilters();
};

// режим боржників
document.getElementById('debtMode').onclick = () => {
  debtMode = !debtMode;
  applyFilters();
  alert('📝 Створено завдання: Перевірка боржників');
};

/* ================= MAP INTERACTION ================= */

map.on('mousemove', 'buildings-fill', e => {
  const f = e.features[0].properties;

  document.getElementById('info-content').innerHTML = `
    <div><b>Будівля:</b> ${f.building_id}</div>
    <div><b>Тип:</b> ${f.building_type || '—'}</div>
    <div><b>Власність:</b> ${f.ownership}</div>
    <div><b>Податок:</b> ${f.tax_amount} грн</div>
    <div><b>Борг:</b> ${f.debt_amount || 0} грн</div>
  `;
});

map.on('mouseleave', 'buildings-fill', () => {
  document.getElementById('info-content').innerHTML =
    'Наведіть курсор на будівлю';
});

