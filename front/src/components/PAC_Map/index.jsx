    import React, { useState, useEffect , useRef, useCallback} from 'react'
    import axios from '../../Axios';
    import { useQuery } from 'react-query';
    import { MarkerClusterer } from "@googlemaps/markerclusterer";

    import PAC_Map_Wrapper from 'components/PlaceAutoCompleteSearch/styles';
    import SubHeader from 'components/SubHeader';
    import MainContentWrap from 'components/MainContentWrap/styles';
    import ContentWrapper from 'components/ContentWrapper/styles';
    import ItemList from 'components/ItemList';

    import CreateZoomControl from 'components/CreateZoomControl/index'

    import FilterButton from 'components/FilterButton/index'
    import { 
        FilterContainer, 
        SearchContainer,
        SubHeaderWrapper,
        SearchBarContainer,
    } from 'components/PAC_Map/styles';

    import FilterCheckBoxModal from 'components/FilterCheckBoxModal/index';
    import FilterRangeModal from 'components/FilterRangeModal/index';
    
    // import { 
    //     FilterModalContainer,
    //     ModalCheck
    // } from 'components/FilterCheckBoxModal/styles'

    import BuiltYearCheckBoxModal from 'components/BuiltYearCheckBoxModal/index'
    import AreaRangeModal from 'components/AreaRangeModal/index'

    import SearchBarButton from 'components/SearchBarButton/index'

    import SearchIcon from 'components/SearchIcon/index'

    const PAC_Map = () => {

    const mapRef = useRef();
    const autoCompleteRef = useRef();
        // [useRef 이해]
            // 주요 기능 중 하나는 getElementByID 처럼 'DOM 요소' 를 가져오는 것 
        // [useRef 문법]
            // 1) [그릇 만들기] : const autoCompleteRef = useRef(); : 뭔가를 가져와서 담을 '그릇' 을 만든다. 
            // 2) [담기] : <input id="autocomplete" ref={autoCompleteRef} />  : props 로 전달 -> autoCompleteRef 는 id 가 autocomplete 인 input 태그를 가리키게 된다. 
            // 3) [담은 걸 사용하기] : autoCompleteRef.current | new window.google.maps.places.Autocomplete(autoCompleteRef.current , options) 

    const [map, setMap] = useState();       // 지도 map 

    
    // modal 상태 관리 
    const [isBuiltYearModalOpen, setIsBuiltYearModalOpen] = useState(false)
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
    const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false)
    const [isAreaModalOpen , setIsAreaModalOpen] = useState(false)
    
    
    // 데이터 필터링 상태관리
    // const [isRoomType , setIsRoomType] = useState('전체')
    const [arrMarker, setArrMarker] = useState([])        // 찍혀야 하는 마커들
    const [tradableData  , setTradableData] = useState([])      // state 기준으로 뽑은 거래가능한 데이터 | 현재는 테스트 버전만 뽑음
    const [checkboxValue , setCheckboxValue] = useState([])     // 배열 = 여러값을 '동시에' 담을 수 있음 -> so, 중복체크 구현 가능
    const [priceRangeValue , setPriceRangeValue] = useState([0, 1000000])
    const [builtYearValue , setBuiltYearValue] = useState()     // 기본값이 필요하려나 
    const [areaRangeValue , setAreaRangeValue] = useState([0,13500000])

    const [activeModal, setActiveModal] = useState()

    const [ currentMarkers , setCurrentMarkers ] = useState([])
    const [ currentClusterer , setCurrentClusterer ] = useState(null)
    // const [ newMarkers , setNewMarkers ] = useState([])
    // let currentClusterer = null; // 현재 활성화된 클러스터를 저장하기 위한 변수



    // 데이터 필터링 handler 함수 
        // ROOM TYPE 핸들러
        const handleCheckBox = (inputValue, inputChecked) => {
            if(inputChecked) {
                
                setCheckboxValue( prev => [...prev, inputValue]  )

            } else {
                setCheckboxValue( prev => prev.filter(item => item !==inputValue) )   // [해석] inputValue 는 체크여부와 관계없이 들어온다. 
            }
            console.log("inputChecked에 저장 🚀🚀" , inputChecked) // 🔵 작동함
            console.log("checkboxValue에 저장 🚀🚀" , checkboxValue) // 🔵 작동함
        }

        // price range 핸들링 함수
        const handlePriceRangeBox = (inputValue) => {
            setPriceRangeValue(inputValue)
            console.log("사용자가 변경시킨 range 값👍👍 " , inputValue) // 🔵 작동함 [260, 700]     //  바로 반영 안 되는 건, 상태 관리의 비동기적 특성
        }

        // built year 핸들링 함수 
        const handleBuiltYearCheckBox = (inputValue , inputChecked) => {
            
            console.log(" handleBuiltYearCheckBox " , inputChecked, inputValue)
            // if(inputChecked) {
            //     setBuiltYearValue( prev => [...prev , inputValue] )
            // } else {
            //     setCheckboxValue( prev => prev.filter(item => item !==inputValue) )   // 기존에 클릭된 값들이 prev 에 있고 -> item 으로 들어옴 -> 지금 inputValue 는, 체크 해제된 값임. => so, 지금 체크 해제된 값을 제외한 것만, 체크되었다고 저장해야 함  
            // }    

            // 만약, 
            if(inputChecked) {
                switch (inputValue) {
                    case "전체":
                        setBuiltYearValue([1900, 2023])
                        break;
                
                    case "1년 이내":
                        setBuiltYearValue([2022, 2023])
                        break;
                
                    case "5년 이내":
                        setBuiltYearValue([2018, 2023])
                        break;
                
                    case "10년 이내":
                        setBuiltYearValue([2013, 2023])
                        break;
                
                    case "15년 이내":
                        setBuiltYearValue([2008, 2023])
                        break;
                            
                    default:
                        break;
                }
                    // 해야 하는 것 
                        // setBuiltYearValue 에 , 배열로, 최소 2000년 ~ 최대 20005 년. 을 만족하는 row 가져와가 되어야 함  
                    // 하고자 하는 것
                        // '전체' 체크면 -> year_build 컬럼 중 , 아무 조건도 없는 것 
                        // '1년 이내' 면 -> year_build 컬럼 중 , 2022 년 ~ 2023년 을 만족하는 row 
                        // '5년 이내' 면 -> year_build 컬럼 중 , 2018 ~ 2023년 짜리 건물 을 찾게 됨  
                        // 10년 이내 면 -> year_build 컬럼 중 , 2013년 ~ 2023년 짜리 건물 row 를 찾아라
                        // 15년 이내 면 -> year_build 컬럼 중 , 2008년 ~ 2023년 짜리 건물 row 를 찾아라
            } else {
                setBuiltYearValue([2022, 2023])
            }
        }

        // area 핸들링
        const handleAreaRangeBox = (inputValue) => {
            setAreaRangeValue(inputValue)
            console.log("areaRangeValue" , inputValue)
        }


    // modal handler | 이게 먹히려나 
    const handleModalToggle = useCallback((modalName) => {
        console.log("어떤 모달 버튼 클릭 확인" , modalName)
        console.log("현재 activaModal 확인 1" , activeModal)
        // 기존에 열려있는게 == 클릭된 모달이름이랑 같으면 -> 모달 닫는다.
        if(modalName === activeModal){
            setActiveModal(null);
            console.log("현재 activaModal 확인 2" , activeModal)
        } else {
            // 기존 열린게 == 클릭된 모달이랑 다르면 -> 모달 연다.
            setActiveModal(modalName)
            console.log("현재 activaModal 확인 3" , activeModal)
        }
        } , [activeModal])  







    // const handleBuiltYearModal = useCallback((modalName) => {
    //     console.log("setActiveModal🐣🐣🐣" , modalName)

    //     // 지금 보여지고 있는 중인 모달이 있데 && 그게 지금 클릭된게 아니면 => 그냥 return
    //     if(activeModal && activeModal !== modalName) return
        
    //     // 클릭된 모달 == 보여지고 있는중인 모달 => 모달 끈다.
    //     if (modalName === activeModal) {
    //         setActiveModal(null);
    //         return;
    //     }        
        
    //     // 보여지고 있는 중인 모달이 없고 && 클릭된 모달이 지금 보고 있는 모달이면 => 모달 켜고, 보여지는 중인 모달에 지금 모달 올린다.
    //     if(!activeModal) {setActiveModal(modalName);}
        
    //     } , [activeModal])  
        
    // const handlePriceModal = useCallback((modalName) => {
    //     console.log("setActiveModal🐣🐣🐣" , modalName)

    //     if(activeModal) return
    //     setActiveModal(modalName)
    //     setIsPriceModalOpen(prevState => !prevState);
    //     } , [isPriceModalOpen])  
        
        
    // const handleAreaModal = useCallback((modalName) => {
    //     console.log("setActiveModal🐣🐣🐣" , modalName)

    //     if(activeModal) return
    //     setActiveModal(modalName)
    //     setIsAreaModalOpen(prevState => !prevState)
    //     } , [isAreaModalOpen])  














    // + - 버튼 나오게 하기 😥😥😥 
    const createZoomControl = ( map ) => {
        const handleZoomIn = () => {
            const currentZoom = map.getZoom();
            map.setZoom(currentZoom + 1);
        };
    
        const handleZoomOut = () => {
            const currentZoom = map.getZoom();
            map.setZoom(currentZoom - 1);
        };
    
        // DOM 엘리먼트 생성
        const controlDiv = document.createElement("div");
        controlDiv.style.padding = "10px";
    
        const zoomInButton = document.createElement("button");
        zoomInButton.innerHTML = "+";
        zoomInButton.style.width = "40px";
        zoomInButton.style.height = "40px";
        zoomInButton.addEventListener("click", handleZoomIn);
        controlDiv.appendChild(zoomInButton);
    
        const zoomOutButton = document.createElement("button");
        zoomOutButton.innerHTML = "-";
        zoomOutButton.style.width = "40px";
        zoomOutButton.style.height = "40px";
        zoomOutButton.addEventListener("click", handleZoomOut);
        controlDiv.appendChild(zoomOutButton);
    
        return controlDiv;
    }
    

    // [초기맵 셋팅]
        // +,- 줌 컨트롤
        useEffect( () => {
            if(map) {
                const zoomControl = createZoomControl(map);
                map.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(zoomControl);
            }
        }, [map]);

        // 초기맵 그리기
        useEffect( () => {
            const createdMap = new window.google.maps.Map(mapRef.current , {
                center: { lat: 37.521168186048, lng: 126.9791296664 },
                zoom: 13,
                mapTypeControl: false,
            });
            setMap(createdMap);
        } , [])


    // [데이터 가져오기] 
        // api 함수 정의 | axios 활용
            const fetchFilterTradableEstateData = async () => {
                
                console.log("checkboxValue 현재 상태" , checkboxValue)
                
                const checkedRoomTypes = checkboxValue.length > 0 ? checkboxValue.join(',') : "";

                console.log("roomTypes 현재 상태" , checkedRoomTypes)

                let url = '/list/tradableEstate';
                let params = [];

                if(checkedRoomTypes){
                    params.push(`roomType=${checkedRoomTypes}`);
                }

                if(priceRangeValue){
                    params.push(`priceRangeValue=${priceRangeValue}`);
                }
                
                if(builtYearValue){
                    params.push(`builtYearValue=${builtYearValue}`)
                }
                

                if(areaRangeValue){
                    params.push(`areaRangeValue=${areaRangeValue}`)
                }

                if(params.length > 0) {
                    url += '?' + params.join('&');
                }


                const response = await axios.get(url , {
                    withCredentials : true, 
                })
                // setTradableData(data.tradableEstate) // 이건 setTradabledata 를 useeffect 로 저장할 때의 버전
                console.log("[1단계] 클릭한대로, 서버에서, 들어오나?" , response.data.tradableEstate)

                setTradableData(response.data.tradableEstate)
                console.log("tradableData 데이터가 제대로 바뀌었나" , tradableData)

                return response.data.tradableEstate
            }
        
        // api 함수 호출해서 데이터 가져오기 | usequery 사용
        const { data , error , isLoading } = useQuery( ['filterTradableEstateData' , priceRangeValue ,checkboxValue , builtYearValue , areaRangeValue] , fetchFilterTradableEstateData , {
            // enabled : !!checkboxValue //  [해석] 이게 활성화 되면 -> checkboxValue 에 값이 있을 때만 값이 가져와짐
        })    
            // 여기에서 ['filterTradableEstateData' , checkboxValue] 여기를 -> priceRangeValue 이렇게 수정하면, -> priceRangeValue 이 범위 변화에 즉각적으로 반응 ⭐⭐⭐
            // 나는 priceRangeValue 랑, checkboxValue 모두, '즉각' 반응하게 하고 싶음 
            // 그러면, useQuery 를 2번 써도 되나 ?


        console.log(" useQuery 에 담긴 데이터" , data)

        // 검색 자동완성 + 데이터 레이어 추가 
        useEffect(() => {
            if(map){

                // autocomplete 객체 생성
                const autocomplete = new window.google.maps.places.Autocomplete(
                    autoCompleteRef.current, {
                        // api 가 반환해줄 필드 지정
                        fields: ["formatted_address", "geometry", "name"],
                        strictBounds: false,
                        // types: ["establishment"]/
                    }
                        // [해석]
                            // [바닐라 JS] const autocomplete = new google.maps.places.Autocomplete(input, options);
                                // input 은 인풋 창에서 입력한 값, options 는 추천되는 값들
                            // Autocomplete 의 매개변수로 2개가 들어오는데, 리액트에서는, useRef 훅을 사용함 
                            // 따라서, input 매개변수는 autoCompleteRef.current 로써 전달되고 있음.
                            // 추천된 결과물은 autocomplete 에 담김 
                );            
                    // [추가 기능] api 반환 필드를 추가해줄 때
                        // autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
                
                // 지도의 bounds 속성을 자동완성 객체에 바인딩
                autocomplete.bindTo("bounds", map);
                        // [기능] 
                            // autocomplete 의 'bounds' 속성을, map 객체의 'bounds' 속성에 '바인딩' 
                            // 그러면, '지도 영역 내 or 기반으로 추천' 해줌
                        // [문법] createdMap 변수가 setMap(createdMap) 훅에 의해 -> map 에 담김

                // 추천 항목 클릭하면 'place_changed' 실행
                autocomplete.addListener('place_changed', () => {
                    const marker = new window.google.maps.Marker({
                        map, 
                        anchorPoint : new window.google.maps.Point(0 , -29)
                    })
                    // setCreatedMarker(marker);

                // autocomplete 객체에서 ⭐'사용자가 선택한 장소'⭐ 데이터 가져오기
                const place = autocomplete.getPlace();

                    // place 에 어떤 데이터가 들어오는지 확인하기
                    console.log('place 값의 유형' , place) 
                    
                    // 데이터에 없는 값을 부르면 -> 오류 띄우기
                    if (!place.geometry) {
                        window.alert("No details available for input: '" + place.name + "'");
                        return;
                    }
                    
                    // 추천 사항 선택 하면 -> 해당 viewport 로 이동하게 하기
                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                    }

                    // 선택된 위치에 마커 찍히게 하기
                    marker.setPosition(place.geometry.location);
                    // 이전 마커 지우고, 새로운 마커 찍기 | 마커 초기화 기능
                    marker.setVisible(true);

                });
            }
            // tradableData 은 '서버' 에서 받아오는 것 이기 때문에 -> 다 받아질 때 까지 '기다림' => so, '비동기' 임. 
        }, [map , tradableData])


    // [그리기] 
        // 마커랑, 클러스터, 초기화 하기 
        const makeDefault = () => {
                    // 기존 마커 제거
            // console.log("currentMarkers" , currentMarkers)
            currentMarkers.forEach(marker => {
                marker.setMap(null);
            });

            // 기존 클러스터 제거   // 왜 클러스터 제거가 안 되지? 
            console.log("currentClusterer👏👏👏" , currentClusterer)
            if (currentClusterer) {
                currentClusterer.clearMarkers();
            }
        }

        // 클러스터 그리기 정의
        const makeCluster = (markers) => {

            // 클러스터 만들기
            try {
                console.log("currentMarkers" , currentMarkers)  // 그냥, 현재 마커를 currentMarkers 에 넣으면 안 되나?  

                // console.log("Starting clusterer🚀🚀");  // console.log("map" , map)  // console.log("typeof(arrMarker)" , typeof(arrMarker))

                // 클러스터로 그룹화 하기 | 
                const markerClusterer = new window.MarkerClusterer(map, markers,  {
                    
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', 
                    // or your custom path : 커스텀에 필요함 ⭐⭐
                    
                    // caculator test 자리 | calculatortest.js
                });

                setCurrentClusterer(markerClusterer)
            
            } catch (error) {
                console.log("✅✅✅✅✅" , error)
            }
        }

        // 마커 그리기 정의 | 받아온 거래 가능 데이터에 마커 찍기
        const setMarker = () => {
            let newMarkers = [];

            if(!map) return     // [해석] map 이 null 값인 경우, 오류가 나니까 넣음

            // 거래가능 데이터로 '마커' 그리고 -> info window 만들고 -> currentMarker 에 저장하기
            tradableData.forEach( (item) => {
                // console.log("item.deposit" , item.deposit)
                const tempLocation = new window.google.maps.LatLng(item.lat, item.lng)
                const tradableMarker = new window.google.maps.Marker({
                    position : tempLocation, 
                    map : map, 
                    value : item.deposit    // 이게 클러스터링 계산에 들어감. 유형은 숫자
                })

                        // 임시. 정규표현식으로 앞자리만 가져오기 | 완전 임시 📛📛📛 
                            const tempDeposit = String(item.deposit)
                            // console.log(tempDeposit)
                            const match = tempDeposit.match(/^\d+/);
                                // console.log("정규표현식" ,match) // match == 1000 // console.log("정규표현식" ,match[0])  // const number = match ? match[0]: "";
                            
                            const contentString = `<div> ${match[0][0]} 억 </div>`;

                            // marker 가 만들어질 때 마다 info window 생성
                            const infoWindow = new window.google.maps.InfoWindow();

                            infoWindow.setContent(contentString);
                            infoWindow.open({
                                anchor : tradableMarker, 
                                map, 
                                shouldFocus : false
                            })

                newMarkers.push(tradableMarker)
                
                // ❓❓❓ 이렇게 해도, currentMarkers 에 저장되는거 아닌가 ❓❓❓ 
                // setCurrentMarkers(prevState => [...prevState ,tradableMarker] );    // '방금 만들어진 마커' 를 'currentMarker' 에 저장 | ⭐⭐ -> 이게 있어야, 필터 버튼에 즉각 반응  
                // setNewMarkers(prevState => [...prevState, currentMarkers])  // 
            })

            setCurrentMarkers(prevState => [...prevState, ...newMarkers]);
            return newMarkers
        }
    

        // 마커 & 클러스터 초기화 -> 마커 그리고 -> 클러스터 그리기 | deps : tradableData 데이터가 변경될 때 마다 호출
        useEffect(() => {
            makeDefault();

            const markers = setMarker();
            
            makeCluster(markers);
            
            }, [tradableData]);


    // [콘솔확인] 
        useEffect ( () => {
            console.log( "@PAC_MAP checkboxValue" , checkboxValue )
        }  , [checkboxValue] )


    return (
        <>                  
                <SubHeaderWrapper>

                    <SearchContainer>
                        <SearchBarContainer>

                                <SearchIcon /> 

                                <input
                                    className='searchBarTest' 
                                    id="autocomplete" 
                                    ref={autoCompleteRef} 
                                    placeholder="서울대입구 원룸" 
                                    type="text" 
                                    style={{width : "100%" , marginLeft : '20px' , marginRight : '20px'}} 
                                /> 

                                <SearchBarButton />

                        </SearchBarContainer>
                        
                    </SearchContainer>

                    <FilterContainer>
                        {/* Roomtype 필터 | 아파트 vs 오피스텔 */}
                            <FilterButton color="rgb(34, 34, 34)" fontWeight={800}  id={"roomType"} title={"아파트, 오피스텔, 주택"} handleModalToggle = {handleModalToggle }  />                             
                            {
                                // 클릭되면 -> 1번으로 target.id 또는 value 를 품고 있는다. 
                                activeModal == "roomType" && <FilterCheckBoxModal 
                                                        left = {"0px" }
                                                        height={"200px"}
                                                        
                                                        checkboxValue={checkboxValue} 
                                                        setCheckboxValue={setCheckboxValue} 
                                                        handleCheckBox={handleCheckBox} 
                                                        // tradableData={tradableData} 
                                                        // setTradableData = {setTradableData}  
                                                        label_01 = {"아파트"}
                                                        label_02 = {"주택"}
                                                        // title={"checkbox 모달 | 아파트 vs 오피스텔"} 
                                                        /> 
                            }

                        {/* 매매 가격 필터 | 아파트 vs 오피스텔 */}
                            <FilterButton color="rgb(34, 34, 34)"  fontWeight={800} id={"priceRange"} title={"거래 가격"} handleModalToggle = {handleModalToggle }  />                             
                            {
                                activeModal == "priceRange" && <FilterRangeModal 
                                                        left={"75px"}  
                                                        value={priceRangeValue}  
                                                        handlePriceRangeBox={handlePriceRangeBox} /> 
                            }
                        
                        {/* 사용 승인일 | 신축, 준신축, 구축 */}
                            <FilterButton color="rgb(76, 76, 76)" fontWeight={400} id={"builtYear"} title={"사용 승인일"} handleModalToggle = {handleModalToggle }  />                             
                            {
                                activeModal == "builtYear" && <BuiltYearCheckBoxModal 
                                                    left = {"155px" } 
                                                    value = {builtYearValue}
                                                    handleBuiltYearCheckBox= {handleBuiltYearCheckBox}
                                                    label_01 = {"전체"}
                                                    label_02 = {"1년 이내"}
                                                    label_03 = {"5년 이내"}
                                                    label_04 = {"10년 이내"}
                                                    label_05 = {"15년 이내"}
                                                    label_06 = {"15년 이상"}
                                                    
                                                    /> 
                            }
                        
                        {/* 면적  필터 | 아파트 vs 오피스텔 */}
                            <FilterButton  color="rgb(76, 76, 76)" fontWeight={400} id={"area"} title={"면적"} handleModalToggle = {handleModalToggle }  />                             
                            {
                                activeModal == "area" && <AreaRangeModal  
                                                    // title={"range 모달 | 집 넓이 "} 
                                                    left = {"235px" } 
                                                    handleAreaRangeBox = {handleAreaRangeBox}
                                                    /> 
                            }
                        
                    </FilterContainer>
                </SubHeaderWrapper>


                <MainContentWrap>
                    <ContentWrapper>
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                        <ItemList className="ItemList" /> 
                    </ContentWrapper> 

                    <PAC_Map_Wrapper>
                        
                        <div id='map' ref={mapRef} style={{ height: '100vh', width: '100%' }}  />
                        <CreateZoomControl map={map} />

                    </PAC_Map_Wrapper>
                </MainContentWrap>

        </>
    )    
    }

        export default PAC_Map