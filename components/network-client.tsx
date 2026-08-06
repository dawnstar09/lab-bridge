"use client";

import { FormEvent, useState } from "react";
import { StatusPill } from "./status-pill";
import { Locale, useLocale } from "./locale-provider";

type Copy = Record<string, string>;

const networkCopy: Record<Locale, Copy> = {
  ko: { intro:"경험을 나누고 함께 연구할 동료를 만나보세요.",projectSaved:"프로젝트가 등록되었습니다. 마이페이지에서 상태를 확인할 수 있습니다.",meetingSent:"님에게 미팅 요청을 보냈습니다.",close:"닫기",funding:"크라우드 펀딩",fundingIntro:"연구계획을 공개하고 초기 협력과 자원을 확보합니다.",register:"프로젝트 등록",active:"진행 중",fundingTitle:"다국어 연구행정 지원을 위한 생성형 AI 모델",fundingText:"외국인 연구자가 한국 연구 행정에 빠르게 적응하도록 돕는 오픈소스 모델을 개발합니다.",goal:"목표",days:"18일 남음",matching:"연구자·기관 매칭",matchingIntro:"프로필과 연구 키워드를 기반으로 추천합니다.",recommended:"추천만 보기",viewAll:"전체 보기",requested:"요청 완료",request:"미팅 요청",newProject:"펀딩 프로젝트 등록",projectName:"프로젝트명",projectNamePlaceholder:"연구 프로젝트명을 입력하세요",amount:"목표 금액",description:"프로젝트 설명",descriptionPlaceholder:"연구 목표와 활용 계획을 설명해 주세요.",submit:"등록하기",joint:"공동연구",mentoring:"멘토링",recruiting:"연구자 모집" },
  en: { intro:"Share experience and meet collaborators for your next research project.",projectSaved:"Project registered. You can check its status on My Page.",meetingSent:" — meeting request sent.",close:"Close",funding:"Crowdfunding",fundingIntro:"Publish your research plan and secure early collaborators and resources.",register:"Register project",active:"Active",fundingTitle:"Generative AI for multilingual research administration",fundingText:"Developing an open-source model that helps international researchers adapt quickly to Korean research administration.",goal:"Goal",days:"18 days left",matching:"Researcher & institution matching",matchingIntro:"Recommendations based on your profile and research keywords.",recommended:"Recommended only",viewAll:"View all",requested:"Requested",request:"Request meeting",newProject:"Register funding project",projectName:"Project name",projectNamePlaceholder:"Enter the research project name",amount:"Target amount",description:"Project description",descriptionPlaceholder:"Describe the research objectives and utilization plan.",submit:"Register",joint:"Joint research",mentoring:"Mentoring",recruiting:"Recruiting researchers" },
  zh: { intro:"分享经验，寻找共同开展研究的伙伴。",projectSaved:"项目已登记，可在个人页面查看状态。",meetingSent:"的会议请求已发送。",close:"关闭",funding:"众筹",fundingIntro:"公开研究计划，获得早期合作和资源支持。",register:"登记项目",active:"进行中",fundingTitle:"面向多语言研究行政的生成式 AI 模型",fundingText:"开发开源模型，帮助外国研究人员快速适应韩国研究行政体系。",goal:"目标",days:"剩余18天",matching:"研究人员与机构匹配",matchingIntro:"根据个人档案和研究关键词进行推荐。",recommended:"仅看推荐",viewAll:"查看全部",requested:"已请求",request:"请求会议",newProject:"登记众筹项目",projectName:"项目名称",projectNamePlaceholder:"请输入研究项目名称",amount:"目标金额",description:"项目说明",descriptionPlaceholder:"请说明研究目标和应用计划。",submit:"登记",joint:"共同研究",mentoring:"指导",recruiting:"招募研究人员" },
  ja: { intro:"経験を共有し、共に研究する仲間を見つけましょう。",projectSaved:"プロジェクトを登録しました。マイページで状況を確認できます。",meetingSent:"さんにミーティング依頼を送信しました。",close:"閉じる",funding:"クラウドファンディング",fundingIntro:"研究計画を公開し、初期の協力とリソースを確保します。",register:"プロジェクト登録",active:"進行中",fundingTitle:"多言語研究行政支援のための生成AIモデル",fundingText:"外国人研究者が韓国の研究行政に早く適応できるオープンソースモデルを開発します。",goal:"目標",days:"残り18日",matching:"研究者・機関マッチング",matchingIntro:"プロフィールと研究キーワードに基づいて推薦します。",recommended:"推薦のみ",viewAll:"すべて見る",requested:"依頼済み",request:"ミーティング依頼",newProject:"ファンディングプロジェクト登録",projectName:"プロジェクト名",projectNamePlaceholder:"研究プロジェクト名を入力",amount:"目標金額",description:"プロジェクト説明",descriptionPlaceholder:"研究目標と活用計画を説明してください。",submit:"登録",joint:"共同研究",mentoring:"メンタリング",recruiting:"研究者募集" },
  vi: { intro:"Chia sẻ kinh nghiệm và gặp gỡ cộng sự nghiên cứu.",projectSaved:"Đã đăng ký dự án. Bạn có thể xem trạng thái tại Trang cá nhân.",meetingSent:" — đã gửi yêu cầu họp.",close:"Đóng",funding:"Gọi vốn cộng đồng",fundingIntro:"Công khai kế hoạch nghiên cứu để tìm cộng sự và nguồn lực ban đầu.",register:"Đăng ký dự án",active:"Đang thực hiện",fundingTitle:"AI tạo sinh hỗ trợ quản trị nghiên cứu đa ngôn ngữ",fundingText:"Phát triển mô hình mã nguồn mở giúp nhà nghiên cứu quốc tế nhanh chóng thích nghi với quản trị nghiên cứu tại Hàn Quốc.",goal:"Mục tiêu",days:"Còn 18 ngày",matching:"Kết nối nhà nghiên cứu và tổ chức",matchingIntro:"Đề xuất dựa trên hồ sơ và từ khóa nghiên cứu.",recommended:"Chỉ đề xuất",viewAll:"Xem tất cả",requested:"Đã yêu cầu",request:"Yêu cầu họp",newProject:"Đăng ký dự án gọi vốn",projectName:"Tên dự án",projectNamePlaceholder:"Nhập tên dự án nghiên cứu",amount:"Số tiền mục tiêu",description:"Mô tả dự án",descriptionPlaceholder:"Mô tả mục tiêu nghiên cứu và kế hoạch ứng dụng.",submit:"Đăng ký",joint:"Nghiên cứu chung",mentoring:"Cố vấn",recruiting:"Tuyển nhà nghiên cứu" },
};

const researchers = [
  { name:"김지훈 연구원", org:{ ko:"KAIST 전산학부",en:"KAIST School of Computing",zh:"KAIST 计算学院",ja:"KAIST 電算学部",vi:"Khoa Máy tính KAIST" }, topic:{ ko:"AI 기반 신약 개발",en:"AI-based drug discovery",zh:"基于 AI 的新药研发",ja:"AI創薬",vi:"Phát triển thuốc bằng AI" }, tag:"joint" },
  { name:"Anna Müller", org:{ ko:"한국화학연구원",en:"Korea Research Institute of Chemical Technology",zh:"韩国化学研究院",ja:"韓国化学研究院",vi:"Viện Nghiên cứu Công nghệ Hóa học Hàn Quốc" }, topic:{ ko:"지속가능 촉매 시스템",en:"Sustainable catalytic systems",zh:"可持续催化系统",ja:"持続可能な触媒システム",vi:"Hệ xúc tác bền vững" }, tag:"mentoring" },
  { name:"박서연 교수", org:{ ko:"충남대학교",en:"Chungnam National University",zh:"忠南大学",ja:"忠南大学校",vi:"Đại học Quốc gia Chungnam" }, topic:{ ko:"바이오 데이터 분석",en:"Biological data analysis",zh:"生物数据分析",ja:"バイオデータ解析",vi:"Phân tích dữ liệu sinh học" }, tag:"recruiting" },
  { name:"David Chen", org:{ ko:"ETRI",en:"ETRI",zh:"ETRI 韩国电子通信研究院",ja:"ETRI 韓国電子通信研究院",vi:"ETRI" }, topic:{ ko:"다국어 자연어 처리",en:"Multilingual natural language processing",zh:"多语言自然语言处理",ja:"多言語自然言語処理",vi:"Xử lý ngôn ngữ tự nhiên đa ngôn ngữ" }, tag:"joint" },
  { name:"이하늘 박사", org:{ ko:"기초과학연구원",en:"Institute for Basic Science",zh:"基础科学研究院",ja:"基礎科学研究院",vi:"Viện Khoa học Cơ bản" }, topic:{ ko:"계산과학",en:"Computational science",zh:"计算科学",ja:"計算科学",vi:"Khoa học tính toán" }, tag:"mentoring" },
] as const;

export function NetworkClient() {
  const { locale, t } = useLocale();
  const ui = networkCopy[locale];
  const [showAll, setShowAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [requested, setRequested] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  function registerProject(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setModalOpen(false); setNotice(ui.projectSaved); }
  function requestMeeting(name: string) { setRequested((current) => [...current, name]); setNotice(locale === "ko" || locale === "ja" || locale === "zh" ? `${name}${ui.meetingSent}` : `${name}${ui.meetingSent}`); }

  return <section className="network-page">
    <div className="page-title"><span className="section-label">RESEARCH NETWORK</span><h1>{t("networkTitle")}</h1><p>{ui.intro}</p></div>
    {notice && <div className="action-notice" role="status">{notice}<button onClick={() => setNotice("")}>{ui.close}</button></div>}
    <div className="network-section"><div className="card-heading"><div><h2>{ui.funding}</h2><p>{ui.fundingIntro}</p></div><button onClick={() => setModalOpen(true)}>{ui.register}</button></div>
      <article className="funding-feature"><div><StatusPill tone="soft">{ui.active}</StatusPill><h3>{ui.fundingTitle}</h3><p>{ui.fundingText}</p></div><div className="funding-progress"><b>72%</b><span><i /></span><small>{ui.goal} 30,000,000 KRW · {ui.days}</small></div></article>
    </div>
    <div className="network-section"><div className="card-heading"><div><h2>{ui.matching}</h2><p>{ui.matchingIntro}</p></div><button onClick={() => setShowAll((value) => !value)}>{showAll ? ui.recommended : ui.viewAll}</button></div>
      <div className="researcher-list">{researchers.slice(0, showAll ? researchers.length : 3).map((researcher, index) => <article key={researcher.name}><span className="avatar">{String(index + 1).padStart(2, "0")}</span><div><StatusPill tone="line">{ui[researcher.tag]}</StatusPill><h3>{researcher.name}</h3><p>{researcher.org[locale]} · {researcher.topic[locale]}</p></div><button disabled={requested.includes(researcher.name)} onClick={() => requestMeeting(researcher.name)}>{requested.includes(researcher.name) ? ui.requested : `${ui.request} →`}</button></article>)}</div>
    </div>
    {modalOpen && <div className="modal-backdrop" role="presentation"><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title"><button className="modal-close" aria-label={ui.close} onClick={() => setModalOpen(false)}>×</button><span className="section-label">NEW PROJECT</span><h2 id="project-modal-title">{ui.newProject}</h2><form onSubmit={registerProject}><label>{ui.projectName}<input required placeholder={ui.projectNamePlaceholder} /></label><label>{ui.amount}<input required type="number" min="100000" placeholder="30000000" /></label><label>{ui.description}<textarea required placeholder={ui.descriptionPlaceholder} /></label><button type="submit">{ui.submit} →</button></form></section></div>}
  </section>;
}
