"use client";

import { FormEvent, useEffect, useState } from "react";
import { StatusPill } from "./status-pill";
import { Locale, useLocale } from "./locale-provider";
import { auth } from "@/lib/firebase";
import { addFundingProject, loadResearcherProfile } from "@/lib/researcher-profile";

type FundingProject = { id:string; title:string; amount:number; description:string; createdAt:string };

const copy: Record<Locale, Record<string,string>> = {
  ko:{intro:"직접 등록한 연구 프로젝트와 공개 동의한 연구자 정보를 기반으로 연결합니다.",projectSaved:"프로젝트가 등록되었습니다.",close:"닫기",funding:"크라우드 펀딩",fundingIntro:"내 연구계획을 등록하고 협력 준비 정보를 관리합니다.",register:"프로젝트 등록",registered:"등록됨",goal:"목표 금액",created:"등록일",emptyProjects:"등록된 펀딩 프로젝트가 없습니다. 프로젝트 등록 버튼으로 첫 프로젝트를 추가하세요.",matching:"연구자·기관 매칭",matchingIntro:"공개에 동의한 실제 연구자 프로필만 표시됩니다.",noResearchers:"현재 공개된 연구자 프로필이 없습니다.",privacy:"가짜 추천 인물은 표시하지 않습니다. 추후 공개 동의 프로필 컬렉션이 준비되면 실제 사용자만 노출됩니다.",newProject:"펀딩 프로젝트 등록",projectName:"프로젝트명",projectNamePlaceholder:"연구 프로젝트명을 입력하세요",amount:"목표 금액",description:"프로젝트 설명",descriptionPlaceholder:"연구 목표와 활용 계획을 설명해 주세요.",submit:"등록하기"},
  en:{intro:"Connect through projects you registered and researcher profiles that consented to public display.",projectSaved:"Project registered.",close:"Close",funding:"Crowdfunding",fundingIntro:"Register your research plan and manage collaboration-ready information.",register:"Register project",registered:"Registered",goal:"Target amount",created:"Created",emptyProjects:"No funding projects yet. Add your first project with Register project.",matching:"Researcher & institution matching",matchingIntro:"Only real researcher profiles that consented to public display appear here.",noResearchers:"No public researcher profiles are currently available.",privacy:"No fictional recommendations are shown. Actual users will appear after public-profile consent is implemented.",newProject:"Register funding project",projectName:"Project name",projectNamePlaceholder:"Enter the research project name",amount:"Target amount",description:"Project description",descriptionPlaceholder:"Describe the research objectives and utilization plan.",submit:"Register"},
  zh:{intro:"基于您登记的项目和同意公开的真实研究人员档案建立联系。",projectSaved:"项目已登记。",close:"关闭",funding:"众筹",fundingIntro:"登记研究计划并管理合作准备信息。",register:"登记项目",registered:"已登记",goal:"目标金额",created:"登记日期",emptyProjects:"尚无众筹项目，请通过登记项目按钮添加第一个项目。",matching:"研究人员与机构匹配",matchingIntro:"仅显示同意公开的真实研究人员档案。",noResearchers:"目前没有公开的研究人员档案。",privacy:"不会显示虚构人物。公开档案同意功能完成后，仅显示真实用户。",newProject:"登记众筹项目",projectName:"项目名称",projectNamePlaceholder:"请输入研究项目名称",amount:"目标金额",description:"项目说明",descriptionPlaceholder:"请说明研究目标和应用计划。",submit:"登记"},
  ja:{intro:"自分で登録したプロジェクトと公開に同意した実在の研究者プロフィールを基に接続します。",projectSaved:"プロジェクトを登録しました。",close:"閉じる",funding:"クラウドファンディング",fundingIntro:"研究計画を登録し、共同研究の準備情報を管理します。",register:"プロジェクト登録",registered:"登録済み",goal:"目標金額",created:"登録日",emptyProjects:"登録済みプロジェクトはありません。プロジェクト登録から追加してください。",matching:"研究者・機関マッチング",matchingIntro:"公開に同意した実在の研究者プロフィールのみ表示します。",noResearchers:"現在公開中の研究者プロフィールはありません。",privacy:"架空の推薦人物は表示しません。公開同意機能の準備後、実在ユーザーのみ表示します。",newProject:"ファンディングプロジェクト登録",projectName:"プロジェクト名",projectNamePlaceholder:"研究プロジェクト名を入力",amount:"目標金額",description:"プロジェクト説明",descriptionPlaceholder:"研究目標と活用計画を説明してください。",submit:"登録"},
  vi:{intro:"Kết nối qua dự án bạn đã đăng ký và hồ sơ thật đã đồng ý công khai.",projectSaved:"Đã đăng ký dự án.",close:"Đóng",funding:"Gọi vốn cộng đồng",fundingIntro:"Đăng ký kế hoạch nghiên cứu và quản lý thông tin chuẩn bị hợp tác.",register:"Đăng ký dự án",registered:"Đã đăng ký",goal:"Số tiền mục tiêu",created:"Ngày tạo",emptyProjects:"Chưa có dự án gọi vốn. Hãy thêm dự án đầu tiên.",matching:"Kết nối nhà nghiên cứu và tổ chức",matchingIntro:"Chỉ hiển thị hồ sơ thật đã đồng ý công khai.",noResearchers:"Hiện chưa có hồ sơ nhà nghiên cứu công khai.",privacy:"Không hiển thị nhân vật hư cấu. Người dùng thật sẽ xuất hiện khi có chức năng đồng ý công khai.",newProject:"Đăng ký dự án gọi vốn",projectName:"Tên dự án",projectNamePlaceholder:"Nhập tên dự án nghiên cứu",amount:"Số tiền mục tiêu",description:"Mô tả dự án",descriptionPlaceholder:"Mô tả mục tiêu nghiên cứu và kế hoạch ứng dụng.",submit:"Đăng ký"},
};

export function NetworkClient() {
  const { locale, t } = useLocale();
  const ui = copy[locale];
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => { const user=auth.currentUser;if(user)void loadResearcherProfile(user.uid).then((profile) => setProjects(profile?.fundingProjects || [])); }, []);

  async function registerProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user=auth.currentUser;
    if(!user)return;
    const data=new FormData(event.currentTarget);
    const project={id:crypto.randomUUID(),title:String(data.get("title")||""),amount:Number(data.get("amount")||0),description:String(data.get("description")||""),createdAt:new Date().toISOString()};
    await addFundingProject(user.uid,project);
    setProjects((current) => [project,...current]);
    setModalOpen(false);
    setNotice(ui.projectSaved);
  }

  return <section className="network-page">
    <div className="page-title"><span className="section-label">RESEARCH NETWORK</span><h1>{t("networkTitle")}</h1><p>{ui.intro}</p></div>
    {notice && <div className="action-notice" role="status">{notice}<button onClick={() => setNotice("")}>{ui.close}</button></div>}
    <div className="network-section"><div className="card-heading"><div><h2>{ui.funding}</h2><p>{ui.fundingIntro}</p></div><button onClick={() => setModalOpen(true)}>{ui.register}</button></div>
      {projects.length ? projects.map((project) => <article className="funding-feature" key={project.id}><div><StatusPill tone="soft">{ui.registered}</StatusPill><h3>{project.title}</h3><p>{project.description}</p></div><div className="funding-progress"><b>{new Intl.NumberFormat(locale).format(project.amount)} KRW</b><small>{ui.goal} · {ui.created} {new Intl.DateTimeFormat(locale,{dateStyle:"medium"}).format(new Date(project.createdAt))}</small></div></article>) : <div className="empty-card">{ui.emptyProjects}</div>}
    </div>
    <div className="network-section"><div className="card-heading"><div><h2>{ui.matching}</h2><p>{ui.matchingIntro}</p></div></div><div className="empty-card"><b>{ui.noResearchers}</b><p>{ui.privacy}</p></div></div>
    {modalOpen && <div className="modal-backdrop" role="presentation"><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title"><button className="modal-close" aria-label={ui.close} onClick={() => setModalOpen(false)}>×</button><span className="section-label">NEW PROJECT</span><h2 id="project-modal-title">{ui.newProject}</h2><form onSubmit={(event) => void registerProject(event)}><label>{ui.projectName}<input name="title" required placeholder={ui.projectNamePlaceholder} /></label><label>{ui.amount}<input name="amount" required type="number" min="100000" placeholder="30000000" /></label><label>{ui.description}<textarea name="description" required placeholder={ui.descriptionPlaceholder} /></label><button type="submit">{ui.submit} →</button></form></section></div>}
  </section>;
}
