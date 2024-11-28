const initialFocus = [55.819758, 37.530415];
const initialZoom = 18;
const map = L.map('map', {
    center: initialFocus,
    zoom: initialZoom,
    minZoom: 17,
    maxZoom: 18
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

const southWest = L.latLng(55.817240, 37.537840);
const northEast = L.latLng(55.821547, 37.523271);
const bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);

map.on('dragend', function () {
    if (!bounds.contains(map.getCenter())) {
        map.setView(bounds.getCenter());
    }
});

const routeCoords = {
  chief: [
      [55.819445, 37.528900],
      [55.819520, 37.528900],
      [55.819560, 37.529235],
      [55.819690, 37.529248],
      [55.820045, 37.529670],
      [55.820245, 37.529595],
      [55.820335, 37.529685],
      [55.820360, 37.529890],
      [55.820337, 37.530050],
      [55.820220, 37.530155],
      [55.820195, 37.529970],
  ],
  management: [
      [55.819445, 37.528900],
      [55.819520, 37.528900],
      [55.819560, 37.529235],
      [55.819690, 37.529248],
      [55.820045, 37.529670],
      [55.820245, 37.529595],
      [55.820335, 37.529685],
      [55.820360, 37.529890],
      [55.820337, 37.530050],
      [55.820220, 37.530155],
      [55.820195, 37.529970],
  ],
  hospitalizationWaitingRoom: [
      [55.819445, 37.528900],
      [55.819520, 37.528900],
      [55.819560, 37.529235],
      [55.819690, 37.529248],
      [55.820045, 37.529670],
      [55.820245, 37.529595],
      [55.820335, 37.529685],
      [55.820360, 37.529890],
      [55.820337, 37.530050],
      [55.820170, 37.530200],
      [55.820275, 37.531100],
      [55.820612, 37.530990],
      [55.820593, 37.530820],
  ],
  AdultСlinic: [
      [55.819445, 37.528900],
      [55.819520, 37.528900],
      [55.819520, 37.528887],
      [55.819560, 37.528873],
      [55.819600, 37.528825],
      [55.819635, 37.528696],
      [55.819635, 37.528605],
      [55.819665, 37.528605], 
  ],
  adultReceptionDepartment: [
      [55.819445, 37.528900],
      [55.819520, 37.528900],
      [55.819560, 37.529235],
      [55.819690, 37.529248],
      [55.820045, 37.529670],
      [55.820245, 37.529595],
      [55.820335, 37.529685],
      [55.820360, 37.529890],
      [55.820337, 37.530050],
      [55.820170, 37.530200],
      [55.820275, 37.531100],
      [55.820558, 37.531005],
      [55.820625, 37.531683],
      [55.820386, 37.531540],   
  ],
  mainBuilding: [
      [55.819445, 37.528900],
      [55.819520, 37.528900],
      [55.819560, 37.529235],
      [55.819690, 37.529248],
      [55.820045, 37.529670],
      [55.820245, 37.529595],
      [55.820335, 37.529685],
      [55.820360, 37.529890],
      [55.820337, 37.530050],
      [55.820170, 37.530200],
      [55.820228, 37.530707],
      [55.820160, 37.530725],
  ],
  childrenDepartment: [
      [55.819445, 37.528900],
      [55.819440, 37.528753],
      [55.819230, 37.528820],
      [55.819340, 37.529995],
      [55.818785, 37.530260],
      [55.818897, 37.531190],
      [55.818963, 37.531166],
  ],
};

let isAnimating = false;
let endMarker = null;
const routes = {};

function interpolatePoints(points, steps) {
    let interpolated = [];
    for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        interpolated.push(start);
        for (let j = 1; j < steps; j++) {
            const lat = start[0] + (end[0] - start[0]) * (j / steps);
            const lng = start[1] + (end[1] - start[1]) * (j / steps);
            interpolated.push([lat, lng]);
        }
    }
    interpolated.push(points[points.length - 1]);
    return interpolated;
}

for (let key in routeCoords) {
    routes[key] = {
        coords: interpolatePoints(routeCoords[key], 20),
        polyline: L.polyline([], { color: 'blue', opacity: 0.5 }).addTo(map)
    };
}

const startMarkerIcon = L.icon({
    iconUrl: './img/kiosk.svg',
    iconSize: [32, 40],
    iconAnchor: [16, 32],
    popupAnchor: [78, 40]
});

const endMarkerIcon = L.icon({
    iconUrl: './img/door.svg',
    iconSize: [32, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const customPopupContent = `
    <div style="text-align: center;">
        <h3>Вы здесь</h3>
    </div>
`;

const startMarker = L.marker(routeCoords.chief[0], { icon: startMarkerIcon })
    .addTo(map)
    .bindPopup(customPopupContent)
    .openPopup();

function animateRoute(routeKey, endMarkerText) {
    if (isAnimating) return;
    isAnimating = true;

    map.setView(initialFocus, initialZoom);

    for (let key in routes) {
        routes[key].polyline.setLatLngs([]);
    }

    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }

    const buttonsContainer = document.querySelector('#route-buttons');
    buttonsContainer.classList.add('hidden');

    startMarker.closePopup();

    routes[routeKey].polyline.setLatLngs([]);
    let index = 0;
    const speed = 20;

    const interval = setInterval(() => {
        if (index < routes[routeKey].coords.length) {
            routes[routeKey].polyline.addLatLng(routes[routeKey].coords[index]);
            index++;
        } else {
            clearInterval(interval);

            const endCoords = routes[routeKey].coords[routes[routeKey].coords.length - 1];

            endMarker = L.marker(endCoords, { icon: endMarkerIcon })
                .addTo(map).bindPopup(endMarkerText).openPopup();

            setTimeout(() => {
                map.setView(endCoords, map.getZoom());
            }, 100);

            startMarker.openPopup();
            buttonsContainer.classList.remove('hidden');
            isAnimating = false;
        }
    }, speed);
}

function resetMap() {
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    
    for (let key in routes) {
        routes[key].polyline.setLatLngs([]);
    }

    startMarker.openPopup();
}

let inactivityTimer = null;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(resetMap, 60000);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);

document.querySelector('#chief').addEventListener('click', () => {
    animateRoute('chief', 'Отдел главного врача');
});

document.querySelector('#management').addEventListener('click', () => {
    animateRoute('management', 'Дирекция');
});

document.querySelector('#hospitalizationWaitingRoom').addEventListener('click', () => {
    animateRoute('hospitalizationWaitingRoom', 'Зал ожидания госпитализации');
});

document.querySelector('#AdultСlinic').addEventListener('click', () => {
    animateRoute('AdultСlinic', 'Взрослая поликлиника');
});

document.querySelector('#adultReceptionDepartment').addEventListener('click', () => {
    animateRoute('adultReceptionDepartment', 'Взрослое приемное отделение');
});

document.querySelector('#mainBuilding').addEventListener('click', () => {
    animateRoute('mainBuilding', 'Главный корпус');
});

document.querySelector('#childrenDepartment').addEventListener('click', () => {
    animateRoute('childrenDepartment', 'Детское приемное отделение / поликлиника');
});
