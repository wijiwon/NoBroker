import React from "react";
import axios from "../../Axios";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";

import DetailImage from '../detailImage/DetailImage';
import DetailText from '../detailText/DetailText';
import DetailBuy from '../detailBuy/DetailBuy';
import VoteBtn from '../voteBtn/VoteBtn';

import { DivList, LeftDiv, RightDiv, Divider, VoteDiv, VcDivider } from './detail.styled';
import DetailComment from '../detailComment/DetailComment';
import NavHeader from "../navbar/NavHeader";

const Detail = ({ queryClient, vote = false }) => {
  // 매물 아이디
  const { id } = useParams();

  // 조회수 올리기
  const viewEstate = async () => {
    // 현재 브라우저의 세션에 해당 매물 봤다는 기록이 있다면 조회수 올라감
    if (!window.sessionStorage.getItem(`viewEstate_${id}`)) {
      const { data } = await axios.post(`/detail/view/${id}`, {
        withCredentials: true
      });
      window.sessionStorage.setItem(`viewEstate_${id}`, true);
    }
  };

  viewEstate();

  if (!vote) {

    window.addEventListener("scroll", () => {
      if (!document.querySelector("[id='detailImage']")) {
        return;
      }
      if (
        window.scrollY >=
        document.querySelector("[id='detailImage']").getBoundingClientRect()
          .bottom +
        window.scrollY
      ) {
        document.querySelector("[id='rightDiv']").classList.add("fixed");
        // document.querySelector("[id='rightDiv']").style.position = "fixed";
        // document.querySelector("[id='rightDiv']").style.top = "0";
        console.log("vote : 이벤트", vote);
      } else {
        document.querySelector("[id='rightDiv']").classList.remove("fixed");
      }
    });
  }

  // 매물 상세 정보 요청
  const getEstateDetail = async () => {
    const { data } = await axios.get(`/detail/${id}`, {
      withCredentials: true,
    });
    console.log("받아온 데이터", data);
    return data;
  };

  const { data, isLoading } = useQuery(["estate", id], getEstateDetail);

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (data.error) {
    return <div>존재하지 않는 매물입니다.</div>;
  }

  return (
    <>
      <NavHeader></NavHeader>
      <div id='detailImage'>
        <DetailImage list={[data.estate.img_1, data.estate.img_2, data.estate.img_3, data.estate.img_4, data.estate.img_5, data.estate.img_6, data.estate.img_7]} />
      </div>

      {/* 투표 버튼 표시 */}
      {vote ?
        <>
          <DivList>
            <LeftDiv width={"50%"}>
              <DetailText estate={data.estate} />
            </LeftDiv>
            <VcDivider />
            <VoteDiv>
              <VoteBtn estate={data.estate} queryClient={queryClient} />
            </VoteDiv>
          </DivList>

        </>
        :
        <>
          <DivList>
            <LeftDiv>
              <DetailText estate={data.estate} />
              <Divider />
              <DetailComment estateId={data.estate.id} comment={data.estate.Comments} queryClient={queryClient}></DetailComment>

            </LeftDiv>
            <RightDiv id='rightDiv'>
              <DetailBuy estate={data.estate} seller={data.seller} like={data.like} queryClient={queryClient} />
            </RightDiv>
          </DivList>
        </>}
    </>
  );
};

export default Detail;
