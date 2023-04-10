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

let map, mapEvent;

class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();

  constructor(coords, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace = this.calcPace();
  }

  calcPace() {
    // min/km
    return this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.speed = this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    return this.distance / (this.duration / 60);
  }
}

const run = new Running([49, -12], 5.2, 24, 178);
const cyc = new Cycling([49, -12], 27, 95, 522);

///////////////
// APPLICATION ARCHITECTURE

class App {
  // private properties
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
  }

  _getPosition() {
    // Geolocation - Browser API
    // 1 callback succcess, 2 callback error
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Could not get your position Baan, because of permision')
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    // we will use LEAFLET - JS Library for Mobile-Friendly Interactive Maps
    // Leaflet js works for openstreetmap, also for any other kind of maps (Google maps for e.)

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); // first arg are coordinates, second (number 13) is zoom-in out to map

    // console.log(map)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // .on() is built in method of LEAFLET JS
    // here we will attach event handler, takes 3 params
    // Params: 1. event 2. callback f 3. options

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // prevent form submitting default behavior
    e.preventDefault();

    // HELPER function to check if inputs are VALID
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    // and HELPER to check if inputs are positive
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from FORM

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running create running object else create cycling obj

    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid

      // we will use GUARD type, guard is opposite -> and if opposite is true we return
      // function immediately
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input has to be positive number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Input has to be positive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);

    // render workout on map as marker
    this._renderWorkoutMarker(workout);

    // render workout as list element
    this._renderWorkout(workout);

    // Clear input fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords) //create marker based on given coords
      .addTo(this.#map) // add it to our map
      .bindPopup(
        L.popup({
          // with bind method we will attach container to our marker
          // container will have all this options below
          // and will serve as aditional info about the workout
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.distance.toString()) // message that will follow our marker
      .openPopup(); // function that on click opens our pop up content
  }

  _moveToPopup(e){

    // creating method to move marker with animation on the Map when we pick element from the list

    const workoutElement = e.target.closest('.workout'); // select parent element
    
    if(!workoutElement) return; // if doesn't exist, close function
    
    const workout = this.#workouts.find(wo => wo.id === workoutElement.dataset.id); // find element from the list which id is equal to dataset-id of an element
    
    // render it on map with given coordinates
    // setView() is built in function of Leaflet JS
   
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan:{
        duration: 1
      }
    })
    
  }

  _renderWorkout(workout) {
    const html = `
    <li class="workout workout--${workout.type}" data-id=${workout.id}>
          <h2 class="workout__title">${workout.type} on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : ' 🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              workout.type === 'running'
                ? workout.pace.toFixed(1)
                : workout.speed.toFixed(1)
            }</span>
            <span class="workout__unit">${
              workout.type === 'running' ? 'min/km' : 'km/h'
            }</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🦶🏼' : '⛰'
            }</span>
            <span class="workout__value">${
              workout.type === 'running'
                ? workout.cadence
                : workout.elevationGain
            }</span>
            <span class="workout__unit">
            ${workout.type === 'running' ? 'spm' : 'm'}</span>
          </div>
        </li>
    `;

    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();
