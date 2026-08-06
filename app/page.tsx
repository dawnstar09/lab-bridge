"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { StatusPill } from "@/components/status-pill";
import { Locale, useLocale } from "@/components/locale-provider";
import { programs } from "@/lib/programs";

const homeCopy: Record<Locale, Record<string, string | string[]>> = {
  ko: { recommend:"맞춤 추천",hero:"연구자를 위한 R&D 사업을 확인하세요.",heroText:"연구 분야와 경력에 맞는 공고를 한곳에서 비교합니다.",network:"연구 네트워크",networkHero:"함께 연구할 동료와 기관을 만나보세요.",networkText:"대전의 연구자·기관과 실질적인 협업을 시작합니다.",notices:"사업 공고문",viewAll:"전체 보기",noticeItems:["2026년도 국제공동연구 신규과제 공모","외국인 연구자 정착지원 프로그램 안내","대덕특구 기술사업화 지원사업 모집"],find:"사업 찾기",findSub:"통합 공고 검색",write:"계획서 작성",writeSub:"AI 작성 도우미",meeting:"연구자 미팅",meetingSub:"협업 파트너 찾기",manage:"내 연구 관리",manageSub:"성과와 지원 현황",footer:"외국인 연구자를 위한 연구 성장 플랫폼" },
  en: { recommend:"Personalized recommendations",hero:"Find R&D programs built for your research.",heroText:"Compare opportunities matched to your field and career stage in one place.",network:"Research network",networkHero:"Meet researchers and institutions ready to collaborate.",networkText:"Start practical collaboration with researchers and institutions in Daejeon.",notices:"Program announcements",viewAll:"View all",noticeItems:["2026 International Joint Research Call","International Researcher Settlement Support Program","Daedeok Innopolis Technology Commercialization Support"],find:"Find programs",findSub:"Search integrated calls",write:"Write proposal",writeSub:"AI writing assistant",meeting:"Research meetings",meetingSub:"Find collaborators",manage:"Manage my research",manageSub:"Achievements and applications",footer:"Research growth platform for international researchers" },
  zh: { recommend:"个性化推荐",hero:"查找适合您研究的 R&D 项目。",heroText:"集中比较与研究领域和职业阶段相匹配的公告。",network:"研究网络",networkHero:"寻找共同研究的人员和机构。",networkText:"与大田的研究人员和机构开展实际合作。",notices:"项目公告",viewAll:"查看全部",noticeItems:["2026年度国际联合研究新项目征集","外国研究人员安顿支持项目","大德研究特区技术商业化支持项目"],find:"查找项目",findSub:"综合公告搜索",write:"撰写计划书",writeSub:"AI 写作助手",meeting:"研究会议",meetingSub:"寻找合作伙伴",manage:"管理我的研究",manageSub:"成果与申请状态",footer:"面向国际研究人员的研究成长平台" },
  ja: { recommend:"パーソナル推薦",hero:"あなたの研究に合うR&D事業を確認しましょう。",heroText:"研究分野とキャリアに合う公募を一か所で比較できます。",network:"研究ネットワーク",networkHero:"共に研究する仲間や機関を見つけましょう。",networkText:"大田の研究者・機関と実践的な協力を始めます。",notices:"事業公募",viewAll:"すべて見る",noticeItems:["2026年度国際共同研究新規課題公募","外国人研究者定着支援プログラム","大徳特区技術事業化支援事業"],find:"事業を探す",findSub:"統合公募検索",write:"計画書作成",writeSub:"AI作成アシスタント",meeting:"研究者ミーティング",meetingSub:"共同研究者を探す",manage:"研究を管理",manageSub:"成果と申請状況",footer:"外国人研究者のための研究成長プラットフォーム" },
  vi: { recommend:"Đề xuất phù hợp",hero:"Tìm chương trình R&D phù hợp với nghiên cứu của bạn.",heroText:"So sánh các cơ hội phù hợp với lĩnh vực và giai đoạn nghề nghiệp tại một nơi.",network:"Mạng lưới nghiên cứu",networkHero:"Gặp gỡ cộng sự và tổ chức để cùng nghiên cứu.",networkText:"Bắt đầu hợp tác thực tế với các nhà nghiên cứu và tổ chức tại Daejeon.",notices:"Thông báo chương trình",viewAll:"Xem tất cả",noticeItems:["Đợt tuyển dự án nghiên cứu chung quốc tế năm 2026","Chương trình hỗ trợ ổn định cho nhà nghiên cứu quốc tế","Hỗ trợ thương mại hóa công nghệ Daedeok Innopolis"],find:"Tìm chương trình",findSub:"Tìm kiếm thông báo tích hợp",write:"Viết kế hoạch",writeSub:"Trợ lý viết AI",meeting:"Họp nghiên cứu",meetingSub:"Tìm cộng sự",manage:"Quản lý nghiên cứu",manageSub:"Thành tựu và hồ sơ hỗ trợ",footer:"Nền tảng phát triển nghiên cứu cho nhà nghiên cứu quốc tế" },
};

export default function Home() {
  const { locale } = useLocale();
  const ui = homeCopy[locale];
  const notices = programs.slice(0, 3);
  return <main className="site-page">
    <SiteHeader />
    <section className="home-grid">
      <div className="home-main">
        <Link className="hero-card hero-card-primary" href="/rd"><div><StatusPill tone="soft">{ui.recommend as string}</StatusPill><h1>{ui.hero as string}</h1><p>{ui.heroText as string}</p></div><span className="card-arrow">↗</span></Link>
        <Link className="hero-card hero-card-secondary" href="/network"><div><StatusPill tone="line">{ui.network as string}</StatusPill><h2>{ui.networkHero as string}</h2><p>{ui.networkText as string}</p></div><span className="card-arrow">↗</span></Link>
      </div>
      <aside className="notice-card"><div className="card-heading"><div><span>UPDATE</span><h2>{ui.notices as string}</h2></div><Link href="/rd">{ui.viewAll as string} →</Link></div><div className="notice-list">{notices.map((notice, index) => <Link href={`/rd/${notice.id}`} key={notice.id}><span>0{index + 1}</span><strong>{notice.title}</strong><small>{notice.posted}</small></Link>)}</div></aside>
      <div className="quick-grid">
        <Link href="/rd"><span>01</span><strong>{ui.find as string}</strong><small>{ui.findSub as string}</small></Link>
        <Link href="/proposal"><span>02</span><strong>{ui.write as string}</strong><small>{ui.writeSub as string}</small></Link>
        <Link href="/network"><span>03</span><strong>{ui.meeting as string}</strong><small>{ui.meetingSub as string}</small></Link>
        <Link href="/dashboard"><span>04</span><strong>{ui.manage as string}</strong><small>{ui.manageSub as string}</small></Link>
      </div>
    </section>
    <footer className="site-footer">LAB-BRIDGE · {ui.footer as string}</footer>
  </main>;
}
