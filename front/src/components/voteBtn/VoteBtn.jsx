import React from 'react'
import axios from '../../Axios'
import { useQuery, useMutation } from 'react-query'
import { VoteDiv, Btn, BtnDiv, H1, Chart, Bar, Text, VerChart } from './voteBtn.styled'
import { useAuth } from 'AuthContext';

const VoteBtn = ({ estate, queryClient }) => {
  // 투표, 투표 완료했을때 보여지는 부분
  // estate의 투표 가능 여부에 따라 버튼 표시
  // detail에서 해당 유저가 투표한 적 있는지 여부 확인(정보 표시)

  const { isCertificate, certificate, logout } = useAuth();

  const createMutation = useMutation(
    async (vote) => {
      const { data } = await axios.post(
        "/vote/voteEstate",
        vote,
        {
          withCredentials: true,
        }
      );
      return data;
    },
    {
      onSuccess: (data) => {
        if (data.message && data.message == "성공") {
          queryClient.invalidateQueries("vote");
        } else if (data.message && data.message == "투표할 수 있는 권한이 없습니다.") {
          window.alert("권한이 없습니다.");
          certificate(false);
          return;
        } else if (data.message && data.message == "다시 로그인") {
          window.alert("로그인 하세요.");
          logout();
          certificate(false);
          return;
        } else {
          alert("오류 발생");
        }
      },
    }
  );

  // 정상/허위매물 버튼 클릭하면 실행되는 함수
  const voteEstate = (result) => {
    if (!isCertificate) {
      window.alert("권한이 없습니다.");
      return;
    }

    let str;
    result ? str = "정상 매물" : str = "허위 매물";
    if (!window.confirm(str + "에 투표하시겠습니까? ")) {
      return;
    }

    createMutation.mutate({
      real_estate_id: estate.id,
      result
    });
  };

  const getUserVote = async () => {
    const { data } = await axios.get(`/vote/getUserVote/${estate.id}`, {
      withCredentials: true,
    });
    console.log("받아온 데이터", data);
    return data;
  }

  const { data, isLoading } = useQuery(["vote", estate.id], getUserVote);

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <>
      {
        !data?.certificate_user
          ?
          <>
            <H1>투표 권한 없음</H1>
          </>
          :
          <>
            <VoteDiv>
              <H1>투표</H1>
              <div>
                <Text>진행률 {data.voteCounts.voteCount != 0 ? <>{Math.ceil(data.voteCounts.voteCount / data.voteCounts.maxVote * 100)}%</> : "0%"} ({data.voteCounts.voteCount}표)</Text>
                <Chart>
                  {data.voteCounts.voteCount != 0 ? <Bar width={`${Math.ceil(data.voteCounts.voteCount / data.voteCounts.maxVote * 100)}%`} backgroundColor={"orange"} /> : <Bar width={`1px`} backgroundColor={"orange"} />}

                  <Bar width={`${Math.ceil((data.voteCounts.maxVote - data.voteCounts.voteCount) / data.voteCounts.maxVote * 100)}%`} backgroundColor={"gray"} />
                </Chart>
              </div>

              <h3>득표율</h3>
              <VerChart>
                {data.voteCounts.trueCount == 0 && data.voteCounts.falseCount == 0 ?

                  // <><div>정상매물 0표</div><div>허위매물 0표</div></>
                  <>
                    <Text>정상매물 0% (0표)</Text>
                    <Bar width={`1px`}></Bar>
                    <Text>허위매물 0% (0표)</Text>
                    <Bar width={`1px`}></Bar>
                  </>
                  :
                  <>
                    <Text>정상매물 {Math.ceil(data.voteCounts.trueCount / data.voteCounts.voteCount * 100)}% ({data.voteCounts.trueCount}표)</Text>
                    <Bar width={`${data.voteCounts.trueCount / data.voteCounts.voteCount * 100}%`} backgroundColor={"orange"}></Bar>
                    <Text>허위매물 {Math.ceil(data.voteCounts.falseCount / data.voteCounts.voteCount * 100)}% ({data.voteCounts.falseCount}표)</Text>
                    <Bar width={`${data.voteCounts.falseCount / data.voteCounts.voteCount * 100}%`} backgroundColor={"orange"}></Bar>
                  </>}
              </VerChart>
              <BtnDiv>
                {estate.accpet == 0 ? data.vote?.result != null ? <><Btn backgroundColor="gray">투표 불가</Btn></> : <><Btn backgroundColor="orange" onClick={() => { voteEstate(true) }}>정상매물</Btn> <Btn backgroundColor="gray" onClick={() => { voteEstate(false) }}>허위매물</Btn></> : <><Btn backgroundColor="gray">투표 불가</Btn></>}
              </BtnDiv>
            </VoteDiv>
          </>
      }
      {/* <H1>투표</H1>
      <div>
        현재 투표 : {data.voteCounts.voteCount}표
        정상 매물 : {data.voteCounts.trueCount}표
        허위 매물 : {data.voteCounts.falseCount}표
        최대 투표 가능 수 : {data.voteCounts.maxVote}표

        진행률 : {data.voteCounts.voteCount!=0 ? <>{Math.ceil(data.voteCounts.voteCount / data.voteCounts.maxVote * 100)}%</> : "0%"}
      </div>
      <BtnDiv>
        {estate.accpet == 0 ? data.vote?.result != null ? <><Btn backgroundColor="gray">투표 불가</Btn></> : <><Btn backgroundColor="green" onClick={() => { voteEstate(true) }}>정상매물</Btn> <Btn backgroundColor="red" onClick={() => { voteEstate(false) }}>허위매물</Btn></> : <><Btn backgroundColor="gray">투표 불가</Btn></>}
      </BtnDiv> */}
    </>

  )
}

export default VoteBtn