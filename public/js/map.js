mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates,
  zoom: 9,
});


// Create marker
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `<h4>${listingLocation}</h4>
         <p>Exact location will be provided after booking.</p>`
      )
      .setMaxWidth("300px")
  )
  .addTo(map);
