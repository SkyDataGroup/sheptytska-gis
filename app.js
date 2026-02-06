/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';



const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.23, 50.38],
  zoom: 13
});

map.on('load', async () => {
  const res = await fetch('data/buildings_demo2.geojson');
  const buildings = await res.json();

  map.addSource('buildings', {
    type: 'geojson',
    data: buildings
  });

  map.addLayer({
    id: 'buildings-fill',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'debt_is'], 1], '#e74c3c', // з боргом
        '#3498db'                               // без боргу
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

  // ===== INFO PANEL (RIGHT) =====
  map.on('mousemove', 'buildings-fill', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const f = e.features[0].properties;

    document.getElementById('info-content').innerHTML = `
      <div><b>Будівля:</b> ${f.building_id}</div>
      <div><b>Тип:</b> ${f.building_type || '—'}</div>
      <div><b>Власність:</b> ${f.ownership}</div>
      <div><b>Податок:</b> ${f.tax_amount} грн</div>
      <div><b>Борг:</b> ${f.debt_is == 1 ? 'є' : 'немає'}</div>
    `;
  });

  map.on('mouseleave', 'buildings-fill', () => {
    map.getCanvas().style.cursor = '';
    document.getElementById('info-content').innerHTML =
      'Наведіть курсор на будівлю';
  });

  // ===== POPUP =====
  map.on('click', 'buildings-fill', (e) => {
    const f = e.features[0].properties;

    new mapboxgl.Popup({ closeButton: true })
      .setLngLat(e.lngLat)
      .setHTML(`
        <b>${f.building_id}</b><br>
        Тип: ${f.building_type || '—'}<br>
        Власність: ${f.ownership}<br>
        Податок: ${f.tax_amount} грн<br>
        Борг: ${f.debt_is == 1 ? 'є' : 'немає'}
      `)
      .addTo(map);
  });
});

