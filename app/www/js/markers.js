var map_markers = {};

map_markers["marker_leaflet_blue"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-leaflet-blue.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-leaflet-blue.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

map_markers["marker_leaflet_red"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-leaflet-red.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-leaflet-red.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

map_markers["marker_leaflet_orange"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-leaflet-orange.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-leaflet-orange.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

map_markers["marker_leaflet_green"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-leaflet-green.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-leaflet-green.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

map_markers["marker_leaflet_gray"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-leaflet-gray.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-leaflet-gray.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

map_markers["marker_leaflet_black"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-leaflet-black.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-leaflet-black.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

map_markers["marker_taxiplainfront_black"] = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-driver.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-driver.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow-driver.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow-driver.png',
    shadowSize: [46, 41],
    shadowAnchor: [10, 41]
});

var icon_pickupcreate = window.config.design.map.ico_pickupcreate.style.select_pickup_marker;
var iconCreate = map_markers[icon_pickupcreate];
var iconAssign = map_markers[icon_pickupcreate];
var iconWaiting = map_markers[icon_pickupcreate];
var iconDriving = map_markers[icon_pickupcreate];
var iconComplete = map_markers[icon_pickupcreate];
var iconCanceled = map_markers[icon_pickupcreate];
var iconDriver = map_markers[icon_pickupcreate];
