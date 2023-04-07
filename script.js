'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Geolocation - Browser API
// 1 callback succcess, 2 callback error
if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
    (position)=>{
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
   
        // we will use LEAFLET - JS Library for Mobile-Friendly Interactive Maps
        // Leaflet js works for openstreetmap, also for any other kind of maps (Google maps for e.)
   
        const map = L.map('map').setView(coords, 13); // first arg are coordinates, second (number 13) is zoom-in out to map

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        L.marker(coords).addTo(map)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();
   
   
    }, ()=> alert('Could not get your position Baan, because of permision')
);
}
