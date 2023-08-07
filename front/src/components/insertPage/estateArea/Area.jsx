import React from 'react'
import { useState ,useEffect} from 'react';
import {Container,Title,AreaBox,AreaDiv,AreaDivBox,Equel} from './areastyled';
const Area = () => {
    const [ft,setFt] = useState("");
    const [m2,setM2] = useState("");

    // 평수를 m2 로 변경
    const ftChange = (e)=>{
        setFt(e.target.value)
        const ta =parseFloat(e.target.value) * 3.305;
        const tb =ta.toFixed(2);
        setM2(tb);
    }

    // m2을 평수로 변경
    const m2Change = (e) =>{
        setM2(e.target.value);
        const ta =parseFloat(e.target.value) * 0.3025;
        const tb =ta.toFixed(2);
        setFt(tb);
    }
  return (
    <Container>
        <Title>매물 크기<span>*</span></Title>
        <AreaBox>
            <p>전용면적</p>
            <AreaDivBox>
                <AreaDiv>
                    <input type="text" placeholder='평수입력' value={ft} onChange={ftChange}/>
                    <h4>평</h4>
                </AreaDiv>
                <Equel>=</Equel>
                <AreaDiv>
                    <input type="text" placeholder='㎡ 입력' value={m2} onChange={m2Change}/>
                    <h4>㎡</h4>
                </AreaDiv>
            </AreaDivBox>
        </AreaBox>
    </Container>
  )
}

export default Area