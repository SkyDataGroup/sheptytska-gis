/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.24, 50.39],
  zoom: 13
});

map.on('load', async () => {

  map.addSource('buildings', {
    type: 'geojson',
    data: 'data/buildings_demo.geojson'
  });

  map.addLayer({
    id: 'buildings-fill',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'debt_is'], true], '#e63946',
        '#457b9d'
      ],
      'fill-opacity': 0.7
    }
  });

  map.addLayer({
    id: 'buildings-line',
    type: 'line',
    source: 'buildings',
    paint: {
      'line-color': '#1d3557',
      'line-width': 0.5
    }
  });

  setupHover();
  setupFilters();
  calculateStats();

  setTimeout(() => map.resize(), 300);
});

function setupHover() {
  map.on('mousemove', 'buildings-fill', (e) => {
    const p = e.features[0].properties;
    document.getElementById('info-content').innerHTML = `
      <b>${p.building_id}</b><br>
      Тип: ${p.build_type}<br>
      Власність: ${p.ownership}<br>
      Податок: ${p.tax_amount} грн<br>
      Борг: ${p.debt_is ? p.debt_amount + ' грн' : 'немає'}
    `;
  });

  map.on('mouseleave', 'buildings-fill', () => {
    document.getElementById('info-content').innerText =
      'Наведіть курсор на будівлю';
  });
}

function setupFilters() {
  const update = () => {
    const debt = document.getElementById('filterDebt').checked;
    const noDebt = document.getElementById('filterNoDebt').checked;
    const ownership = document.getElementById('ownershipFilter').value;

    const filters = ['all'];

    if (!(debt && noDebt)) {
      filters.push([
        '==',
        ['get', 'debt_is'],
        debt
      ]);
    }

    if (ownership !== 'all') {
      filters.push(['==', ['get', 'ownership'], ownership]);
    }

    map.setFilter('buildings-fill', filters);
    calculateStats();
  };

  document.querySelectorAll('#sidebar input, #sidebar select')
    .forEach(el => el.addEventListener('change', update));
}

async function calculateStats() {
  const res = await fetch('data/buildings_demo.geojson');
  const geo = await res.json();

  let total = 0, debt = 0, sum = 0;

  geo.features.forEach(f => {
    total++;
    if (f.properties.debt_is) {
      debt++;
      sum += Number(f.properties.debt_amount || 0);
    }
  });

  document.getElementById('statTotal').innerText = total;
  document.getElementById('statDebt').innerText = debt;
  document.getElementById('statSum').innerText = sum.toLocaleString();
}


