(function () {
  const BUS_KEY = "whereIsMyBus_timings";
  const STOP_KEY = "whereIsMyBus_userStops";
  const ADMIN_KEY = "whereIsMyBus_adminLoggedIn";
  const PENDING_COLLECTION = "pendingTimings";
  const APPROVED_COLLECTION = "approvedTimings";
  const STOPS_COLLECTION = "busStops";
  const firebaseConfig = {
    apiKey: "AIzaSyAUEvlygLtYHqkw5a-tWvRInPCK5iAdxNM",
    authDomain: "where-is-my-bus-tn.firebaseapp.com",
    projectId: "where-is-my-bus-tn",
    storageBucket: "where-is-my-bus-tn.firebasestorage.app",
    messagingSenderId: "312741418293",
    appId: "1:312741418293:web:7fda51f4ece7d4197ae87c"
  };

  let firestoreDb = null;
  let firestoreEnabled = false;
  let pendingTimingsCache = [];
  let approvedTimingsCache = [];
  let userStopsCache = [];

  const districtStops = [
    { district: "Ariyalur", stops: ["Ariyalur Bus Stand", "Jayankondam", "Sendurai"] },
    { district: "Chengalpattu", stops: ["Chengalpattu Bus Stand", "Tambaram", "Madurantakam"] },
    { district: "Chennai", stops: ["Koyambedu", "Broadway", "Tambaram", "Guindy", "Velachery"] },
    { district: "Coimbatore", stops: ["Gandhipuram", "Ukkadam", "Singanallur", "Pollachi"] },
    { district: "Cuddalore", stops: ["Cuddalore Bus Stand", "Chidambaram", "Panruti", "Neyveli"] },
    { district: "Dharmapuri", stops: ["Dharmapuri Bus Stand", "Palacode", "Harur", "Pennagaram"] },
    { district: "Dindigul", stops: ["Dindigul Bus Stand", "Palani", "Oddanchatram", "Nilakottai"] },
    { district: "Erode", stops: ["Erode Bus Stand", "Perundurai", "Gobichettipalayam", "Bhavani"] },
    { district: "Kallakurichi", stops: ["Kallakurichi Bus Stand", "Sankarapuram", "Ulundurpet"] },
    { district: "Kancheepuram", stops: ["Kanchipuram Bus Stand", "Sriperumbudur", "Walajabad"] },
    { district: "Kanniyakumari", stops: ["Nagercoil", "Kanyakumari", "Marthandam", "Colachel"] },
    { district: "Karur", stops: ["Karur Bus Stand", "Kulithalai", "Krishnarayapuram"] },
    { district: "Krishnagiri", stops: ["Krishnagiri Bus Stand", "Hosur", "Denkanikottai"] },
    { district: "Madurai", stops: ["Mattuthavani", "Periyar", "Thirumangalam", "Melur"] },
    { district: "Mayiladuthurai", stops: ["Mayiladuthurai Bus Stand", "Sirkazhi", "Kuthalam"] },
    { district: "Nagapattinam", stops: ["Nagapattinam Bus Stand", "Velankanni", "Vedaranyam"] },
    { district: "Namakkal", stops: ["Namakkal Bus Stand", "Tiruchengode", "Rasipuram"] },
    { district: "Nilgiris", stops: ["Ooty Bus Stand", "Coonoor", "Gudalur"] },
    { district: "Perambalur", stops: ["Perambalur Bus Stand", "Veppanthattai"] },
    { district: "Pudukkottai", stops: ["Pudukkottai Bus Stand", "Aranthangi", "Alangudi"] },
    { district: "Ramanathapuram", stops: ["Ramanathapuram Bus Stand", "Rameswaram", "Paramakudi"] },
    { district: "Ranipet", stops: ["Ranipet Bus Stand", "Arcot", "Walajapet"] },
    { district: "Salem", stops: ["Salem New Bus Stand", "Salem Old Bus Stand", "Omalur", "Attur", "Mettur"] },
    { district: "Sivagangai", stops: ["Sivagangai Bus Stand", "Karaikudi", "Devakottai"] },
    { district: "Tenkasi", stops: ["Tenkasi Bus Stand", "Sankarankovil", "Shencottai"] },
    { district: "Thanjavur", stops: ["Thanjavur Bus Stand", "Kumbakonam", "Papanasam"] },
    { district: "Theni", stops: ["Theni Bus Stand", "Bodinayakanur", "Periyakulam"] },
    { district: "Thoothukudi", stops: ["Thoothukudi Bus Stand", "Tiruchendur", "Kovilpatti"] },
    { district: "Tiruchirappalli", stops: ["Central Bus Stand", "Chatram", "Srirangam"] },
    { district: "Tirunelveli", stops: ["Tirunelveli Bus Stand", "Palayamkottai", "Ambasamudram"] },
    { district: "Tirupathur", stops: ["Tirupathur Bus Stand", "Ambur", "Vaniyambadi"] },
    { district: "Tiruppur", stops: ["Tiruppur Bus Stand", "Avinashi", "Dharapuram"] },
    { district: "Tiruvallur", stops: ["Tiruvallur Bus Stand", "Avadi", "Ponneri"] },
    { district: "Tiruvannamalai", stops: ["Tiruvannamalai Bus Stand", "Arani", "Polur"] },
    { district: "Tiruvarur", stops: ["Tiruvarur Bus Stand", "Mannargudi", "Needamangalam"] },
    { district: "Vellore", stops: ["Vellore Bus Stand", "Katpadi", "Gudiyatham"] },
    { district: "Viluppuram", stops: ["Viluppuram Bus Stand", "Tindivanam", "Gingee"] },
    { district: "Virudhunagar", stops: ["Virudhunagar Bus Stand", "Sivakasi", "Rajapalayam"] }
  ];

  const placeAliases = {
    "dharumapuri": "Dharmapuri",
    "dahrumapri": "Dharmapuri",
    "dharmapuri bus stand": "Dharmapuri",
    "dharmapuri busstand": "Dharmapuri",
    "salem new bus stand": "Salem",
    "salem old bus stand": "Salem",
    "chennai cmbt": "Chennai",
    "chennai pt dr. m.g.r. bus stand": "Chennai",
    "chennai pt dr m g r bus stand": "Chennai",
    "chennai kilambakkam": "Chennai",
    "kilambakkam kcbt": "Chennai",
    "koyambedu": "Chennai",
    "chengalpattu bus stand": "Chengalpattu",
    "cuddalore bus stand": "Cuddalore",
    "dindigul bus stand": "Dindigul",
    "erode bus stand": "Erode",
    "kallakurichi bus stand": "Kallakurichi",
    "kanchipuram bus stand": "Kancheepuram",
    "karur bus stand": "Karur",
    "krishnagiri bus stand": "Krishnagiri",
    "mayiladuthurai bus stand": "Mayiladuthurai",
    "nagapattinam bus stand": "Nagapattinam",
    "namakkal bus stand": "Namakkal",
    "ooty bus stand": "Ooty",
    "perambalur bus stand": "Perambalur",
    "pudukkottai bus stand": "Pudukkottai",
    "ramanathapuram bus stand": "Ramanathapuram",
    "ranipet bus stand": "Ranipet",
    "sivagangai bus stand": "Sivagangai",
    "tenkasi bus stand": "Tenkasi",
    "thanjavur bus stand": "Thanjavur",
    "theni bus stand": "Theni",
    "thoothukudi bus stand": "Thoothukudi",
    "tirunelveli bus stand": "Tirunelveli",
    "tirupathur bus stand": "Tirupathur",
    "tiruppur bus stand": "Tiruppur",
    "tiruvallur bus stand": "Tiruvallur",
    "tiruvannamalai bus stand": "Tiruvannamalai",
    "tiruvarur bus stand": "Tiruvarur",
    "vellore bus stand": "Vellore",
    "viluppuram bus stand": "Viluppuram",
    "virudhunagar bus stand": "Virudhunagar"
  };

  const sampleTimings = [
    {
      id: "tnstc-pdf-1",
      busNumber: "1950DHAKC/B2D9D00B1L",
      busName: "TNSTC Salem Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "19:50",
      arrival: "04:20",
      type: "Government",
      fare: "289",
      duration: "9 hr 30 min",
      routeDetails: "Dharmapuri - Bommidi - T.V. Malai - Chennai Kilambakkam KCBT",
      busStops: "Dharmapuri, Bommidi, T.V. Malai, Chennai Kilambakkam KCBT",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 9 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-2",
      busNumber: "1400DHACH/ED2D7052GA",
      busName: "TNSTC Salem AC 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "14:00",
      arrival: "20:45",
      type: "Government",
      fare: "302",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Tirupathur - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 22 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-3",
      busNumber: "1445DHACH/EV5V280C2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "14:45",
      arrival: "22:05",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 45 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-4",
      busNumber: "1515DHACH/EV5V280A2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "15:15",
      arrival: "22:35",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 44 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-5",
      busNumber: "1640DHACH/EV5V280A2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "16:40",
      arrival: "23:10",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 41 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-6",
      busNumber: "1740DHACH/ED17D50B2L",
      busName: "TNSTC Salem Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "17:40",
      arrival: "00:25",
      type: "Government",
      fare: "255",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 48 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-7",
      busNumber: "1945DHACH/EV5V020A5L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "19:45",
      arrival: "03:05",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 42 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-8",
      busNumber: "1950DHACH/EV5V280N2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "19:50",
      arrival: "02:05",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 37 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-9",
      busNumber: "2020DHACH/EV5V280B2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "20:20",
      arrival: "03:40",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 16 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-10",
      busNumber: "2110DHACH/ED27D50K2L",
      busName: "TNSTC Salem Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "21:10",
      arrival: "03:55",
      type: "Government",
      fare: "274",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 8 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-11",
      busNumber: "2200DHAC/H4E2A0BAB",
      busName: "SETC AC Sleeper Seater",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "22:00",
      arrival: "04:30",
      type: "Government",
      fare: "402",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. PDF showed this service as full.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-12",
      busNumber: "2215DHACH/ED2D7052HA",
      busName: "TNSTC Salem AC 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "22:15",
      arrival: "04:50",
      type: "Government",
      fare: "302",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Tirupathur - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 1 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-13",
      busNumber: "2230DHACH/ED27D50D2L",
      busName: "TNSTC Salem Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "22:30",
      arrival: "05:15",
      type: "Government",
      fare: "255",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Tirupathur - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 2 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-14",
      busNumber: "2245DHACH/ED27D50E2L",
      busName: "TNSTC Salem Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "22:45",
      arrival: "05:30",
      type: "Government",
      fare: "255",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 1 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-15",
      busNumber: "2300DHACH/ED2D7052CA",
      busName: "TNSTC Salem AC 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "23:00",
      arrival: "05:45",
      type: "Government",
      fare: "302",
      duration: "7 hr 45 min",
      routeDetails: "Dharmapuri - Tirupathur - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. PDF showed this service as full.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-16",
      busNumber: "2130METC/H4E2A7BAB",
      busName: "SETC Mettur - Chennai AC Sleeper Seater",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "23:15",
      arrival: "05:30",
      type: "Government",
      fare: "402",
      duration: "7 hr 30 min",
      routeDetails: "Mettur - Dharmapuri - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Mettur, Dharmapuri, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. The PDF listed this as a Mettur service via Dharmapuri and showed it as full.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-17",
      busNumber: "2330DHACH/EV5V280F2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "23:30",
      arrival: "06:50",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 21 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    },
    {
      id: "tnstc-pdf-18",
      busNumber: "2359DHACH/EV5V250G2L",
      busName: "TNSTC Villupuram Deluxe 3X2",
      from: "Dharmapuri",
      to: "Chennai",
      departure: "23:59",
      arrival: "07:19",
      type: "Government",
      fare: "255",
      duration: "7 hr 30 min",
      routeDetails: "Dharmapuri - Tirupathur - Vellore - Chennai PT Dr. M.G.R. Bus Stand",
      busStops: "Dharmapuri, Tirupathur, Vellore, Chennai PT Dr. M.G.R. Bus Stand",
      notes: "Loaded from TNSTC.pdf. Journey date shown in PDF: 03/05/2026. Seats shown in PDF: 40 available.",
      status: "approved",
      lastUpdated: "2026-05-03"
    }
  ];

  document.addEventListener("DOMContentLoaded", async () => {
    await initializeDataStore();
    setupNavigation();
    setDefaultDates();
    fillPlaceLists();
    setupDistrictStopSelectors();
    setupSearchForms();
    renderPopularRoutes();
    renderSearchResults();
    setupStopForm();
    setupTimingForm();
    setupAdmin();
    updateStorageLabels();
  });

  async function initializeDataStore() {
    if (connectFirestore()) {
      try {
        await loadFirestoreData();
        if (!approvedTimingsCache.length) {
          await seedApprovedTimings(sampleTimings);
        }
        return;
      } catch (error) {
        console.warn("Firestore unavailable, using browser storage fallback.", error);
        firestoreDb = null;
        firestoreEnabled = false;
      }
    }

    seedLocalData();
    const localTimings = JSON.parse(localStorage.getItem(BUS_KEY) || "[]").map(normalizeTiming);
    pendingTimingsCache = localTimings.filter((timing) => timing.status === "pending");
    approvedTimingsCache = localTimings.filter((timing) => timing.status !== "pending");
    userStopsCache = JSON.parse(localStorage.getItem(STOP_KEY) || "[]").map(normalizeStop);
  }

  function connectFirestore() {
    if (!window.firebase || !firebase.firestore) return false;
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    firestoreDb = firebase.firestore();
    firestoreEnabled = true;
    return true;
  }

  async function loadFirestoreData() {
    const [pendingSnapshot, approvedSnapshot, stopsSnapshot] = await Promise.all([
      firestoreDb.collection(PENDING_COLLECTION).get(),
      firestoreDb.collection(APPROVED_COLLECTION).get(),
      firestoreDb.collection(STOPS_COLLECTION).get()
    ]);

    pendingTimingsCache = pendingSnapshot.docs.map((doc) => normalizeTiming({ id: doc.id, ...doc.data(), status: "pending" }));
    approvedTimingsCache = approvedSnapshot.docs.map((doc) => normalizeTiming({ id: doc.id, ...doc.data(), status: "approved" }));
    userStopsCache = stopsSnapshot.docs.map((doc) => normalizeStop({ id: doc.id, ...doc.data() }));

    localStorage.setItem(BUS_KEY, JSON.stringify(getTimings()));
    localStorage.setItem(STOP_KEY, JSON.stringify(userStopsCache));
  }

  async function seedApprovedTimings(timings) {
    approvedTimingsCache = timings.map((timing) => normalizeTiming({ ...timing, status: "approved" }));
    localStorage.setItem(BUS_KEY, JSON.stringify(getTimings()));
    if (!firestoreEnabled) return;

    const batch = firestoreDb.batch();
    approvedTimingsCache.forEach((timing) => {
      batch.set(firestoreDb.collection(APPROVED_COLLECTION).doc(timing.id), toFirestoreTiming(timing, "approved"));
    });
    await batch.commit();
  }

  function seedLocalData() {
    if (!localStorage.getItem(BUS_KEY)) {
      localStorage.setItem(BUS_KEY, JSON.stringify(sampleTimings));
      return;
    }

    const existing = JSON.parse(localStorage.getItem(BUS_KEY) || "[]").filter((timing) => {
      return !String(timing.id || "").startsWith("sample-");
    });
    const sampleById = new Map(sampleTimings.map((timing) => [timing.id, timing]));
    const existingIds = new Set(existing.map((timing) => timing.id));
    const upgraded = existing.map((timing) => sampleById.get(timing.id) || normalizeTiming(timing));
    sampleTimings.forEach((timing) => {
      if (!existingIds.has(timing.id)) upgraded.push(timing);
    });
    localStorage.setItem(BUS_KEY, JSON.stringify(upgraded));
  }

  function getTimings() {
    return [...pendingTimingsCache, ...approvedTimingsCache].map(normalizeTiming);
  }

  function getPendingTimings() {
    return pendingTimingsCache.map(normalizeTiming);
  }

  function getApprovedTimings() {
    return approvedTimingsCache.map(normalizeTiming);
  }

  function saveLocalTimingCaches() {
    localStorage.setItem(BUS_KEY, JSON.stringify(getTimings()));
  }

  async function savePendingTiming(timing) {
    const normalized = normalizeTiming({ ...timing, status: "pending" });

    // User submissions are written to pendingTimings so every admin device can review them.
    if (!usingSharedDatabase()) throw new Error("Firestore is not connected.");
    await firestoreDb.collection(PENDING_COLLECTION).doc(normalized.id).set(toFirestoreTiming(normalized, "pending"));

    pendingTimingsCache = upsertTiming(pendingTimingsCache, normalized);
    approvedTimingsCache = approvedTimingsCache.filter((item) => item.id !== normalized.id);
    saveLocalTimingCaches();
  }

  async function saveApprovedTiming(timing) {
    const normalized = normalizeTiming({ ...timing, status: "approved" });

    // Approved timings are written to approvedTimings, which powers public search results.
    if (!usingSharedDatabase()) throw new Error("Firestore is not connected.");
    await firestoreDb.collection(APPROVED_COLLECTION).doc(normalized.id).set(toFirestoreTiming(normalized, "approved"));
    await firestoreDb.collection(PENDING_COLLECTION).doc(normalized.id).delete();

    approvedTimingsCache = upsertTiming(approvedTimingsCache, normalized);
    pendingTimingsCache = pendingTimingsCache.filter((item) => item.id !== normalized.id);
    saveLocalTimingCaches();
  }

  async function deletePendingTiming(id) {
    if (!usingSharedDatabase()) throw new Error("Firestore is not connected.");
    await firestoreDb.collection(PENDING_COLLECTION).doc(id).delete();
    pendingTimingsCache = pendingTimingsCache.filter((timing) => timing.id !== id);
    saveLocalTimingCaches();
  }

  async function deleteApprovedTiming(id) {
    if (!usingSharedDatabase()) throw new Error("Firestore is not connected.");
    await firestoreDb.collection(APPROVED_COLLECTION).doc(id).delete();
    approvedTimingsCache = approvedTimingsCache.filter((timing) => timing.id !== id);
    saveLocalTimingCaches();
  }

  async function resetApprovedTimings() {
    approvedTimingsCache = sampleTimings.map((timing) => normalizeTiming({ ...timing, status: "approved" }));
    saveLocalTimingCaches();
    if (firestoreEnabled) await syncCollection(APPROVED_COLLECTION, approvedTimingsCache.map((timing) => toFirestoreTiming(timing, "approved")));
  }

  function upsertTiming(list, timing) {
    const index = list.findIndex((item) => item.id === timing.id);
    if (index === -1) return [...list, timing];
    return list.map((item) => item.id === timing.id ? timing : item);
  }

  function toFirestoreTiming(timing, status) {
    const normalized = normalizeTiming({ ...timing, status });
    const now = new Date().toISOString();
    return {
      id: normalized.id,
      busNumber: normalized.busNumber,
      busName: normalized.busName,
      from: normalized.from,
      to: normalized.to,
      departureTime: normalized.departure,
      arrivalTime: normalized.arrival,
      busType: normalized.type,
      fare: normalized.fare,
      duration: normalized.duration,
      routeDetails: normalized.routeDetails,
      busStops: normalized.busStops,
      notes: normalized.notes,
      status,
      lastUpdated: normalized.lastUpdated,
      createdAt: normalized.createdAt || now,
      approvedAt: status === "approved" ? (normalized.approvedAt || now) : null
    };
  }

  function getUserStops() {
    return userStopsCache.map(normalizeStop);
  }

  async function saveUserStops(stops) {
    const unique = [];
    const seen = new Set();
    stops.forEach((stop) => {
      const normalizedStop = normalizeStop(stop);
      const key = `${normalize(normalizedStop.district)}|${normalize(normalizedStop.stopName)}`;
      if (normalizedStop.district && normalizedStop.stopName && !seen.has(key)) {
        seen.add(key);
        unique.push(normalizedStop);
      }
    });
    userStopsCache = unique;
    localStorage.setItem(STOP_KEY, JSON.stringify(unique));
    if (firestoreEnabled) await syncCollection(STOPS_COLLECTION, unique);
  }

  function usingSharedDatabase() {
    return Boolean(firestoreEnabled && firestoreDb);
  }

  function updateStorageLabels() {
    const meta = document.getElementById("resultsMeta");
    if (meta && meta.dataset.ready !== "true") {
      meta.textContent = usingSharedDatabase()
        ? "Showing approved timings from the shared online database."
        : "Showing timings saved in this browser only. Firestore is not connected.";
    }
  }

  function showMessage(id, message) {
    const element = document.getElementById(id);
    if (!element) return;
    if (message) element.textContent = message;
    element.classList.remove("hidden");
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideMessage(id) {
    const element = document.getElementById(id);
    if (element) element.classList.add("hidden");
  }

  async function syncCollection(collectionName, records) {
    const collection = firestoreDb.collection(collectionName);
    const snapshot = await collection.get();
    const desiredIds = new Set(records.map((record) => record.id));
    const batch = firestoreDb.batch();

    snapshot.docs.forEach((doc) => {
      if (!desiredIds.has(doc.id)) batch.delete(doc.ref);
    });

    records.forEach((record) => {
      batch.set(collection.doc(record.id), record);
    });

    await batch.commit();
  }

  function normalizeStop(stop) {
    const district = canonicalPlace(stop.district);
    const stopName = canonicalPlace(stop.stopName);
    return {
      ...stop,
      id: stop.id || `${normalize(district)}-${normalize(stopName)}`.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      district,
      stopName,
      createdAt: stop.createdAt || today()
    };
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function canonicalPlace(value) {
    const cleaned = normalize(value).replace(/\s+/g, " ");
    return placeAliases[cleaned] || String(value || "").trim();
  }

  function getDistrictNames() {
    return districtStops.map((item) => item.district).sort();
  }

  function getStopsByDistrict(districtName) {
    const district = districtStops.find((item) => normalize(item.district) === normalize(districtName));
    const stops = new Set();
    if (district) {
      district.stops.forEach((stop) => stops.add(canonicalPlace(stop)));
    }

    getUserStops()
      .filter((stop) => normalize(stop.district) === normalize(districtName))
      .forEach((stop) => stops.add(canonicalPlace(stop.stopName)));

    getTimings().forEach((timing) => {
      if (normalize(canonicalPlace(timing.from)) === normalize(districtName)) stops.add(canonicalPlace(timing.from));
      if (normalize(canonicalPlace(timing.to)) === normalize(districtName)) stops.add(canonicalPlace(timing.to));
      splitStops(timing.busStops).forEach((stop) => {
        const canonicalStop = canonicalPlace(stop);
        if (normalize(canonicalStop) === normalize(districtName)) stops.add(canonicalStop);
      });
    });

    stops.add(canonicalPlace(districtName));
    return Array.from(stops).sort();
  }

  function splitStops(stopsText) {
    return String(stopsText || "")
      .split(/,|-/)
      .map((stop) => stop.trim())
      .filter(Boolean);
  }

  function formatTime(value) {
    if (!value) return "-";
    const [hour, minute] = value.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  function setupNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setDefaultDates() {
    document.querySelectorAll('input[type="date"]').forEach((input) => {
      if (!input.value) input.value = today();
    });
  }

  function fillPlaceLists() {
    const places = new Set();
    districtStops.forEach((district) => {
      places.add(canonicalPlace(district.district));
      district.stops.forEach((stop) => places.add(canonicalPlace(stop)));
    });
    getUserStops().forEach((stop) => {
      places.add(stop.district);
      places.add(stop.stopName);
    });
    getTimings().forEach((timing) => {
      places.add(canonicalPlace(timing.from));
      places.add(canonicalPlace(timing.to));
    });

    document.querySelectorAll("#placeList").forEach((list) => {
      list.innerHTML = Array.from(places)
        .sort()
        .map((place) => `<option value="${escapeHtml(place)}"></option>`)
        .join("");
    });
  }

  function setupDistrictStopSelectors() {
    document.querySelectorAll("[data-search-form], [data-stop-picker-form]").forEach((form) => {
      const params = new URLSearchParams(window.location.search);
      populateDistrictSelects(form);

      const from = params.get("from") || "";
      const to = params.get("to") || "";
      const fromDistrict = params.get("fromDistrict") || findDistrictForStop(from);
      const toDistrict = params.get("toDistrict") || findDistrictForStop(to);

      if (form.elements.fromDistrict && fromDistrict) {
        form.elements.fromDistrict.value = fromDistrict;
        populateStopSelect(form, "from", fromDistrict, from);
      }
      if (form.elements.toDistrict && toDistrict) {
        form.elements.toDistrict.value = toDistrict;
        populateStopSelect(form, "to", toDistrict, to);
      }

      form.querySelectorAll("[data-district-select]").forEach((select) => {
        select.addEventListener("change", () => {
          populateStopSelect(form, select.dataset.target, select.value);
        });
      });
    });
  }

  function populateDistrictSelects(form) {
    form.querySelectorAll("[data-district-select]").forEach((select) => {
      const current = select.value;
      select.innerHTML = `<option value="">Select district</option>${getDistrictNames()
        .map((district) => `<option value="${escapeHtml(district)}">${escapeHtml(district)}</option>`)
        .join("")}`;
      select.value = current;
    });
  }

  function populateStopSelect(form, fieldName, districtName, selectedStop = "") {
    const select = form.elements[fieldName];
    if (!select) return;

    const stops = districtName ? getStopsByDistrict(districtName) : [];
    select.innerHTML = `<option value="">Select bus stop</option>${stops
      .map((stop) => `<option value="${escapeHtml(stop)}">${escapeHtml(stop)}</option>`)
      .join("")}`;

    const canonicalSelected = canonicalPlace(selectedStop);
    if (canonicalSelected && stops.some((stop) => normalize(stop) === normalize(canonicalSelected))) {
      select.value = stops.find((stop) => normalize(stop) === normalize(canonicalSelected));
    }
  }

  function findDistrictForStop(stopName) {
    const canonicalStop = canonicalPlace(stopName);
    if (!canonicalStop) return "";
    const directDistrict = districtStops.find((district) => normalize(district.district) === normalize(canonicalStop));
    if (directDistrict) return directDistrict.district;

    const builtInMatch = districtStops.find((district) => {
      return district.stops.some((stop) => normalize(canonicalPlace(stop)) === normalize(canonicalStop));
    });
    if (builtInMatch) return builtInMatch.district;

    const userMatch = getUserStops().find((stop) => normalize(canonicalPlace(stop.stopName)) === normalize(canonicalStop));
    return userMatch ? userMatch.district : "";
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach((form) => {
      const params = new URLSearchParams(window.location.search);
      if (form.elements.date && params.get("date")) form.elements.date.value = params.get("date");
      if (form.elements.type && params.get("type")) form.elements.type.value = params.get("type");

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const query = new URLSearchParams({
          from: data.get("from") || "",
          to: data.get("to") || "",
          fromDistrict: data.get("fromDistrict") || "",
          toDistrict: data.get("toDistrict") || "",
          date: data.get("date") || today(),
          type: data.get("type") || "All"
        });
        window.location.href = `search.html?${query.toString()}`;
      });
    });
  }

  function renderPopularRoutes() {
    const container = document.getElementById("popularRoutes");
    if (!container) return;

    const routes = [
      ["Dharmapuri", "Chennai"],
      ["Dharmapuri", "Chennai"],
      ["Dharmapuri", "Chennai"],
      ["Mettur", "Chennai"],
      ["Dharmapuri", "Vellore"]
    ].filter((route, index, list) => {
      return list.findIndex((item) => item[0] === route[0] && item[1] === route[1]) === index;
    });

    container.innerHTML = routes.map(([from, to]) => `
      <article class="route-card" data-from="${escapeHtml(from)}" data-to="${escapeHtml(to)}">
        <strong>${escapeHtml(from)} to ${escapeHtml(to)}</strong>
        <span>View government and private timings</span>
      </article>
    `).join("");

    container.querySelectorAll(".route-card").forEach((card) => {
      card.addEventListener("click", () => {
        const query = new URLSearchParams({
          from: card.dataset.from,
          to: card.dataset.to,
          date: today(),
          type: "All"
        });
        window.location.href = `search.html?${query.toString()}`;
      });
    });
  }

  function renderSearchResults() {
    const list = document.getElementById("resultsList");
    if (!list) return;

    const params = new URLSearchParams(window.location.search);
    const from = params.get("from") || "";
    const to = params.get("to") || "";
    const type = params.get("type") || "All";
    const date = params.get("date") || today();

    const approved = getApprovedTimings();
    const results = approved.filter((timing) => {
      const fromSearch = normalize(canonicalPlace(from));
      const toSearch = normalize(canonicalPlace(to));
      const fromValue = normalize(canonicalPlace(timing.from));
      const toValue = normalize(canonicalPlace(timing.to));
      const fromMatch = !from || fromValue.includes(fromSearch) || normalize(timing.busStops).includes(normalize(from));
      const toMatch = !to || toValue.includes(toSearch) || normalize(timing.busStops).includes(normalize(to));
      const typeMatch = type === "All" || timing.type === type;
      return fromMatch && toMatch && typeMatch;
    });

    const title = document.getElementById("resultsTitle");
    const meta = document.getElementById("resultsMeta");
    if (title) title.textContent = from && to ? `${from} to ${to}` : "Available buses";
    if (meta) {
      const source = usingSharedDatabase() ? "shared online database" : "this browser only";
      meta.dataset.ready = "true";
      meta.textContent = `${results.length} approved timing${results.length === 1 ? "" : "s"} for ${date}, ${type} bus type from ${source}.`;
    }

    list.innerHTML = results.length
      ? results.map(renderBusCard).join("")
      : `<div class="empty-state">No approved buses found. Try another route or submit a timing update.</div>`;
  }

  function setupStopForm() {
    const form = document.getElementById("stopForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const stop = {
        district: canonicalPlace(data.get("district")),
        stopName: canonicalPlace(data.get("stopName")),
        createdAt: today()
      };

      hideMessage("stopSuccess");
      hideMessage("stopError");

      try {
        await saveUserStops([...getUserStops(), stop]);
        form.reset();
        fillPlaceLists();
        refreshDistrictStopSelectors();

        if (usingSharedDatabase()) {
          showMessage("stopSuccess", "Bus stop saved online. It will show on mobile and laptop.");
        } else {
          showMessage("stopError", "Bus stop saved only in this browser. Open the Firebase-hosted website and check Firestore setup.");
        }
      } catch (error) {
        console.error("Could not save bus stop online.", error);
        showMessage("stopError", "Bus stop was not saved online. Check Firestore rules and internet connection.");
      }
    });
  }

  function refreshDistrictStopSelectors() {
    document.querySelectorAll("[data-search-form], [data-stop-picker-form]").forEach((form) => {
      const currentFromDistrict = form.elements.fromDistrict ? form.elements.fromDistrict.value : "";
      const currentToDistrict = form.elements.toDistrict ? form.elements.toDistrict.value : "";
      const currentFrom = form.elements.from ? form.elements.from.value : "";
      const currentTo = form.elements.to ? form.elements.to.value : "";

      populateDistrictSelects(form);
      if (form.elements.fromDistrict) form.elements.fromDistrict.value = currentFromDistrict;
      if (form.elements.toDistrict) form.elements.toDistrict.value = currentToDistrict;
      if (currentFromDistrict) populateStopSelect(form, "from", currentFromDistrict, currentFrom);
      if (currentToDistrict) populateStopSelect(form, "to", currentToDistrict, currentTo);
    });
  }

  function setupTimingForm() {
    const form = document.getElementById("timingForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const timing = timingFromForm(form, "pending");
      const existing = getTimings().find((item) =>
        normalize(item.busNumber) === normalize(timing.busNumber) &&
        normalize(canonicalPlace(item.from)) === normalize(canonicalPlace(timing.from)) &&
        normalize(canonicalPlace(item.to)) === normalize(canonicalPlace(timing.to))
      );

      if (existing) timing.id = existing.id;

      hideMessage("updateSuccess");
      hideMessage("updateError");

      try {
        await savePendingTiming(timing);
        form.reset();
        if (usingSharedDatabase()) {
          showMessage("updateSuccess", "Timing saved online. Open Admin on your laptop and approve it.");
        } else {
          showMessage("updateError", "Timing saved only in this browser. Open the Firebase-hosted website and check Firestore setup.");
        }
        fillPlaceLists();
      } catch (error) {
        console.error("Could not save timing online.", error);
        showMessage("updateError", "Timing was not saved online. Check Firestore rules and internet connection.");
      }
    });
  }

  function timingFromForm(form, status) {
    const data = new FormData(form);
    return {
      id: data.get("id") || `bus-${Date.now()}`,
      busNumber: String(data.get("busNumber") || "").trim(),
      busName: String(data.get("busName") || "").trim(),
      from: canonicalPlace(data.get("from")),
      to: canonicalPlace(data.get("to")),
      departure: data.get("departure"),
      arrival: data.get("arrival"),
      type: data.get("type"),
      fare: String(data.get("fare") || "").trim(),
      duration: String(data.get("duration") || "").trim(),
      routeDetails: String(data.get("routeDetails") || "").trim(),
      busStops: String(data.get("busStops") || "").trim(),
      notes: String(data.get("notes") || "").trim(),
      status: data.get("status") || status,
      createdAt: data.get("createdAt") || new Date().toISOString(),
      lastUpdated: today()
    };
  }

  function setupAdmin() {
    const loginForm = document.getElementById("loginForm");
    const panel = document.getElementById("adminPanel");
    if (!loginForm || !panel) return;

    const loginBox = document.getElementById("adminLogin");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");
    const resetBtn = document.getElementById("resetDataBtn");
    const editDialog = document.getElementById("editDialog");
    const editForm = document.getElementById("editForm");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    const showPanel = () => {
      const loggedIn = localStorage.getItem(ADMIN_KEY) === "true";
      loginBox.classList.toggle("hidden", loggedIn);
      panel.classList.toggle("hidden", !loggedIn);
      if (loggedIn) renderAdminLists();
    };

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(loginForm);
      if (data.get("username") === "admin" && data.get("password") === "admin123") {
        localStorage.setItem(ADMIN_KEY, "true");
        loginError.classList.add("hidden");
        showPanel();
      } else {
        loginError.classList.remove("hidden");
      }
    });

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(ADMIN_KEY);
      showPanel();
    });

    resetBtn.addEventListener("click", async () => {
      if (confirm("Reset timings to the loaded TNSTC data?")) {
        await resetApprovedTimings();
        renderAdminLists();
      }
    });

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-admin-action]");
      if (!button) return;

      const id = button.dataset.id;
      const action = button.dataset.adminAction;
      if (action === "approve") await approveTiming(id);
      if (action === "delete") await deleteTiming(id);
      if (action === "edit") openEditDialog(id);
      if (action === "delete-stop") await deleteUserStop(id);
    });

    editForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const updated = timingFromForm(editForm, editForm.elements.status.value);
      if (updated.status === "approved") {
        await saveApprovedTiming(updated);
      } else {
        await savePendingTiming(updated);
      }
      editDialog.close();
      renderAdminLists();
    });

    cancelEditBtn.addEventListener("click", () => editDialog.close());
    showPanel();
  }

  function renderAdminLists() {
    const pendingList = document.getElementById("pendingList");
    const approvedList = document.getElementById("approvedList");
    const userStopsList = document.getElementById("userStopsList");
    if (!pendingList || !approvedList) return;

    const pending = getPendingTimings();
    const approved = getApprovedTimings();

    pendingList.innerHTML = pending.length
      ? pending.map((timing) => renderBusCard(timing, true)).join("")
      : `<div class="empty-state">No pending submissions.</div>`;

    approvedList.innerHTML = approved.length
      ? approved.map((timing) => renderBusCard(timing, true)).join("")
      : `<div class="empty-state">No approved timings.</div>`;

    if (userStopsList) {
      const stops = getUserStops();
      userStopsList.innerHTML = stops.length
        ? stops.map(renderUserStopCard).join("")
        : `<div class="empty-state">No user-created bus stops.</div>`;
    }
  }

  function renderUserStopCard(stop) {
    const id = stopKey(stop);
    return `
      <article class="bus-card stop-admin-card">
        <div>
          <div class="bus-number">${escapeHtml(stop.stopName)}</div>
          <p>${escapeHtml(stop.district)} district</p>
          <div class="meta-row">Created: ${escapeHtml(stop.createdAt)}</div>
        </div>
        <div class="card-actions">
          <button class="btn danger" type="button" data-admin-action="delete-stop" data-id="${escapeHtml(id)}">Remove Bus Stop</button>
        </div>
      </article>
    `;
  }

  async function deleteUserStop(id) {
    if (!confirm("Remove this user-created bus stop?")) return;
    const stops = getUserStops().filter((stop) => stopKey(stop) !== id);
    await saveUserStops(stops);
    fillPlaceLists();
    renderAdminLists();
  }

  function stopKey(stop) {
    return `${normalize(stop.district)}|${normalize(stop.stopName)}`;
  }

  async function approveTiming(id) {
    const timing = getPendingTimings().find((item) => item.id === id);
    if (!timing) return;
    await saveApprovedTiming({ ...timing, status: "approved", approvedAt: new Date().toISOString(), lastUpdated: today() });
    renderAdminLists();
  }

  async function deleteTiming(id) {
    if (!confirm("Delete this timing?")) return;
    const pending = getPendingTimings().some((timing) => timing.id === id);
    if (pending) {
      await deletePendingTiming(id);
    } else {
      await deleteApprovedTiming(id);
    }
    renderAdminLists();
  }

  function openEditDialog(id) {
    const timing = getTimings().find((item) => item.id === id);
    const dialog = document.getElementById("editDialog");
    const form = document.getElementById("editForm");
    if (!timing || !dialog || !form) return;

    Object.entries(timing).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
    dialog.showModal();
  }

  function renderBusCard(timing, adminMode = false) {
    timing = normalizeTiming(timing);
    const typeClass = timing.type === "Private" ? "private" : "";
    const actions = adminMode ? `
      <div class="card-actions">
        ${timing.status === "pending" ? `<button class="btn primary" type="button" data-admin-action="approve" data-id="${timing.id}">Approve</button>` : ""}
        <button class="btn secondary" type="button" data-admin-action="edit" data-id="${timing.id}">Edit</button>
        <button class="btn danger" type="button" data-admin-action="delete" data-id="${timing.id}">Delete</button>
      </div>
    ` : "";

    return `
      <article class="bus-card">
        <div class="bus-top">
          <div>
            <div class="bus-number">${escapeHtml(timing.busNumber)}</div>
            <div class="bus-name">${escapeHtml(timing.busName)}</div>
            <p>${escapeHtml(timing.from)} to ${escapeHtml(timing.to)}</p>
          </div>
          <span class="badge ${typeClass}">${escapeHtml(timing.type)}</span>
        </div>
        <div class="time-grid details-grid">
          <div class="time-box">
            <span>Departure</span>
            <strong>${formatTime(timing.departure)}</strong>
          </div>
          <div class="time-box">
            <span>Arrival</span>
            <strong>${formatTime(timing.arrival)}</strong>
          </div>
          <div class="time-box">
            <span>Duration</span>
            <strong>${escapeHtml(timing.duration)}</strong>
          </div>
          <div class="time-box">
            <span>Approx. cost</span>
            <strong>Rs. ${escapeHtml(timing.fare)}</strong>
          </div>
        </div>
        <div class="fare-note">No payment or ticket booking option is available on this website.</div>
        <p><strong>Route:</strong> ${escapeHtml(timing.routeDetails)}</p>
        <p><strong>Bus stops:</strong> ${escapeHtml(timing.busStops)}</p>
        ${timing.notes ? `<p><strong>Notes:</strong> ${escapeHtml(timing.notes)}</p>` : ""}
        <div class="meta-row">Last updated: ${escapeHtml(timing.lastUpdated)}${adminMode ? ` | Status: ${escapeHtml(timing.status)}` : ""}</div>
        ${actions}
      </article>
    `;
  }

  function normalizeTiming(timing) {
    const from = canonicalPlace(timing.from);
    const to = canonicalPlace(timing.to);
    const id = timing.id || `bus-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const departure = timing.departure || timing.departureTime || "";
    const arrival = timing.arrival || timing.arrivalTime || "";
    const type = timing.type || timing.busType || "";
    return {
      ...timing,
      id,
      from,
      to,
      departure,
      arrival,
      type,
      busName: timing.busName || `${type || "Bus"} ${from || ""} - ${to || ""}`.trim(),
      fare: timing.fare || "Not updated",
      duration: timing.duration || calculateDuration(departure, arrival),
      routeDetails: timing.routeDetails || "",
      notes: timing.notes || "",
      busStops: timing.busStops || timing.routeDetails || "Stop details not updated",
      status: timing.status || "approved",
      lastUpdated: timing.lastUpdated || today()
    };
  }

  function calculateDuration(start, end) {
    if (!start || !end) return "Not updated";
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    let startTotal = startHour * 60 + startMinute;
    let endTotal = endHour * 60 + endMinute;
    if (endTotal < startTotal) endTotal += 24 * 60;
    const total = endTotal - startTotal;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${hours} hr ${minutes} min`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
