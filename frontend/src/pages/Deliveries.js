import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  fetchPendingDeliveriesWithOrders,
  fetchCompletedStats,
  fetchDeliveryHistoryWithOrders,
  deleteDelivery,
  fetchShipments,
  markAsShipped,
  markAsDelivered,
  markAsCancelled,
  // Add this import or implement below
  editDelivery,
  createReturn
} from '../api';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

// Fix default icon issue with Leaflet in React
// (required for proper marker display)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const statusColors = {
  pending: "#ffd600",
  shipped: "#29b6f6",
  delivered: "#43a047",
  cancelled: "#ef5350",
  return: "#ff9800", // Orange for Return
};

function getMarkerIcon(status) {
  const color = statusColors[status] || '#888';
  return L.divIcon({
    className: `custom-marker ${status}`,
    html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid #fff;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function downloadCSV(data, filename) {
  const csvRows = [];
  // Header
  csvRows.push(['ID', 'Recipient', 'Address', 'Status'].join(','));
  // Rows
  data.forEach(row => {
    csvRows.push([
      row.id,
      '"' + (row.recipient || '').replace(/"/g, '""') + '"',
      '"' + (row.address || '').replace(/"/g, '""') + '"',
      row.status
    ].join(','));
  });
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Haversine formula to calculate distance between two lat/lon points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate ETA in minutes given distance (km) and speed (km/h)
function estimateETA(distanceKm, speedKmh = 40) {
  if (!distanceKm || distanceKm === 0) return 'Arrived';
  const hours = distanceKm / speedKmh;
  const minutes = Math.round(hours * 60);
  return minutes <= 1 ? '1 min' : `${minutes} min`;
}

export default function Deliveries() {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);

  const [completedStats, setCompletedStats] = useState({ today: 0, week: 0, month: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const [deliveries, setDeliveries] = useState([]); // for map
  // Replace agentLocations state with agentHistories for tracking movement history
  const [agentHistories, setAgentHistories] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [shipments, setShipments] = useState([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [shipmentsError, setShipmentsError] = useState(null);

  const [statusUpdating, setStatusUpdating] = useState({}); // { [deliveryId]: status }
  const [editModal, setEditModal] = useState({ open: false, delivery: null });
  const [editForm, setEditForm] = useState({ recipient: '', address: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const mapRef = useRef();
  const [focusedDeliveryId, setFocusedDeliveryId] = useState(null);

  // Helper: Find agent and ETA for a delivery
  function getAgentAndETAForDelivery(delivery) {
    let agent = null, eta = null, distance = null;
    Object.entries(agentHistories).forEach(([agentId, history]) => {
      if (!history.length) return;
      const latest = history[history.length - 1];
      if (
        latest.current_order_id &&
        (delivery.order_id === latest.current_order_id || delivery.id === latest.current_order_id)
      ) {
        agent = latest;
        if (delivery.latitude != null && delivery.longitude != null) {
          distance = haversineDistance(latest.lat, latest.lon, delivery.latitude, delivery.longitude);
          eta = estimateETA(distance);
        }
      }
    });
    return { agent, eta, distance };
  }

  // Orders in Transit (shipped)
  const inTransitDeliveries = deliveries.filter(d => d.status === 'shipped');

  // Fetch pending deliveries
  useEffect(() => {
    setPendingLoading(true);
    fetchPendingDeliveriesWithOrders()
      .then(data => {
        setPendingDeliveries(Array.isArray(data) ? data : []);
        setPendingLoading(false);
        setPendingError(null);
      })
      .catch(err => {
        setPendingError('Failed to load pending deliveries');
        setPendingLoading(false);
      });
  }, []);

  // Fetch completed stats
  useEffect(() => {
    setStatsLoading(true);
    fetchCompletedStats()
      .then(data => {
        setCompletedStats(data);
        setStatsLoading(false);
        setStatsError(null);
      })
      .catch(err => {
        setStatsError('Failed to load statistics');
        setStatsLoading(false);
      });
  }, []);

  // Fetch delivery history
  useEffect(() => {
    setHistoryLoading(true);
    fetchDeliveryHistoryWithOrders()
      .then(data => {
        setDeliveryHistory(Array.isArray(data) ? data : []);
        setHistoryLoading(false);
        setHistoryError(null);
      })
      .catch(err => {
        setHistoryError('Failed to load delivery history');
        setHistoryLoading(false);
      });
  }, []);

  // For map: combine pending + history for markers
  useEffect(() => {
    setDeliveries([
      ...pendingDeliveries,
      ...deliveryHistory
    ]);
  }, [pendingDeliveries, deliveryHistory]);

  // WebSocket for real-time agent GPS updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/agents/ws");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // data: [{agent_id, lat, lon, ...}]
        setAgentHistories(prev => {
          const updated = { ...prev };
          data.forEach(agent => {
            if (!updated[agent.agent_id]) updated[agent.agent_id] = [];
            updated[agent.agent_id] = [
              ...(updated[agent.agent_id] || []),
              { lat: agent.lat, lon: agent.lon, timestamp: Date.now(), ...agent }
            ];
            // Limit history length for performance
            if (updated[agent.agent_id].length > 50) {
              updated[agent.agent_id] = updated[agent.agent_id].slice(-50);
            }
          });
          return updated;
        });
      } catch (e) {}
    };
    return () => ws.close();
  }, []);

  // Fetch shipments
  useEffect(() => {
    setShipmentsLoading(true);
    fetchShipments()
      .then(data => {
        setShipments(Array.isArray(data) ? data : []);
        setShipmentsLoading(false);
        setShipmentsError(null);
      })
      .catch(() => {
        setShipmentsError('Failed to load shipments');
        setShipmentsLoading(false);
      });
  }, []);

  // Helper to refresh deliveries after status change
  const refreshDeliveries = () => {
    setPendingLoading(true);
    fetchPendingDeliveriesWithOrders()
      .then(data => {
        setPendingDeliveries(Array.isArray(data) ? data : []);
        setPendingLoading(false);
        setPendingError(null);
      })
      .catch(err => {
        setPendingError('Failed to load pending deliveries');
        setPendingLoading(false);
      });
    setHistoryLoading(true);
    fetchDeliveryHistoryWithOrders()
      .then(data => {
        setDeliveryHistory(Array.isArray(data) ? data : []);
        setHistoryLoading(false);
        setHistoryError(null);
      })
      .catch(err => {
        setHistoryError('Failed to load delivery history');
        setHistoryLoading(false);
      });
  };

  // Button click handlers
  const handleStatusChange = async (deliveryId, action) => {
    setStatusUpdating(prev => ({ ...prev, [deliveryId]: action }));
    try {
      if (action === 'shipped') {
        await markAsShipped(deliveryId);
      } else if (action === 'delivered') {
        await markAsDelivered(deliveryId);
      } else if (action === 'cancelled') {
        await markAsCancelled(deliveryId);
      } else if (action === 'return') {
        await markAsCancelled(deliveryId); // Optionally keep this if needed
        // Find delivery object
        const delivery = pendingDeliveries.find(d => d.id === deliveryId) || deliveryHistory.find(d => d.id === deliveryId);
        if (delivery) {
          const returnData = {
            id: delivery.id.toString(),
            date: new Date().toISOString(),
            customer: delivery.recipient || delivery.order?.customer_name || '',
            status: 'pending',
          };
          try {
            await createReturn(returnData);
          } catch (e) {
            // Optionally handle error
          }
        }
      }
      refreshDeliveries();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [deliveryId]: undefined }));
    }
  };

  // Open edit modal
  const handleEditClick = (delivery) => {
    setEditForm({
      recipient: delivery.recipient || '',
      address: delivery.address || '',
      status: delivery.status || 'pending',
    });
    setEditModal({ open: true, delivery });
    setEditError(null);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save edit
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await editDelivery(editModal.delivery.id, {
        ...editModal.delivery,
        recipient: editForm.recipient,
        address: editForm.address,
        status: editForm.status,
        order_id: editModal.delivery.order_id,
        latitude: editModal.delivery.latitude,
        longitude: editModal.delivery.longitude,
      });
      setEditModal({ open: false, delivery: null });
      refreshDeliveries();
    } catch (err) {
      setEditError('Failed to update delivery');
    } finally {
      setEditLoading(false);
    }
  };

  // Filtered delivery history
  const filteredHistory = deliveryHistory.filter(row => {
    const matchesSearch =
      (row.recipient?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (row.address?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter ? row.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Delete delivery handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;
    try {
      await deleteDelivery(id);
      // Remove from both pending and history if present
      setPendingDeliveries(pendingDeliveries.filter(d => d.id !== id));
      setDeliveryHistory(deliveryHistory.filter(d => d.id !== id));
      setDeliveries(deliveries.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete delivery');
    }
  };

  const tableBg = '#f4f8fb'; // Light blue background for shipment table

  // Add a responsive container style
  const responsiveContainer = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 24,
    boxSizing: 'border-box',
  };
  const flexSection = {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
  };
  const flexColumnMobile = {
    flex: 1,
    minWidth: 320,
    width: '100%',
    boxSizing: 'border-box',
  };
  const mapSectionMobile = {
    flex: 1.3,
    minWidth: 320,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={responsiveContainer}>
      <h2 style={{ marginBottom: 24, fontSize: '2rem' }}>Delivery</h2>
      {/* Orders in Transit Section removed */}
      {/* Top Section: Pending Deliveries & Map */}
      <div style={{ ...flexSection, flexDirection: window.innerWidth < 800 ? 'column' : 'row' }}>
        {/* Pending Deliveries */}
        <div style={{ ...flexColumnMobile, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 20 }}>
          <h3 style={{ fontSize: '1.2rem' }}>Pending Deliveries</h3>
          {pendingLoading ? <div>Loading...</div> : pendingError ? <div style={{ color: 'red' }}>{pendingError}</div> : (
            pendingDeliveries.length === 0 ? <div>No pending deliveries.</div> :
            pendingDeliveries.map((d, i) => {
              const { agent, eta } = getAgentAndETAForDelivery(d);
              return (
                <div key={d.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 2px 8px #0001',
                  padding: 20,
                  marginBottom: 24,
                  gap: 24,
                  minHeight: 120
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
                      {d.recipient} <span style={{ fontWeight: 400, color: '#444' }}>- {d.address}</span>
                      {(eta || agent) && (
                        <span style={{ marginLeft: 12, color: '#5BC0EB', fontWeight: 500, fontSize: 14 }}>
                          {eta && `ETA: ${eta}`}
                          {agent && ` | Agent: ${agent.name}`}
                        </span>
                      )}
                    </div>
                    <div style={{
                      border: '1.5px solid #dbeafe',
                      background: '#f8fbff',
                      borderRadius: 10,
                      padding: 14,
                      fontSize: 15,
                      marginTop: 4,
                      marginBottom: 0,
                      minWidth: 240
                    }}>
                      <div style={{ color: '#3498db', fontWeight: 600, marginBottom: 8, fontSize: 15, cursor: 'pointer' }}>Pending Order Details</div>
                      <div><b>Product:</b> {d.order?.product}</div>
                      <div><b>Customer:</b> {d.order?.customer_name}</div>
                      <div><b>Qty:</b> {d.order?.quantity}</div>
                      <div><b>Status:</b> <span style={{ color: '#333', background: d.status === 'pending' ? statusColors[d.status] : '#eee', borderRadius: 6, padding: '2px 10px', fontWeight: 500 }}>{d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span></div>
                      <div><b>Order Date:</b> {d.order?.created_at ? new Date(d.order.created_at).toLocaleString() : '-'}</div>
                    </div>
                  </div>
                  {/* Status Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginLeft: 24, minWidth: 120, alignItems: 'flex-end', justifyContent: 'center' }}>
                    <button
                      style={{
                        width: 110,
                        background: '#ffd600',
                        color: '#333',
                        border: 'none',
                        borderRadius: 24,
                        fontWeight: 700,
                        padding: '7px 0',
                        fontSize: 16,
                        boxShadow: '0 2px 8px #0002',
                        cursor: d.status === 'pending' || statusUpdating[d.id] ? 'not-allowed' : 'pointer',
                        opacity: statusUpdating[d.id] && statusUpdating[d.id] !== 'pending' ? 0.6 : 1,
                        marginBottom: 0
                      }}
                      disabled={d.status === 'pending' || !!statusUpdating[d.id]}
                    >Pending</button>
                    <button
                      style={{
                        width: 110,
                        background: '#29b6f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 24,
                        fontWeight: 700,
                        padding: '7px 0',
                        fontSize: 16,
                        boxShadow: '0 2px 8px #0002',
                        cursor: d.status === 'shipped' || statusUpdating[d.id] ? 'not-allowed' : 'pointer',
                        opacity: statusUpdating[d.id] && statusUpdating[d.id] !== 'shipped' ? 0.6 : 1,
                        marginBottom: 0
                      }}
                      disabled={d.status === 'shipped' || !!statusUpdating[d.id]}
                      onClick={() => handleStatusChange(d.id, 'shipped')}
                    >{statusUpdating[d.id] === 'shipped' ? 'Updating...' : 'Shipped'}</button>
                    <button
                      style={{
                        width: 110,
                        background: '#43a047',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 24,
                        fontWeight: 700,
                        padding: '7px 0',
                        fontSize: 16,
                        boxShadow: '0 2px 8px #0002',
                        cursor: d.status === 'delivered' || statusUpdating[d.id] ? 'not-allowed' : 'pointer',
                        opacity: statusUpdating[d.id] && statusUpdating[d.id] !== 'delivered' ? 0.6 : 1,
                        marginBottom: 0
                      }}
                      disabled={d.status === 'delivered' || !!statusUpdating[d.id]}
                      onClick={() => handleStatusChange(d.id, 'delivered')}
                    >{statusUpdating[d.id] === 'delivered' ? 'Updating...' : 'Delivered'}</button>
                    <button
                      style={{
                        width: 110,
                        background: '#ef5350',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 24,
                        fontWeight: 700,
                        padding: '7px 0',
                        fontSize: 16,
                        boxShadow: '0 2px 8px #0002',
                        cursor: d.status === 'cancelled' || statusUpdating[d.id] ? 'not-allowed' : 'pointer',
                        opacity: statusUpdating[d.id] && statusUpdating[d.id] !== 'cancelled' ? 0.6 : 1,
                        marginBottom: 0
                      }}
                      disabled={d.status === 'cancelled' || !!statusUpdating[d.id]}
                      onClick={() => handleStatusChange(d.id, 'cancelled')}
                    >{statusUpdating[d.id] === 'cancelled' ? 'Updating...' : 'Cancelled'}</button>
                    <button
                      style={{
                        width: 110,
                        background: '#ff9800',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 24,
                        fontWeight: 700,
                        padding: '7px 0',
                        fontSize: 16,
                        boxShadow: '0 2px 8px #0002',
                        cursor: d.status === 'return' || statusUpdating[d.id] ? 'not-allowed' : 'pointer',
                        opacity: statusUpdating[d.id] && statusUpdating[d.id] !== 'return' ? 0.6 : 1,
                        marginBottom: 0
                      }}
                      disabled={d.status === 'return' || !!statusUpdating[d.id]}
                      onClick={() => handleStatusChange(d.id, 'return')}
                    >{statusUpdating[d.id] === 'return' ? 'Updating...' : 'Return'}</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Delivery Map */}
        <div style={{ ...mapSectionMobile, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 20, marginTop: window.innerWidth < 800 ? 24 : 0 }}>
          <h3 style={{ fontSize: '1.2rem' }}>Delivery Map</h3>
          <div style={{ width: '100%', minWidth: 260 }}>
            <MapContainer
              center={[22.5937, 78.9629]}
              zoom={5}
              style={{ height: window.innerWidth < 600 ? 220 : 300, width: '100%' }}
              whenCreated={mapInstance => { mapRef.current = mapInstance; }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              {Array.isArray(deliveries) ? deliveries
                .filter((d) => d && d.latitude != null && d.longitude != null)
                .map((d) => (
                  <Marker
                    key={d.id}
                    position={[d.latitude, d.longitude]}
                    icon={d.status === 'shipped' ? L.divIcon({
                      className: `custom-marker shipped animate`,
                      html: `<div style="background:#29b6f6;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px #5BC0EB88;animation:marker-pulse 1.2s infinite alternate;display:flex;align-items:center;justify-content:center;font-size:20px;">🚚</div>`
                    }) : getMarkerIcon(d.status)}
                    opacity={focusedDeliveryId === d.id ? 1 : 0.85}
                  >
                    <Popup>
                      <strong>{d.recipient}</strong>
                      <br />
                      {d.address}
                      <br />
                      Status: {d.status}
                      {d.order && (
                        <>
                          <br />
                          <strong>Order Info:</strong>
                          <br />
                          Product: {d.order.product}
                          <br />
                          Customer: {d.order.customer_name}
                          <br />
                          Quantity: {d.order.quantity}
                        </>
                      )}
                    </Popup>
                  </Marker>
                )) : null}
              {/* Agent Markers and Paths */}
              {Object.entries(agentHistories).map(([agentId, history]) => {
                if (!history.length) return null;
                const latest = history[history.length - 1];
                const path = history.map(pos => [pos.lat, pos.lon]);

                // Find delivery being handled by this agent (if any)
                let delivery = null;
                if (latest.current_order_id) {
                  delivery = deliveries.find(d => d.order_id === latest.current_order_id || d.id === latest.current_order_id);
                }
                let distance = null, eta = null;
                if (delivery && delivery.latitude != null && delivery.longitude != null) {
                  distance = haversineDistance(latest.lat, latest.lon, delivery.latitude, delivery.longitude);
                  eta = estimateETA(distance);
                }

                return (
                  <React.Fragment key={agentId}>
                    <Polyline positions={path} color="#5BC0EB" />
                    <Marker
                      position={[latest.lat, latest.lon]}
                      icon={L.divIcon({
                        className: 'agent-marker',
                        html: `<div style="background:#5BC0EB;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#333;font-size:18px;">🧑‍💼</div>`
                      })}
                      eventHandlers={{
                        click: () => {
                          if (delivery) setFocusedDeliveryId(delivery.id);
                        }
                      }}
                      opacity={delivery && focusedDeliveryId === delivery.id ? 1 : 0.85}
                    >
                      <Popup>
                        <strong>{latest.name}</strong><br/>
                        Status: {latest.status}
                        {latest.current_order_id && (
                          <>
                            <br />
                            <b>Delivering Order:</b> {latest.current_order_id}
                            {distance != null && (
                              <>
                                <br />
                                <b>Distance to destination:</b> {distance.toFixed(2)} km
                                <br />
                                <b>ETA:</b> {eta}
                              </>
                            )}
                          </>
                        )}
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
          {/* Color Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ffd600', border: '2px solid #fff', display: 'inline-block' }}></span>
              Pending
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#29b6f6', border: '2px solid #fff', display: 'inline-block' }}></span>
              Shipped
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#43a047', border: '2px solid #fff', display: 'inline-block' }}></span>
              Delivered
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef5350', border: '2px solid #fff', display: 'inline-block' }}></span>
              Cancelled
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ff9800', border: '2px solid #fff', display: 'inline-block' }}></span>
              Return
            </span>
            {/* Agent Legend */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#5BC0EB', border: '2px solid #fff', display: 'inline-block', textAlign: 'center' }}>🧑‍💼</span>
              Agent
            </span>
          </div>
        </div>
      </div>
      {/* Completed Statistics */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 20, marginBottom: 24, maxWidth: 500 }}>
        <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0, marginBottom: 12 }}>Completed Statistics</h3>
        {statsLoading ? <div>Loading...</div> : statsError ? <div style={{ color: 'red' }}>{statsError}</div> : (
          <div style={{ fontSize: 16, color: '#222', lineHeight: 1.7 }}>
            Deliveries Today: {completedStats.today}<br />
            Deliveries This Week: {completedStats.week}<br />
            Deliveries This Month: {completedStats.month}
          </div>
        )}
      </div>
      {/* Delivery History */}
      <Box sx={{ background: '#f4f8fb', borderRadius: 3, boxShadow: 2, p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>Delivery History</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by recipient or address"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'background.paper', borderRadius: 2, p: 0.5 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={e => setStatusFilter(e.target.value)}
              renderValue={selected =>
                selected ? (
                  <Chip
                    label={selected.charAt(0).toUpperCase() + selected.slice(1)}
                    color={
                      selected === 'pending' ? 'warning' :
                      selected === 'shipped' ? 'info' :
                      selected === 'delivered' ? 'success' :
                      selected === 'cancelled' ? 'error' :
                      selected === 'return' ? 'default' : 'default'
                    }
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                ) : 'All'
              }
            >
              <MenuItem value="">
                <Chip label="All" size="small" />
              </MenuItem>
              <MenuItem value="pending">
                <Chip label="Pending" color="warning" size="small" />
              </MenuItem>
              <MenuItem value="shipped">
                <Chip label="Shipped" color="info" size="small" />
              </MenuItem>
              <MenuItem value="delivered">
                <Chip label="Delivered" color="success" size="small" />
              </MenuItem>
              <MenuItem value="cancelled">
                <Chip label="Cancelled" color="error" size="small" />
              </MenuItem>
              <MenuItem value="return">
                <Chip label="Return" style={{ backgroundColor: '#ff9800', color: '#fff' }} size="small" />
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<span role="img" aria-label="export">📄</span>}
            onClick={() => downloadCSV(filteredHistory, 'deliveries.csv')}
          >
            Export Deliveries (CSV)
          </Button>
        </Box>
        <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
          {historyLoading ? (
            <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>Loading...</Typography>
          ) : historyError ? (
            <Typography variant="body1" color="error" sx={{ mt: 4, textAlign: 'center' }}>{historyError}</Typography>
          ) : filteredHistory.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>No deliveries found.</Typography>
          ) : (
            <DataGrid
              rows={filteredHistory.map(row => ({ ...row, id: row.id }))}
              columns={[
                { field: 'id', headerName: 'ID', width: 90 },
                { field: 'recipient', headerName: 'Recipient', flex: 1 },
                { field: 'address', headerName: 'Address', flex: 1 },
                {
                  field: 'status',
                  headerName: 'Status',
                  width: 140,
                  renderCell: (params) => (
                    <Chip
                      label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
                      color={
                        params.value === 'pending' ? 'warning' :
                        params.value === 'shipped' ? 'info' :
                        params.value === 'delivered' ? 'success' :
                        params.value === 'cancelled' ? 'error' :
                        params.value === 'return' ? 'default' : 'default'
                      }
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  ),
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 120,
                  renderCell: (params) => (
                    <>
                      <Button onClick={() => handleEditClick(params.row)} size="small" sx={{ minWidth: 0, mr: 1 }}><span role="img" aria-label="edit">✏️</span></Button>
                      <Button onClick={() => handleDelete(params.row.id)} size="small" color="error" sx={{ minWidth: 0 }}><span role="img" aria-label="delete">🗑️</span></Button>
                    </>
                  ),
                  sortable: false,
                  filterable: false,
                },
              ]}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
            />
          )}
        </Box>
      </Box>
      {/* Edit Modal */}
      {editModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px #0002', position: 'relative' }}>
            <h3 style={{ marginTop: 0 }}>Edit Delivery</h3>
            <label style={{ display: 'block', marginBottom: 10 }}>
              Recipient:<br />
              <input name="recipient" value={editForm.recipient} onChange={handleEditChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'block', marginBottom: 10 }}>
              Address:<br />
              <input name="address" value={editForm.address} onChange={handleEditChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'block', marginBottom: 18 }}>
              Status:<br />
              <select name="status" value={editForm.status} onChange={handleEditChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="return">Return</option>
              </select>
            </label>
            {editError && <div style={{ color: 'red', marginBottom: 10 }}>{editError}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditModal({ open: false, delivery: null })} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#333', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} style={{ padding: '6px 18px', borderRadius: 4, border: '1px solid #43a047', background: '#43a047', color: '#fff', fontWeight: 600 }}>{editLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 