/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.23, 50.39], // Червоноград / Шептицький
  zoom: 13
});

map.on('load', () => {

  // ===== LOAD BUILDINGS =====
  map.addSource('buildings', {
    type: 'geojson',
    data: './data/buildings_demo1.geojson'
  });

  // ===== BUILDINGS FILL =====
  map.addLayer({
    id: 'buildings-fill',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'debt_is'], true], '#e74c3c', // 🔴 борг
        '#3498db'                                  // 🔵 без боргу
      ],
      'fill-opacity': 0.7
    }
  });

  // ===== OUTLINE =====
  map.addLayer({
    id: 'buildings-outline',
    type: 'line',
    source: 'buildings',
    paint: {
      'line-color': '#ffffff',
      'line-width': 0.5
    }
  });

  // ===== POPUP ON HOVER =====
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mousemove', 'buildings-fill', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const p = e.features[0].properties;

    popup
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>Будівля:</strong> ${p.building_id ?? '—'}<br>
        <strong>Тип:</strong> ${p.building_type ?? '—'}<br>
        <strong>Власність:</strong> ${p.ownership ?? '—'}<br>
        <strong>Податок:</strong> ${p.tax_due ?? '—'} грн<br>
        <strong>Борг:</strong> ${p.debt_is ? `<span style="color:red">${p.debt_amount} грн</span>` : 'немає'}
      `)
      .addTo(map);
  });

  map.on('mouseleave', 'buildings-fill', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

});

