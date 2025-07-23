import { useEffect, useRef, useState } from "react";

const EBIRD_API_KEY = "679opnhtujv";

const STATES = [
  { code: "IN", name: "All India" },
  { code: "IN-AP", name: "Andhra Pradesh" },
  { code: "IN-AR", name: "Arunachal Pradesh" },
  { code: "IN-AS", name: "Assam" },
  { code: "IN-BR", name: "Bihar" },
  { code: "IN-CT", name: "Chhattisgarh" },
  { code: "IN-GA", name: "Goa" },
  { code: "IN-GJ", name: "Gujarat" },
  { code: "IN-HR", name: "Haryana" },
  { code: "IN-HP", name: "Himachal Pradesh" },
  { code: "IN-JH", name: "Jharkhand" },
  { code: "IN-KA", name: "Karnataka" },
  { code: "IN-KL", name: "Kerala" },
  { code: "IN-MP", name: "Madhya Pradesh" },
  { code: "IN-MH", name: "Maharashtra" },
  { code: "IN-MN", name: "Manipur" },
  { code: "IN-ML", name: "Meghalaya" },
  { code: "IN-MZ", name: "Mizoram" },
  { code: "IN-NL", name: "Nagaland" },
  { code: "IN-OR", name: "Odisha" },
  { code: "IN-PB", name: "Punjab" },
  { code: "IN-RJ", name: "Rajasthan" },
  { code: "IN-SK", name: "Sikkim" },
  { code: "IN-TN", name: "Tamil Nadu" },
  { code: "IN-TG", name: "Telangana" },
  { code: "IN-TR", name: "Tripura" },
  { code: "IN-UP", name: "Uttar Pradesh" },
  { code: "IN-UT", name: "Uttarakhand" },
  { code: "IN-WB", name: "West Bengal" },
  { code: "IN-AN", name: "Andaman and Nicobar Islands" },
  { code: "IN-CH", name: "Chandigarh" },
  { code: "IN-DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "IN-DL", name: "Delhi" },
  { code: "IN-JK", name: "Jammu and Kashmir" },
  { code: "IN-LA", name: "Ladakh" },
  { code: "IN-LD", name: "Lakshadweep" },
  { code: "IN-PY", name: "Puducherry" },
];

export function Welcome() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedState, setSelectedState] = useState("IN");
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedBird, setSelectedBird] = useState<any>(null);
  const [allSightings, setAllSightings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [openPopupIndex, setOpenPopupIndex] = useState<number | null>(null);

  // Filtered sightings based on search
  const filteredSightings = allSightings.filter(obs => {
    const q = search.toLowerCase();
    return (
      obs.comName?.toLowerCase().includes(q) ||
      obs.locName?.toLowerCase().includes(q) ||
      obs.userDisplayName?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    let map: any;
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      const greenIcon = new (L as any).default.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      if (mapRef.current && !mapInstance.current) {
        map = (L as any).default.map(mapRef.current).setView([20.5937, 78.9629], 5);
        mapInstance.current = map;
        (L as any).default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        (L as any).default.marker([20.5937, 78.9629], {
          icon: greenIcon,
          title: "Bird Location"
        })
          .addTo(map)
          .bindPopup("India - Bird Map Demo")
          .openPopup();
      }
    });
    return () => {
      if (mapInstance.current) mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  // Show only filtered markers on the map
  useEffect(() => {
    if (!mapInstance.current) return;
    Promise.all([
      import("leaflet"),
    ]).then(([L]) => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      const greenIcon = new (L as any).default.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      filteredSightings.forEach((obs: any, i: number) => {
        if (obs.lat && obs.lng) {
          const marker = (L as any).default.marker([obs.lat, obs.lng], { icon: greenIcon, title: obs.comName })
            .addTo(mapInstance.current)
            .on('click', () => {
              setSelectedBird(obs);
              setOpenPopupIndex(i);
              markersRef.current.forEach((m, idx) => {
                if (idx !== i) m.closePopup();
              });
              marker.openPopup();
            })
            .bindPopup(`<b>${obs.comName}</b><br/><i>${obs.locName}</i><br/>${obs.obsDt}`);
          markersRef.current.push(marker);
        }
      });
    });
  }, [filteredSightings, selectedState]);

  // Fetch all sightings when state changes
  useEffect(() => {
    fetch(`https://api.ebird.org/v2/data/obs/${selectedState}/recent`, {
      headers: { 'X-eBirdApiToken': EBIRD_API_KEY }
    })
      .then(res => res.json())
      .then(data => setAllSightings(data));
  }, [selectedState]);

  // Zoom to marker and open popup when a sidebar list item is clicked
  const handleSidebarClick = (obs: any, i: number) => {
    setSelectedBird(obs);
    setOpenPopupIndex(i);
    if (!mapInstance.current) return;
    mapInstance.current.setView([obs.lat, obs.lng], 10, { animate: true });
    // Open popup for the marker and close others
    markersRef.current.forEach((m, idx) => {
      if (idx !== i) m.closePopup();
    });
    const marker = markersRef.current[i];
    if (marker) marker.openPopup();
  };

  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-4 relative">
        <label className="text-lg font-semibold text-green-100 mb-2" htmlFor="state-select">
          Select State:
        </label>
        <select
          id="state-select"
          className="rounded-lg px-4 py-2 bg-green-900 text-green-100 border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
        >
          {STATES.map(state => (
            <option key={state.code} value={state.code}>{state.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by bird, location, or observer..."
          className="rounded-lg px-4 py-2 bg-green-900 text-green-100 border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 w-full max-w-md mb-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex w-full gap-4">
          <div className="flex-1 max-h-[500px] overflow-y-auto bg-green-950 rounded-xl border border-green-800 p-2 mr-2">
            {filteredSightings.length === 0 && (
              <div className="text-green-300 text-center mt-8">No sightings found.</div>
            )}
            {filteredSightings.map((obs, i) => (
              <div
                key={obs.subId + i}
                className={`cursor-pointer p-2 rounded-lg mb-2 hover:bg-green-800 ${selectedBird && selectedBird.subId === obs.subId ? 'bg-green-800' : ''}`}
                onClick={() => handleSidebarClick(obs, i)}
              >
                <div className="font-bold">{obs.comName}</div>
                <div className="text-sm italic">{obs.locName}</div>
                <div className="text-xs">{obs.obsDt}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div
              ref={mapRef}
              id="map"
              style={{ height: "500px", width: "100%", maxWidth: 800 }}
            ></div>
            {selectedBird && (
              <aside className="absolute top-0 right-0 w-80 bg-green-900 text-green-100 rounded-xl shadow-2xl border border-green-700 p-6 z-50 animate-fade-in">
                <button
                  className="absolute top-2 right-3 text-green-300 hover:text-green-100 text-xl font-bold"
                  onClick={() => setSelectedBird(null)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-2">{selectedBird.comName}</h2>
                {selectedBird.sciName && <div className="italic mb-2">{selectedBird.sciName}</div>}
                <div className="mb-2"><b>Location:</b> {selectedBird.locName}</div>
                <div className="mb-2"><b>Date:</b> {selectedBird.obsDt}</div>
                {selectedBird.userDisplayName && (
                  <div className="mb-2"><b>Observer:</b> {selectedBird.userDisplayName}</div>
                )}
                {selectedBird.howMany && (
                  <div className="mb-2"><b>Count:</b> {selectedBird.howMany}</div>
                )}
                <div className="mb-2"><b>Species Code:</b> {selectedBird.speciesCode}</div>
                <a
                  href={`https://ebird.org/checklist/${selectedBird.subId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 underline hover:text-green-100"
                >
                  View Checklist
                </a>
              </aside>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
