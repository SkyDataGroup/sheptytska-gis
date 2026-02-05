/* ===============================
   MAPBOX CONFIG
================================ */
mapboxgl.accessToken =
  'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

/* ===============================
   AIRTABLE CONFIG (DEMO, WITH TOKEN)
================================ */
const AIRTABLE_BASE_ID = 'appUcws5zoGIey4Tv';
const AIRTABLE_TABLE = 'Parcels';
const AIRTABLE_VIEW = 'Public API';

// ⚠️ DEMO TOKEN — OK FOR DEMO ONLY
const AIRTABLE_TOKEN = 'pat9YAXQ7LNOczvR0';

const AIRTABLE_API_URL =
  `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?view=${encodeURIComponent(AIRTABLE_VIEW)}`;

/* ===============================
   MAP INIT
================================ */
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.22, 50.29], // Шептицька громада
  zoom: 11
});

map.on('load', async () => {

  /* ===============================
     COMMUNITY BORDER (DEMO)
  ================================ */
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

  /* ===============================
     PARCELS (DEMO GEOMETRY)
  ================================ */
  map.addSource('parcels', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            cadastre_id: '4624887200:01:001:0001',
            status: 'free'
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

  /* ===============================
     LOAD AIRTABLE DATA
  ================================ */
  let airtableRecords = [];

  try {
    const res = await fetch(AIRTABLE_API_URL, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await res.json();

    airtableRecords = data.records.map(r => ({
      cadastre_id: r.fields.cadastre_id,
      status: r.fields.status,
      ownership: r.fields.ownership,
      area_ha: r.fields.area_ha,
      purpose: r.fields.purpose,
      normative_value: r.fields.normative_value,
      comment: r.fields.comment
    }));

    console.log('Airtable loaded:', airtableRecords);
  } catch (err) {
    console.error('Airtable error:', err);
  }

  /* ===============================
     CLICK HANDLER
  ================================ */
  const normalize = v =>
  String(v || '')
    .trim()
    .replace(/\s+/g, '');

   map.on('click', 'parcels-fill', (e) => {
    const cadastreId = e.features[0].properties.cadastre_id;

    let html = `
      <strong>Кадастровий номер:</strong><br>
      ${cadastreId}<br><br>
    `;

    const record = airtableRecords.find(
  r => normalize(r.cadastre_id) === normalize(cadastreId)
);


    if (record) {
      html += `
        <strong>Статус:</strong> ${record.status ?? '—'}<br>
        <strong>Власність:</strong> ${record.ownership ?? '—'}<br>
        <strong>Площа:</strong> ${record.area_ha ?? '—'} га<br>
        <strong>Цільове:</strong> ${record.purpose ?? '—'}<br>
        <strong>НГО:</strong> ${record.normative_value ?? '—'}<br>
        <em>${record.comment ?? ''}</em>
      `;
    } else {
      html += `<em>Дані в Airtable відсутні</em>`;
    }

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });

  /* ===============================
     CURSOR UX
  ================================ */
  map.on('mouseenter', 'parcels-fill', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'parcels-fill', () => {
    map.getCanvas().style.cursor = '';
  });

});
