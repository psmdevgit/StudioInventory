import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Entry from "./pages/Entry";
import InventoryReport from "./pages/InventoryReport";
import EntriesReport from "./pages/EntriesReport";
import UserPage from "./pages/UserPage";
import ReceiverPage from "./pages/ReceiverPage";
import MainLayout from "./components/MainLayout"; // ✅ import layout

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Login without Navbar */}
        <Route path="/" element={<Login />} />

        {/* ✅ Pages WITH Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/userPage" element={<UserPage />} />
          <Route path="/receiverPage" element={<ReceiverPage />} />
          <Route path="/inventoryReport" element={<InventoryReport />} />
          <Route path="/EntriesReport" element={<EntriesReport />} />
          <Route path="/entry" element={<Entry />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./components/Login";
// import Entry from "./pages/Entry";
// import InventoryReport from "./pages/InventoryReport";
// import EntriesReport from "./pages/EntriesReport";
// import UserPage from "./pages/UserPage";
// import ReceiverPage from "./pages/ReceiverPage";
// import MainLayout from "./components/MainLayout";
// // import RequireAuth from "./components/RequireAuth"; // 👈 create this

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Login Page */}
//         <Route path="/" element={<Login />} />

//         {/* Protected Routes */}
//           <Route element={<MainLayout />}>
//             <Route path="/userPage" element={<UserPage />} />
//             <Route path="/receiverPage" element={<ReceiverPage />} />
//             <Route path="/inventoryReport" element={<InventoryReport />} />
//             <Route path="/EntriesReport" element={<EntriesReport />} />
//             <Route path="/entry" element={<Entry />} />
//           </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;