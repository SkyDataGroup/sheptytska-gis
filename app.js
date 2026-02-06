mapboxgl.accessToken =
 'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.24, 50.38],
  zoom: 13
});

let currentOwnership = 'all';
let currentDebt = 'all';

map.on('load', async () => {

  const res = await fetch('data/buildings_demo2.geojson');
  const geojson = await res.json();

  map.addSource('buildings', {
    type: 'geojson',
    data: geojson
  });

  map.addLayer({
    id: 'buildings-fill',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'debt_is'], true], '#e74c3c',
        '#3498db'
      ],
      'fill-opacity': 0.6
    }
  });

  map.addLayer({
    id: 'buildings-outline',
    type: 'line',
    source: 'buildings',
    paint: {
      'line-color': '#ffffff',
      'line-width': 0.5
    }
  });

  // ===== FILTER LOGIC =====
  function applyFilters() {
    const filters = ['all'];

    if (currentOwnership !== 'all') {
      filters.push(['==', ['get', 'ownership'], currentOwnership]);
    }

    if (currentDebt !== 'all') {
      filters.push([
        '==',
        ['get', 'debt_is'],
        currentDebt === 'yes'
      ]);
    }

    map.setFilter('buildings-fill', filters);
    map.setFilter('buildings-outline', filters);
  }

  document.getElementById('filter-ownership')
    .addEventListener('change', e => {
      currentOwnership = e.target.value;
      applyFilters();
    });

  document.getElementById('filter-debt')
    .addEventListener('change', e => {
      currentDebt = e.target.value;
      applyFilters();
    });

  // ===== HOVER INFO (ВСІ ПОЛЯ) =====
  map.on('mousemove', 'buildings-fill', (e) => {
    const props = e.features[0].properties;

    let html = '';
    for (const key in props) {
      html += `<strong>${key}:</strong> ${props[key] ?? '—'}<br>`;
    }

    document.getElementById('info-content').innerHTML = html;
  });

  map.on('mouseleave', 'buildings-fill', () => {
    document.getElementById('info-content').innerText =
      'Наведіть курсор на будівлю';
  });

});
