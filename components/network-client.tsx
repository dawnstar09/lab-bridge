"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { StatusPill } from "./status-pill";
import { Locale, useLocale } from "./locale-provider";
import { auth } from "@/lib/firebase";
import { addFundingProject, addMeetingRequest, loadResearcherProfile, ResearcherProfile } from "@/lib/researcher-profile";
import { matchKaistResearchers } from "@/lib/researcher-matching";

type FundingProject = { id:string; title:string; amount:number; description:string; createdAt:string };

const copy: Record<Locale, Record<string,string>> = {
  ko:{intro:"등록한 연구계획과 연구자 프로필을 바탕으로 협업 대상을 찾습니다.",saved:"프로젝트가 등록되었습니다.",requested:"미팅 요청을 저장했습니다.",close:"닫기",funding:"크라우드 펀딩",fundingIntro:"연구계획을 공개하고 초기 협력과 자원을 확보합니다.",register:"프로젝트 등록",registered:"등록됨",goal:"목표 금액",created:"등록일",empty:"등록한 프로젝트가 없습니다.",matching:"KAIST 연구실 매칭",matchingIntro:"전공·관심 연구·논문 키워드와 연구실 설명의 코사인 유사도로 정렬합니다.",source:"제공받은 KAIST 연구실 데이터",fit:"텍스트 적합도",meeting:"미팅 요청",meetingDone:"요청 저장됨",reason:"일치 키워드",low:"프로필의 관심 연구와 논문을 더 입력하면 매칭이 정교해집니다.",newProject:"펀딩 프로젝트 등록",name:"프로젝트명",amount:"목표 금액",description:"프로젝트 설명",submit:"등록하기"},
  en:{intro:"Find collaborators from your proposal and researcher profile.",saved:"Project registered.",requested:"Meeting request saved.",close:"Close",funding:"Crowdfunding",fundingIntro:"Publish a plan to secure early collaborators and resources.",register:"Register project",registered:"Registered",goal:"Goal",created:"Created",empty:"No projects registered.",matching:"KAIST lab matching",matchingIntro:"Sorted by cosine similarity across field, interests, publications, and lab descriptions.",source:"User-provided KAIST lab data",fit:"Text fit",meeting:"Request meeting",meetingDone:"Request saved",reason:"Matching terms",low:"Add interests and publications to improve matching.",newProject:"Register funding project",name:"Project name",amount:"Target amount",description:"Description",submit:"Register"},
  zh:{intro:"根据研究计划与研究者资料寻找合作对象。",saved:"项目已登记。",requested:"已保存会面请求。",close:"关闭",funding:"众筹",fundingIntro:"公开研究计划以寻找早期合作与资源。",register:"登记项目",registered:"已登记",goal:"目标金额",created:"登记日期",empty:"尚无项目。",matching:"KAIST 实验室匹配",matchingIntro:"按专业、兴趣、论文与实验室说明的余弦相似度排序。",source:"用户提供的 KAIST 实验室数据",fit:"文本匹配度",meeting:"请求会面",meetingDone:"已保存",reason:"匹配词",low:"添加研究兴趣与论文可提高准确度。",newProject:"登记众筹项目",name:"项目名称",amount:"目标金额",description:"项目说明",submit:"登记"},
  ja:{intro:"研究計画と研究者プロフィールから共同研究先を探します。",saved:"プロジェクトを登録しました。",requested:"面談依頼を保存しました。",close:"閉じる",funding:"クラウドファンディング",fundingIntro:"計画を公開して初期協力と資源を確保します。",register:"登録",registered:"登録済み",goal:"目標金額",created:"登録日",empty:"登録済みプロジェクトはありません。",matching:"KAIST研究室マッチング",matchingIntro:"専攻・関心・論文と研究室説明のコサイン類似度で並べます。",source:"提供されたKAIST研究室データ",fit:"テキスト適合度",meeting:"面談を依頼",meetingDone:"保存済み",reason:"一致語",low:"関心分野と論文を追加すると精度が上がります。",newProject:"プロジェクト登録",name:"プロジェクト名",amount:"目標金額",description:"説明",submit:"登録"},
  vi:{intro:"Tìm đối tác từ đề xuất và hồ sơ nhà nghiên cứu.",saved:"Đã đăng ký dự án.",requested:"Đã lưu yêu cầu gặp mặt.",close:"Đóng",funding:"Gọi vốn cộng đồng",fundingIntro:"Công khai kế hoạch để tìm cộng tác và nguồn lực.",register:"Đăng ký dự án",registered:"Đã đăng ký",goal:"Mục tiêu",created:"Ngày đăng",empty:"Chưa có dự án.",matching:"Ghép phòng thí nghiệm KAIST",matchingIntro:"Sắp xếp theo độ tương đồng cosine giữa hồ sơ và mô tả phòng thí nghiệm.",source:"Dữ liệu KAIST do người dùng cung cấp",fit:"Độ phù hợp",meeting:"Yêu cầu gặp",meetingDone:"Đã lưu",reason:"Từ khóa khớp",low:"Thêm sở thích và bài báo để tăng độ chính xác.",newProject:"Đăng ký dự án",name:"Tên dự án",amount:"Số tiền mục tiêu",description:"Mô tả",submit:"Đăng ký"},
};

export function NetworkClient() {
  const { locale, t } = useLocale();
  const ui = copy[locale];
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const matches = useMemo(() => matchKaistResearchers(profile), [profile]);
  const requestedIds = new Set(profile?.meetingRequests?.map((item) => item.id) || []);

  useEffect(() => { const user=auth.currentUser;if(user)void loadResearcherProfile(user.uid).then((value) => { setProfile(value);setProjects(value?.fundingProjects || []); }); }, []);

  async function registerProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const user=auth.currentUser;if(!user)return;
    const data=new FormData(event.currentTarget); const project={id:crypto.randomUUID(),title:String(data.get("title")||""),amount:Number(data.get("amount")||0),description:String(data.get("description")||""),createdAt:new Date().toISOString()};
    await addFundingProject(user.uid,project); setProjects((current) => [project,...current]); setModalOpen(false); setNotice(ui.saved);
  }

  async function requestMeeting(id: string, researcher: string) {
    const user=auth.currentUser;if(!user || requestedIds.has(id))return;
    const request={id,researcher,createdAt:new Date().toISOString()}; await addMeetingRequest(user.uid,request);
    setProfile((current) => current ? { ...current, meetingRequests:[...(current.meetingRequests || []),request] } : current); setNotice(ui.requested);
  }

  return <section className="network-page">
    <div className="page-title"><span className="section-label">RESEARCH NETWORK</span><h1>{t("networkTitle")}</h1><p>{ui.intro}</p></div>
    {notice && <div className="action-notice" role="status">{notice}<button onClick={() => setNotice("")}>{ui.close}</button></div>}
    <div className="network-section"><div className="card-heading"><div><h2>{ui.funding}</h2><p>{ui.fundingIntro}</p></div><button onClick={() => setModalOpen(true)}>{ui.register}</button></div>
      {projects.length ? projects.map((project) => <article className="funding-feature" key={project.id}><div><StatusPill tone="soft">{ui.registered}</StatusPill><h3>{project.title}</h3><p>{project.description}</p></div><div className="funding-progress"><b>{new Intl.NumberFormat(locale).format(project.amount)} KRW</b><small>{ui.goal} · {ui.created} {new Intl.DateTimeFormat(locale,{dateStyle:"medium"}).format(new Date(project.createdAt))}</small></div></article>) : <div className="empty-card">{ui.empty}</div>}
    </div>
    <div className="network-section"><div className="card-heading"><div><span className="section-label">COSINE MATCHING</span><h2>{ui.matching}</h2><p>{ui.matchingIntro}</p></div><small className="data-source">{ui.source}</small></div>
      <p className="matching-note">{ui.low}</p><div className="researcher-list">{matches.map((item,index) => <article key={item.id}><div className="match-rank">{String(index+1).padStart(2,"0")}</div><div><div className="match-meta"><StatusPill tone="line">{item.department}</StatusPill><b>{ui.fit} {item.score}%</b></div><h3>{item.lab}</h3><p><strong>{item.professor}</strong>{item.matchedKeywords.length ? ` · ${ui.reason}: ${item.matchedKeywords.join(", ")}` : ""}</p></div><button disabled={requestedIds.has(item.id)} onClick={() => void requestMeeting(item.id,item.professor)}>{requestedIds.has(item.id) ? ui.meetingDone : `${ui.meeting} →`}</button></article>)}</div>
    </div>
    {modalOpen && <div className="modal-backdrop"><section className="form-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label={ui.close} onClick={() => setModalOpen(false)}>×</button><span className="section-label">NEW PROJECT</span><h2>{ui.newProject}</h2><form onSubmit={(event) => void registerProject(event)}><label>{ui.name}<input name="title" required /></label><label>{ui.amount}<input name="amount" required type="number" min="100000" /></label><label>{ui.description}<textarea name="description" required /></label><button type="submit">{ui.submit} →</button></form></section></div>}
  </section>;
}
