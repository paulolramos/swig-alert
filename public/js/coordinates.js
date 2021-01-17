/* eslint-disable @typescript-eslint/no-unused-vars */
function getLocationCoordinates() {
  const locationInput = document.querySelector('#beverage-location');
  const submitButton = document.querySelector('button[type="submit"]');
  const message = document.querySelector('#coordinates-message');
  const latitudeHiddenInput = document.querySelector('#latitude');
  const longitudeHiddenInput = document.querySelector('#longitude');

  if (locationInput.checked) {
    if (navigator.geolocation) {
      message.innerText = 'Getting your location...';
      submitButton.disabled = true;

      navigator.geolocation.getCurrentPosition(
        function (position) {
          latitudeHiddenInput.value = position.coords.latitude;
          longitudeHiddenInput.value = position.coords.longitude;
          message.innerText = '';
          submitButton.disabled = false;
        },
        function (err) {
          locationInput.checked = false;
          message.innerText = `Error: ${err.message}.`;
          submitButton.disabled = false;
        },
        { enableHighAccuracy: true },
      );
    } else {
      locationInput.checked = false;
      message.innerText = 'Location Service is not available.';
      submitButton.disabled = false;
    }
  }
}

function updateMap(event) {
  const mapElement = document.querySelector('#gmap-session');
  const parentElement = event.currentTarget;
  const longitudeAttr = parentElement.getAttribute('data-longitude');
  const latitudeAttr = parentElement.getAttribute('data-latitude');
  if (longitudeAttr && latitudeAttr) {
    mapElement.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBEVls8sb_7gwDYUfJjrDOvXjR6h-ogNoE&q=${latitudeAttr}+${longitudeAttr}`;
  } else {
    return;
  }
}
