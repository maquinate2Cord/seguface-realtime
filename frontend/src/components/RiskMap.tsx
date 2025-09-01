'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const Map = dynamic(async () => {
  const L = await import('react-leaflet');
  return ({ events }: { events: { lat:number; lng:number; severity:number; type:string; ts:number; userId:string }[] }) => {
    const { MapContainer, TileLayer, CircleMarker, Tooltip } = L as any;
    const center = [-34.6037, -58.3816] as [number, number];
    return (
      <div className="card p-2 h-[28rem]">
        <h3 className="text-lg font-semibold mb-2 px-2">Mapa de eventos de riesgo</h3>
        <MapContainer center={center} zoom={12} style={{ height: 'calc(100% - 2.5rem)', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {events.map((e, idx) => (
            <CircleMarker key={idx} center={[e.lat, e.lng]} radius={6 + e.severity}
              pathOptions={{ color: e.severity >= 4 ? '#ef4444' : '#f59e0b' }}>
              <Tooltip>
                <div className="text-xs">
                  <div><b>{e.type}</b> • sev {e.severity}</div>
                  <div>user: {e.userId}</div>
                  <div>{new Date(e.ts).toLocaleTimeString()}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    );
  };
}, { ssr: false });

export default function RiskMapWrapper({ events }:{ events: { lat:number; lng:number; severity:number; type:string; ts:number; userId:string }[] }){
  // dynamic import wrapper
  // @ts-ignore
  return <Map events={events} />;
}