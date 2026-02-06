mapboxgl.accessToken =
 'pk.eyJ1IjoidGFyYXN0eXJrbyIsImEiOiJjbWw4a3JtM3EwMWNvM2RzanBkdG01aTR6In0.IvAorFVXsdHbuaG7PRuaCA';

let map, geoData;

const filters = {
  debt: true,
  noDebt: true,
  ownership: 'all'
};

map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [24.23,50.39],
  zoom: 13
});

map.on('load', async () => {
  geoData = await (await fetch('./data/buildings_demo2.geojson')).json();

  map.addSource('buildings',{ type:'geojson', data:geoData });

  map.addLayer({
    id:'buildings', type:'fill', source:'buildings',
    paint:{
      'fill-color': ['case',['>', ['get','tax_amount'],0],'#ef4444','#22d3ee'],
      'fill-opacity':0.55
    }
  });

  map.addLayer({
    id:'outline', type:'line', source:'buildings',
    paint:{ 'line-color':'rgba(255,255,255,.3)','line-width':0.5 }
  });

  applyFilters();
  bindUI();
});

function applyFilters() {
  const f = ['all'];

  if (filters.debt && !filters.noDebt)
    f.push(['>', ['get','tax_amount'],0]);

  if (!filters.debt && filters.noDebt)
    f.push(['==', ['get','tax_amount'],0]);

  if (filters.ownership !== 'all')
    f.push(['==',['get','ownership'],filters.ownership]);

  map.setFilter('buildings', f);
}

function bindUI() {
  document.getElementById('filterDebt').onchange = e => {
    filters.debt = e.target.checked; applyFilters();
  };
  document.getElementById('filterNoDebt').onchange = e => {
    filters.noDebt = e.target.checked; applyFilters();
  };
  document.getElementById('ownershipFilter').onchange = e => {
    filters.ownership = e.target.value; applyFilters();
  };

  document.querySelectorAll('.tab').forEach(t=>{
    t.onclick=()=>{
      document.querySelectorAll('.tab,.tab-content')
        .forEach(e=>e.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    };
  });

  map.on('mousemove','buildings',e=>{
    const p=e.features[0].properties;
    document.getElementById('tab-data').innerHTML = `
      ${Object.entries(p).map(([k,v]) =>
        `<div class="row"><span class="label">${k}:</span> ${v ?? '—'}</div>`
      ).join('')}
    `;
  });
}
