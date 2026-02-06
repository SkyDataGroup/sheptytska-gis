mapboxgl.accessToken =
 'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';


const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.24, 50.38], // Шептицький
  zoom: 13
});

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
        ['==', ['get', 'debt_is'], true], '#e74c3c',   // з боргом
        '#3498db'                                     // без боргу
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

  // ===== Hover info =====
  map.on('mousemove', 'buildings-fill', (e) => {
    const p = e.features[0].properties;

    document.getElementById('info-content').innerHTML = `
      <strong>Будівля:</strong> ${p.building_id}<br>
      <strong>Тип:</strong> ${p.build_type ?? '—'}<br>
      <strong>Власність:</strong> ${p.ownership}<br>
      <strong>Податок:</strong> ${p.tax_sum ?? '—'} грн<br>
      <strong>Борг:</strong> ${p.debt_is ? 'є' : 'немає'}
    `;
  });

  map.on('mouseleave', 'buildings-fill', () => {
    document.getElementById('info-content').innerText =
      'Наведіть курсор на будівлю';
  });

});

