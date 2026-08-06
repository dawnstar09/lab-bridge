"use client";

import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Locale, useLocale } from "@/components/locale-provider";
import { useProgramTranslations } from "@/components/use-program-translations";
import { auth } from "@/lib/firebase";
import { matchProgram } from "@/lib/program-matching";
import { programs } from "@/lib/programs";
import { loadResearcherProfile, ResearcherProfile } from "@/lib/researcher-profile";

const copy: Record<Locale, Record<string,string>> = {
  ko:{eyebrow:"TODAY AT LAB-BRIDGE",hello:"연구 현황을 한눈에 확인하세요.",intro:"추천 공고, 연구 일정과 진행 중인 활동을 한 곳에 정리했습니다.",saved:"저장한 공고",meetings:"미팅 요청",projects:"등록 프로젝트",recommend:"맞춤 추천 공고",recommendHelp:"연구자 프로필과 적합도가 높은 순서입니다.",viewAll:"전체 보기",fit:"적합도",deadline:"마감",calendar:"연구 일정",calendarHelp:"공고 마감일을 달력에서 확인하세요.",sun:"일",mon:"월",tue:"화",wed:"수",thu:"목",fri:"금",sat:"토",quick:"빠른 작업",proposal:"계획서 작성",proposalSub:"AI와 연구계획서 검토",network:"연구 네트워크",networkSub:"연구자·기관 매칭",mypage:"내 연구 관리",mypageSub:"성과와 저장 활동 확인",programs:"공고 탐색",programsSub:"통합 R&D 공고 검색",signIn:"로그인하면 개인 연구 현황이 표시됩니다.",signInAction:"로그인하기"},
  en:{eyebrow:"TODAY AT LAB-BRIDGE",hello:"See your research at a glance.",intro:"Recommendations, deadlines, and ongoing activity in one clear workspace.",saved:"Saved programs",meetings:"Meeting requests",projects:"Projects",recommend:"Recommended programs",recommendHelp:"Ordered by fit with your researcher profile.",viewAll:"View all",fit:"Fit",deadline:"Deadline",calendar:"Research calendar",calendarHelp:"Track program deadlines by date.",sun:"Sun",mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",quick:"Quick actions",proposal:"Write proposal",proposalSub:"Review with AI",network:"Research network",networkSub:"Match researchers and labs",mypage:"Manage research",mypageSub:"Outputs and saved activity",programs:"Browse programs",programsSub:"Search integrated R&D calls",signIn:"Sign in to see your personal research summary.",signInAction:"Sign in"},
  zh:{eyebrow:"LAB-BRIDGE 今日",hello:"一目了然地查看研究状态。",intro:"在一个清晰的工作区中查看推荐、截止日期和活动。",saved:"收藏项目",meetings:"会议请求",projects:"已注册项目",recommend:"推荐项目",recommendHelp:"按研究人员档案匹配度排序。",viewAll:"查看全部",fit:"匹配度",deadline:"截止",calendar:"研究日程",calendarHelp:"在日历中查看项目截止日期。",sun:"日",mon:"一",tue:"二",wed:"三",thu:"四",fri:"五",sat:"六",quick:"快速操作",proposal:"撰写计划书",proposalSub:"使用AI审核",network:"研究网络",networkSub:"匹配研究人员和机构",mypage:"管理我的研究",mypageSub:"成果和收藏活动",programs:"浏览项目",programsSub:"搜索综合R&D公告",signIn:"登录后可查看个人研究摘要。",signInAction:"登录"},
  ja:{eyebrow:"TODAY AT LAB-BRIDGE",hello:"研究状況をひと目で確認。",intro:"おすすめ、公募締切、研究活動を一つの画面に整理しました。",saved:"保存した公募",meetings:"面談依頼",projects:"登録プロジェクト",recommend:"おすすめ公募",recommendHelp:"研究者プロフィールとの適合度順です。",viewAll:"すべて見る",fit:"適合度",deadline:"締切",calendar:"研究カレンダー",calendarHelp:"公募締切を日付ごとに確認できます。",sun:"日",mon:"月",tue:"火",wed:"水",thu:"木",fri:"金",sat:"土",quick:"クイック操作",proposal:"計画書作成",proposalSub:"AIでレビュー",network:"研究ネットワーク",networkSub:"研究者・機関マッチング",mypage:"研究管理",mypageSub:"成果と保存活動",programs:"公募を探す",programsSub:"R&D公募を統合検索",signIn:"ログインすると個人研究の概要が表示されます。",signInAction:"ログイン"},
  vi:{eyebrow:"HÔM NAY TẠI LAB-BRIDGE",hello:"Xem nhanh toàn bộ hoạt động nghiên cứu.",intro:"Đề xuất, hạn chót và hoạt động được sắp xếp trong một không gian rõ ràng.",saved:"Chương trình đã lưu",meetings:"Yêu cầu họp",projects:"Dự án",recommend:"Chương trình đề xuất",recommendHelp:"Sắp xếp theo mức phù hợp với hồ sơ.",viewAll:"Xem tất cả",fit:"Phù hợp",deadline:"Hạn chót",calendar:"Lịch nghiên cứu",calendarHelp:"Theo dõi hạn chót chương trình theo ngày.",sun:"CN",mon:"T2",tue:"T3",wed:"T4",thu:"T5",fri:"T6",sat:"T7",quick:"Thao tác nhanh",proposal:"Viết kế hoạch",proposalSub:"Đánh giá bằng AI",network:"Mạng lưới nghiên cứu",networkSub:"Ghép nhà nghiên cứu và tổ chức",mypage:"Quản lý nghiên cứu",mypageSub:"Kết quả và hoạt động đã lưu",programs:"Tìm chương trình",programsSub:"Tìm thông báo R&D",signIn:"Đăng nhập để xem tóm tắt nghiên cứu cá nhân.",signInAction:"Đăng nhập"},
};

function parseDate(value: string) {
  const match = value.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
  return match ? new Date(Number(match[1]), Number(match[2])-1, Number(match[3])) : null;
}

export default function Home() {
  const { locale } = useLocale();
  const ui = copy[locale];
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => { const now=new Date(); return new Date(now.getFullYear(),now.getMonth(),1); });
  const translations = useProgramTranslations(programs, locale);
  useEffect(() => {
    setToday(new Date());
    return onAuthStateChanged(auth, async (user) => { setSignedIn(Boolean(user)); setProfile(user ? await loadResearcherProfile(user.uid) : null); });
  }, []);

  const recommendations = useMemo(() => programs.map((program) => ({ program, score:profile ? matchProgram(program,profile).score : 0 })).sort((a,b) => profile ? b.score-a.score : b.program.posted.localeCompare(a.program.posted)).slice(0,4), [profile]);
  const eventDays = useMemo(() => new Set(programs.map((item) => parseDate(item.deadline)).filter((date):date is Date => Boolean(date) && date!.getFullYear()===month.getFullYear() && date!.getMonth()===month.getMonth()).map((date) => date.getDate())), [month]);
  const daysInMonth = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const calendarCells = [...Array(month.getDay()).fill(null), ...Array.from({length:daysInMonth},(_,index)=>index+1)];
  return <main className="site-page home-dashboard-page">
    <SiteHeader />
    <section className="home-dashboard">
      <header className="home-summary-head"><div><span className="section-label">{ui.eyebrow}</span><h1>{ui.hello}</h1><p>{ui.intro}</p></div><time>{today ? new Intl.DateTimeFormat(locale,{year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(today) : ""}</time></header>
      <div className="summary-strip"><div><span>01</span><b>{profile?.savedProgramIds?.length || 0}</b><small>{ui.saved}</small></div><div><span>02</span><b>{profile?.meetingRequests?.length || 0}</b><small>{ui.meetings}</small></div><div><span>03</span><b>{profile?.fundingProjects?.length || 0}</b><small>{ui.projects}</small></div>{!signedIn && <Link href="/login"><span>{ui.signIn}</span><strong>{ui.signInAction} →</strong></Link>}</div>
      <div className="home-content-grid">
        <section className="home-program-panel"><div className="card-heading"><div><span className="section-label">FOR YOU</span><h2>{ui.recommend}</h2><p>{ui.recommendHelp}</p></div><Link href="/rd">{ui.viewAll} →</Link></div><div className="home-program-list">{recommendations.map(({program,score},index)=><Link href={`/rd/${program.id}`} key={program.id}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{translations[program.id]?.title || program.title}</strong><small>{ui.deadline} · {program.deadline}</small></div>{profile && <b>{score}% <i>{ui.fit}</i></b>}</Link>)}</div></section>
        <section className="home-calendar-panel"><div className="card-heading"><div><span className="section-label">SCHEDULE</span><h2>{ui.calendar}</h2><p>{ui.calendarHelp}</p></div></div><div className="calendar-nav"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} aria-label="Previous month">←</button><b>{new Intl.DateTimeFormat(locale,{year:"numeric",month:"long"}).format(month)}</b><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} aria-label="Next month">→</button></div><div className="calendar-grid">{[ui.sun,ui.mon,ui.tue,ui.wed,ui.thu,ui.fri,ui.sat].map((day)=><strong key={day}>{day}</strong>)}{calendarCells.map((day,index)=><span className={`${day && eventDays.has(day)?"has-event":""} ${today && day===today.getDate()&&month.getMonth()===today.getMonth()&&month.getFullYear()===today.getFullYear()?"today":""}`} key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-legend"><i />{ui.deadline}</div></section>
      </div>
      <section className="home-quick-panel"><div className="card-heading"><div><span className="section-label">SHORTCUTS</span><h2>{ui.quick}</h2></div></div><div className="home-quick-grid"><Link href="/rd"><span>01</span><b>{ui.programs}</b><small>{ui.programsSub}</small><i>→</i></Link><Link href="/proposal"><span>02</span><b>{ui.proposal}</b><small>{ui.proposalSub}</small><i>→</i></Link><Link href="/network"><span>03</span><b>{ui.network}</b><small>{ui.networkSub}</small><i>→</i></Link><Link href="/dashboard"><span>04</span><b>{ui.mypage}</b><small>{ui.mypageSub}</small><i>→</i></Link></div></section>
    </section>
  </main>;
}
