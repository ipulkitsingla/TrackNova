import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';

export default function LiveMap({ liveData }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const stationLayerRef = useRef(null);

  const {
    latitude,
    longitude,
    train_number,
    train_name,
    speed_kmph = 0,
    current_station_name,
    current_station_code,
    stations = []
  } = liveData || {};

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // Initialize Map Once on Mount
  useEffect(() => {
    if (!mapRef.current) return;

    // If DOM already has a leaflet instance, clear it
    if (mapRef.current._leaflet_id) {
      delete mapRef.current._leaflet_id;
    }

    const defaultLat = hasCoords ? latitude : 20.5937;
    const defaultLng = hasCoords ? longitude : 78.9629;
    const defaultZoom = hasCoords ? 10 : 5;

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
    });

    // Primary Tile Layer: CartoDB Voyager / Dark
    const primaryTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    // Fallback to standard OpenStreetMap if CartoDB fails
    primaryTiles.on('tileerror', () => {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    });

    const stationLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    stationLayerRef.current = stationLayer;

    // Trigger invalidateSize after initial paint so map tiles fill container
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Watch for container resize (e.g. mobile tab changes)
    let resizeObserver = null;
    if (window.ResizeObserver && mapRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline, Stations & Train Marker whenever liveData changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // 1. Draw Route Polyline & intermediate Stations
    if (stations && stations.length > 0) {
      const validPoints = stations
        .filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude) && !isNaN(s.longitude))
        .map(s => [s.latitude, s.longitude]);

      if (validPoints.length > 1) {
        if (routePolylineRef.current) {
          map.removeLayer(routePolylineRef.current);
        }
        routePolylineRef.current = L.polyline(validPoints, {
          color: '#0284c7',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 6'
        }).addTo(map);
      }

      // Add Station markers
      if (stationLayerRef.current) {
        stationLayerRef.current.clearLayers();
        stations.forEach(s => {
          if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
            const isStopping = s.is_stopping;
            const isDeparted = s.has_departed;
            const isNext = s.station_code === liveData?.next_stop?.station_code;

            const marker = L.circleMarker([s.latitude, s.longitude], {
              radius: isNext ? 7 : isStopping ? 5 : 3,
              fillColor: isNext ? '#f59e0b' : isDeparted ? '#10b981' : isStopping ? '#38bdf8' : '#64748b',
              color: '#0f172a',
              weight: 2,
              fillOpacity: 0.95
            });

            marker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px; padding: 4px; line-height: 1.5;">
                <div style="font-weight: 800; color: #0284c7; font-size: 13px;">${s.station_code} - ${s.station_name}</div>
                ${s.platform_number ? `<div>Platform: <strong>${s.platform_number}</strong></div>` : ''}
                <div>Scheduled: <strong>${s.scheduled_arrival || s.scheduled_departure ? new Date(s.scheduled_arrival || s.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</strong></div>
                ${s.eta ? `<div>Estimated: <strong>${new Date(s.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>` : ''}
                <div style="margin-top: 4px; font-weight: bold; color: ${isDeparted ? '#10b981' : isNext ? '#f59e0b' : '#64748b'};">
                  ${isDeparted ? '✓ Departed' : isNext ? '➔ Next Halting Station' : isStopping ? 'Scheduled Stop' : 'Passing Station'}
                </div>
              </div>
            `);
            stationLayerRef.current.addLayer(marker);
          }
        });
      }
    }

    // 2. Draw / Update Live Train GPS Marker
    if (hasCoords) {
      const trainIcon = L.divIcon({
        className: 'custom-train-marker',
        html: `
          <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 48px; height: 48px; border-radius: 9999px; background: rgba(14, 165, 233, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 34px; height: 34px; border-radius: 9999px; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.8); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20"/>
                <path d="m19 12-7-9-7 9 7 9 7-9Z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      if (trainMarkerRef.current) {
        trainMarkerRef.current.setLatLng([latitude, longitude]);
      } else {
        trainMarkerRef.current = L.marker([latitude, longitude], { icon: trainIcon, zIndexOffset: 1000 }).addTo(map);
      }

      trainMarkerRef.current.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; padding: 4px; line-height: 1.5;">
          <div style="font-weight: 800; color: #0284c7;">${train_number} - ${train_name}</div>
          <div>Current Station: <strong>${current_station_name} (${current_station_code})</strong></div>
          <div>Live Speed: <strong style="color: #10b981;">${speed_kmph} km/h</strong></div>
          <div>GPS: <strong>${latitude.toFixed(4)}, ${longitude.toFixed(4)}</strong></div>
        </div>
      `);
    }

  }, [latitude, longitude, stations, hasCoords, speed_kmph, train_number, train_name, current_station_name, current_station_code]);

  // Handler: Center on Train
  const handleRecenter = () => {
    if (mapInstanceRef.current && hasCoords) {
      mapInstanceRef.current.flyTo([latitude, longitude], 12, { duration: 1.2 });
    }
  };

  // Handler: Fit Entire Route on Screen
  const handleFitRoute = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      const bounds = routePolylineRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        
        {/* Map Header Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white">Live GPS Radar</span>
          <span className="text-xs text-sky-400 font-mono font-bold">• {speed_kmph} km/h</span>
          {hasCoords && (
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
              ({latitude.toFixed(2)}, {longitude.toFixed(2)})
            </span>
          )}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {hasCoords && (
            <button
              onClick={handleRecenter}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
              title="Center on Train Location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          )}
          {stations && stations.length > 0 && (
            <button
              onClick={handleFitRoute}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
              title="Fit Full Route on Map"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleZoomIn}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Leaflet Map DOM Element */}
        <div 
          ref={mapRef} 
          className="w-full h-80 sm:h-96 z-10" 
          style={{ minHeight: '320px', width: '100%' }}
        />

        {!hasCoords && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
            <p className="text-sm font-bold text-white">GPS Coordinates Pending</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Live coordinate telemetry is synchronizing from IRCTC/Railcore data feeds.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
