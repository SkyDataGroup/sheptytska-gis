/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.239, 50.388],
  zoom: 14
});

map.on('load', async () => {

  // LOAD GEOJSON
  const res = await fetch('buildings_demo.geojson');
  const geojson = await res.json();

  map.addSource('buildings', {
    type: 'geojson',
    data: geojson
  });

  // BUILDINGS LAYER
  map.addLayer({
    id: 'buildings-fill',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'debt_is'], true], '#dc2626',
        '#2563eb'
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

  // HOVER INFO
  map.on('mousemove', 'buildings-fill', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const p = e.features[0].properties;

    document.getElementById('info-content').innerHTML = `
      <strong>Будівля:</strong> ${p.building_id}<br>
      <strong>Тип:</strong> ${p.building_type || '—'}<br>
      <strong>Власність:</strong> ${p.ownership}<br>
      <strong>Податок:</strong> ${p.tax_due || 0} грн<br>
      <strong>Борг:</strong> ${p.debt_is ? p.debt_amount + ' грн' : 'немає'}
    `;
  });

  map.on('mouseleave', 'buildings-fill', () => {
    map.getCanvas().style.cursor = '';
  });

});


