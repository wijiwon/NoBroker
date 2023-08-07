import "./App.css";
import NavHeader from "./components/navbar/NavHeader";
import { Routes, Route, Navigate } from "react-router-dom";
import Insert from "./components/insertPage/Insert";

import { QueryClient, QueryClientProvider } from "react-query";
import { Detail } from "./components";

const queryClient = new QueryClient();

import Home from './pages';
// import TestMarker from './components/TestMarker'
import GoogleMap from './components/GoogleMap'
import GoogleMap_2 from './components/GoogleMap_2'
import GoogleMap_3 from './components/GoogleMap_3'

import GoogleMap_2_1 from './components/GoogleMap_2_1'
import PlaceAutoCompleteSearch from './components/PlaceAutoCompleteSearch/index'

import { Wrapper } from '@googlemaps/react-wrapper';
import SearchBox from './components/SearchBox/index';


function App() {
  return (
    <div className="App">
      

      <Wrapper apiKey='process.env.NEXT_PUBIC_GOOGLE_MAPS_API_KEY' libraries={"places"} > 
        {/* <Home> </Home> */}

        {/* 작동함 🔵 */}
        {/* <GoogleMap> </GoogleMap> */}

        {/* <GoogleMap_2> </GoogleMap_2> */}

        {/* 작동함 | 클러스터링 | 🔵 */}
        {/* <GoogleMap_2_1> </GoogleMap_2_1> */}

        {/* 유튜브 버전으로 진행 */}
      
        {/* <GoogleMap_3> </GoogleMap_3> */}

        <PlaceAutoCompleteSearch> </PlaceAutoCompleteSearch>

        {/* <TestMarker> </TestMarker> */}

        {/* <SearchBox> </SearchBox> */}

      </Wrapper>
      

    </div>
    // <QueryClientProvider client={queryClient}>
    //   <div className="App">
    //     <NavHeader></NavHeader>
    //     <Routes>
    //       <Route path="/insert" element={<Insert />} />
    //       <Route path="/detail/:id" element={<Detail />} />
    //     </Routes>
    //   </div>
    // </QueryClientProvider>

    );
}

export default App;
