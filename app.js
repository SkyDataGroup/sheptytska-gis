mapboxgl.accessToken = 'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.22, 50.29], // Шептицька громада (приблизно)
  zoom: 11
});

map.on('load', () => {

  // 🔹 ДЕМО межа громади
  map.addSource('community', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [24.05, 50.20],
          [24.40, 50.20],
          [24.40, 50.40],
          [24.05, 50.40],
          [24.05, 50.20]
        ]]
      }
    }
  });

  map.addLayer({
    id: 'community-border',
    type: 'line',
    source: 'community',
    paint: {
      'line-color': '#ffffff',
      'line-width': 2
    }
  });

  // 🔹 ДЕМО ділянки
  map.addSource('parcels', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            cadastre_id: '4624887200:01:001:0001',
            status: 'free',
            area: '1.2 га'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [24.18, 50.28],
              [24.20, 50.28],
              [24.20, 50.30],
              [24.18, 50.30],
              [24.18, 50.28]
            ]]
          }
        }
      ]
    }
  });

  map.addLayer({
    id: 'parcels-fill',
    type: 'fill',
    source: 'parcels',
    paint: {
      'fill-color': [
        'match',
        ['get', 'status'],
        'free', '#2ecc71',
        'leased', '#f1c40f',
        '#3498db'
      ],
      'fill-opacity': 0.6
    }
  });

  map.addLayer({
    id: 'parcels-outline',
    type: 'line',
    source: 'parcels',
    paint: {
      'line-color': '#ffffff',
      'line-width': 1
    }
  });

  // 🖱️ Клік по ділянці
  map.on('click', 'parcels-fill', (e) => {
    const p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>Кадастровий номер:</strong><br>${p.cadastre_id}<br>
        <strong>Площа:</strong> ${p.area}<br>
        <strong>Статус:</strong> Вільна
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'parcels-fill', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'parcels-fill', () => {
    map.getCanvas().style.cursor = '';
  });

});
