mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});

//  Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates) //listing.geometry.coordinates  we saved here
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `<h4>${listingLocation}</h4> <p>Exact location wil be provided after booking.</p>`
      )
      .setMaxWidth("300px")
      .addTo(map)
  )
  .addTo(map);
