export type Program = {
  id: string; title: string; ministry: string; agency: string; status: string;
  start: string; deadline: string; deadlineTime: string; posted: string;
  contact: string; url: string; noticeType: string; amount: string; programName: string;
  fieldCodes: string[]; specialtyCodes: string[]; activities: string[]; keywords: string[];
};

type RawProgram = [string,string,string,string,string,string,string,string,string,string,string,string,string,string];

const rawPrograms: RawProgram[] = [
  ["24","2026년도 중소기업연구인력지원(R/D) 공공연 연구인력 파견지원 사업 주관연구개발기관 모집 공고","중소벤처기업부","중소기업기술정보진흥원","마감","2026.02.20","2026.02.26","22:00","2026.02.20","044-300-0411, 044-300-0818","https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=019301&bsnsYyDetail=2026&sorgnBsnsCd=S003314&bsnsAncmSn=1","본공고","35865000000","중소기업연구인력지원(R&D)"],
  ["23","2024년도 바이오‧의료기술개발사업 신규과제(GloPID-R) 재공모(2차)","과학기술정보통신부","한국연구재단","마감","2024.05.22","2024.06.06","18:00","2024.06.03","042-860-4721","https://nrf.re.kr/biz/info/notice/view?menu_no=378&biz_no=104&nts_no=220829&biz_not_gubn=guide","수요조사","0","바이오의료기술개발사업"],
  ["22","2024년도 바이오‧의료기술개발사업(GloPID-R) 신규과제 재공모('24.5.2. 수정)","과학기술정보통신부","한국연구재단","마감","2024.05.02","2024.05.16","18:00","2024.04.25","042-860-4721","https://nrf.re.kr/biz/info/notice/view?menu_no=378&biz_no=104&nts_no=218360&biz_not_gubn=guide","수요조사","0","바이오의료기술개발사업"],
  ["21","이음5G-R을 위한 MCX 서버 제작 (재공고)","과학기술정보통신부","한국철도기술연구원","마감","2024.03.13","2024.03.19","12:00","2024.03.13","031-460-5387, 031-460-5174","https://www.krri.re.kr/web/contents/krri030401.do?id=22709","본공고","85000000",""],
  ["20","(입찰공고) 제2024-047호 이음5G-R을 위한 MCX 서버 제작","과학기술정보통신부","한국철도기술연구원","마감","2024.03.05","2024.03.13","12:00","2024.03.05","031-460-5387, 031-460-5166","https://www.krri.re.kr/web/contents/krri030401.do?id=22672","본공고","85000000",""],
  ["19","(재공고) 제2024-034호 이음5G-R 멀티 액세스 엣지 컴퓨팅(MEC) 플랫폼 제작","과학기술정보통신부","한국철도기술연구원","마감","2024.03.06","2024.03.06","15:00","2024.02.27","031-460-5365, 031-460-5299","https://www.krri.re.kr/web/contents/krri030401.do?id=22659","본공고","75000000","플랫폼 제작 및 설치"],
  ["18","이음5G-R 멀티 액세스 엣지 컴퓨팅(MEC) 플랫폼 제작 및 설치","과학기술정보통신부","한국철도기술연구원","마감","2024.02.20","2024.03.27","11:00","2024.02.20","031-460-5365, 031-460-5299","https://www.krri.re.kr/web/contents/krri030401.do?id=22643","본공고","75000000","이음5G-R 멀티 액세스 엣지 컴퓨팅"],
  ["17","2024년도 바이오‧의료기술개발사업(GloPID-R 기반 감염병 국제협력 연구) 신규과제(세부과제) 공모","과학기술정보통신부","한국연구재단","마감","2024.01.24","2024.02.13","18:00","2024.01.29","042-860-4721","https://nrf.re.kr/biz/info/notice/view?menu_no=378&biz_no=104&nts_no=211508&biz_not_gubn=guide","본공고","0","바이오의료기술개발사업"],
  ["16","2023년도 바이오‧의료기술개발사업(GloPID-R 기반 감염병 국제협력 연구) 신규과제(세부과제) 2차 공모","과학기술정보통신부","한국연구재단","마감","2023.04.17","2023.04.24","18:00","2023.04.14","042-860-4721","https://nrf.re.kr/biz/info/notice/view?menu_no=378&biz_no=104&nts_no=196319&biz_not_gubn=guide","본공고","과제별 상이","바이오의료기술개발사업"],
  ["15","2023년도 바이오‧의료기술개발사업(GloPID-R 기반 감염병 국제협력 연구) 신규과제(세부과제) 공모","과학기술정보통신부","한국연구재단","마감","2023.01.30","2023.02.10","18:00","2023.01.31","042-860-4721","https://nrf.re.kr/biz/info/notice/view?menu_no=378&biz_no=104&nts_no=191511&biz_not_gubn=guide","본공고","과제별 상이","바이오의료기술개발사업"],
  ["14","만성 피로(Chronic fatigue: R53) 환자에 대한 한약처방 안전성·유효성 임상시험 평가","과학기술정보통신부","한국한의학연구원","마감","2022.03.25","2022.04.05","11:00","2022.03.25","042-868-9464, 042-869-2737","https://www.g2b.go.kr:8081/ep/invitation/publish/bidInfoDtl.do?bidno=20220341249&bidseq=00","본공고","110000000",""],
  ["13","2022년도 지역 이공계 여성인재 양성 사업(R-WeSET 2.0) 모집 공고","과학기술정보통신부","과학기술정보통신부","마감","2021.11.02","2021.12.13","17:00","2021.11.02","02-6411-1018, 02-6411-1034","https://www.msit.go.kr/bbs/view.do?bbsSeqNo=100&nttSeqNo=3177450","본공고","500000000",""],
  ["12","2021년 재도전성공패키지 TIPS-R 재창업기업 2차 모집 수정 공고","중소벤처기업부","중소벤처기업부","마감","2021.05.17","2021.06.03","18:00","2021.05.06","02-3440-7421","https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&bcIdx=1026347","본공고","100000000",""],
  ["11","국가 수자원 R&D 중장기 로드맵 수립 연구 입찰 공고","환경부","환경부","마감","2021.04.09","2021.04.13","12:00","2021.03.31","044-201-7613, 044-201-6262","http://www.me.go.kr/home/web/board/read.do?boardId=1442180","본공고","95000000",""],
  ["10","2021년 팁스(TIPS / Pre-TIPS / Post-TIPS / TIPS-R) 창업기업 지원계획 통합공고","중소벤처기업부","중소기업기술정보진흥원","-","과제별 상이","과제별 상이","과제별 상이","2021.01.27","02-3440-7421","http://www.smtech.go.kr/front/ifg/no/notice02_detail.do?ancmId=S01031","본공고","과제별 상이","창업성장기술개발"],
  ["9","2020년도 대·중소기업 동반성장 R&D 지원사업 시행계획 공고","기타","경기도경제과학진흥원","마감","2020.06.01","2020.06.11","18:00","2020.04.13","031-776-4853","http://www.egbiz.or.kr/prjCategory/a/m/selectPrjView.do?prjDegreeId=PD000000017282","본공고","150000000",""],
  ["8","고양시 2020년 R&D기획 및 가치 평가 지원사업 공고","기타","고양지식정보산업진흥원","마감","2020.03.02","2020.03.30","14:00","2020.03.02","031-960-7842","http://www.egbiz.or.kr/prjCategory/a/m/selectPrjView.do?prjDegreeId=PD000000016794","본공고","5000000",""],
  ["7","ITU-R의 주파수 수요 및 공급에 대한 균형적인 관리 방법론 연구","과학기술정보통신부","한국전자통신연구원","마감","2019.04.05","2019.04.19","24:00","2019.04.05","042-860-5416","https://pcm.etri.re.kr/pcmx/comm/anno/annoView.do?copertn_partcptn_org_pssrp_no=4011-2019-00049","본공고","30000000",""],
  ["6","디지털 성범죄 피해방지 아이디어·R&D 기획 공모전","방송통신위원회","한국방송통신전파진흥원","마감","2019.01.30","2019.04.05","18:00","2019.01.30","02-4951-2847","http://www.kca.kr/open_content/bbs.do?act=detail&msg_no=12335&bcd=notice","수요조사","0",""],
  ["5","2016년 창업인력양성 연계 융합형 콘텐츠 R&D 지원 사업 공고","문화체육관광부","문화체육관광부","마감","","2016.12.31","00:00","2016.02.23","","http://www.mcst.go.kr/web/s_notice/notice/noticeView.jsp?pSeq=10859","","0",""],
  ["4","2014년도 중소기업 적합업종 및 국내복귀(U턴) 기업 R&D 지원사업 시행계획 공고","중소기업청","중소기업청","마감","","2014.06.02","00:00","2014.05.02","","http://www.smba.go.kr/board/boardView.do?board_id=SMBA_PUBLIC_14&seq=46279","","0",""],
  ["3","2014년도 중소기업 R&D기획역량제고 시행계획 통합 공고(2차)","중소기업청","중소기업청","마감","","2014.05.27","00:00","2014.05.01","","http://www.smba.go.kr/board/boardView.do?board_id=SMBA_PUBLIC_14&seq=46267","","0",""],
  ["2","2013년 여성과학기술인 R&D경력복귀지원사업 참여인력 및 참여기관 모집 공고","미래창조과학부","미래창조과학부","마감","","2013.06.21","00:00","2013.05.23","","http://www.msip.go.kr/Board_detailForm.action?bbsId=64&bbsNo=657","","0",""],
  ["1","문화유산융복합연구(R&D) 수요과제 연구용역(보존)","문화재청","문화재청 국립문화재연구소","마감","","2011.07.13","00:00","2011.06.28","","http://nrich.go.kr","","0",""],
];

function classification(title: string) {
  const text = title.toLowerCase();
  if (/바이오|의료|감염병|임상|한약|환자/.test(text)) return { fieldCodes:["medical-health"], specialtyCodes:["biotechnology","clinical-medicine","pharmacy"], activities:["project-participation","joint-research"], keywords:["바이오","의료","임상","감염병","신약"] };
  if (/5g|mcx|mec|서버|컴퓨팅|주파수|디지털/.test(text)) return { fieldCodes:["engineering-technology"], specialtyCodes:["electrical-information","computer-science","data-hpc"], activities:["project-participation","technology-transfer"], keywords:["5G","통신","서버","MEC","컴퓨팅","주파수"] };
  if (/수자원|환경/.test(text)) return { fieldCodes:["natural-sciences","engineering-technology"], specialtyCodes:["earth-environment","civil","policy-administration"], activities:["project-participation"], keywords:["수자원","환경","로드맵"] };
  if (/여성|인력|인재|경력복귀|파견/.test(text)) return { fieldCodes:["convergence"], specialtyCodes:["other"], activities:["personnel-funding","project-participation"], keywords:["연구인력","인재","경력","파견"] };
  if (/tips|창업|기업|사업화|가치 평가|기획역량/.test(text)) return { fieldCodes:["convergence","engineering-technology"], specialtyCodes:["economics-business","policy-administration"], activities:["startup","technology-transfer"], keywords:["창업","기업","사업화","R&D기획"] };
  if (/문화|콘텐츠|유산|보존/.test(text)) return { fieldCodes:["humanities-arts","convergence"], specialtyCodes:["humanities","materials"], activities:["project-participation"], keywords:["문화유산","콘텐츠","보존","융합"] };
  return { fieldCodes:["convergence"], specialtyCodes:["other"], activities:["project-participation","joint-research"], keywords:["R&D","공동연구"] };
}

export const programs: Program[] = rawPrograms.map(([number,title,ministry,agency,status,start,deadline,deadlineTime,posted,contact,url,noticeType,amount,programName]) => ({
  id:`notice-${number}`, title, ministry, agency, status, start, deadline, deadlineTime, posted, contact, url, noticeType, amount, programName, ...classification(title),
}));
