import React, { useEffect, useState } from 'react'
import {EstateAllInfo,DateImg,OtherInfo,JustState} from '../checktab/checkstyled';

const VoteList = ({data}) => {
    // console.log(data);
    const [voteState, setvoteState]= useState("");
    // createdAt 시간 바꾸기
    let ta = new Date(data.createdAt);

    const options = {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const formattedDate = formatter.format(ta);

    const revisedFormattedDate = formattedDate.replace(
        /(\d{2})\/(\d{2})\/(\d{4})/,
        "$3/$1/$2"
    );
    //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    const ImgUrl = data.img_1?.split("\\")[2];
    // 아직 투표중일때

    useEffect(()=>{
        console.log(data.Real_estate.accpet)
        if(data.Real_estate.accpet == 0 ){
            setvoteState("투표중")
        }
        // 미달 일때
        else if(data.Real_estate.accpet == 3){
            setvoteState("미달")
        }
        // 나머지
        else if(data.Real_estate.accpet==1 || data.Real_estate.accpet==2) {
            setvoteState("나머지")
        }
    },[data])
    
  return (
    <EstateAllInfo>
      <DateImg>
        <span>{revisedFormattedDate}</span>
        <img src={`http://localhost:8080/estate_imgs/${ImgUrl}`}></img>
      </DateImg>
      <OtherInfo>
        <div>{data.Real_estate.balance}만원</div>
        <div>{data.Real_estate.jibun}&nbsp;{data.Real_estate.additional_address}</div>
        <div><span>{data.Real_estate.area}㎡</span><span>,&nbsp;{data.Real_estate.type}</span></div>
      </OtherInfo>
      <JustState>
        {/* <span>{state}</span> */}
        {voteState === "투표중" ? <><span>투표중</span><p>정산 전</p></>: voteState ==="미달" ? <><span>미달</span><p>미지급</p></>:<><span>정산완료</span>
        <p>+1000</p></>}
      </JustState>
    </EstateAllInfo>
    

  )
}

export default VoteList