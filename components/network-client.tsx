"use client";

import { upload } from "@vercel/blob/client";
import { onAuthStateChanged } from "firebase/auth";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { addMeetingRequest, createFundingProject, FundingProject, loadFundingProjects, loadResearcherProfile, ProjectFile, ResearcherProfile } from "@/lib/researcher-profile";
import { matchKaistResearchers } from "@/lib/researcher-matching";
import { Locale, useLocale } from "./locale-provider";
import { StatusPill } from "./status-pill";

const copy: Record<Locale, Record<string,string>> = {
  ko:{intro:"연구계획과 연구자 프로필을 바탕으로 협업 대상을 찾습니다.",saved:"프로젝트가 등록되었습니다.",requested:"미팅 요청을 저장했습니다.",close:"닫기",funding:"크라우드 펀딩",fundingIntro:"연구계획을 공개하고 초기 협력과 자원을 확보합니다.",register:"프로젝트 등록",registered:"등록됨",goal:"목표 금액",created:"등록일",empty:"등록된 프로젝트가 없습니다.",matching:"KAIST 연구실 매칭",matchingIntro:"전공·관심 연구·논문과 연구실 설명의 코사인 유사도로 정렬합니다.",source:"KAIST 연구실 데이터",fit:"텍스트 적합도",meeting:"미팅 요청",meetingDone:"요청 저장됨",reason:"일치 키워드",low:"프로필에 관심 연구와 논문을 입력하면 매칭 정확도가 높아집니다.",newProject:"펀딩 프로젝트 등록",name:"프로젝트명",amount:"목표 금액",description:"프로젝트 설명",submit:"등록하기",files:"첨부파일",fileHelp:"PDF, DOCX, HWP/HWPX, XLSX, PPTX, ZIP, 이미지 · 파일당 최대 20MB",details:"상세 보기",author:"작성자",organization:"소속",download:"다운로드",noFiles:"첨부파일 없음",uploading:"등록 중...",projectDetail:"프로젝트 상세",publicNotice:"첨부파일은 프로젝트 참여자에게 공개됩니다."},
  en:{intro:"Find collaborators from your proposal and researcher profile.",saved:"Project registered.",requested:"Meeting request saved.",close:"Close",funding:"Crowdfunding",fundingIntro:"Publish a plan to secure early collaborators and resources.",register:"Register project",registered:"Registered",goal:"Goal",created:"Created",empty:"No projects registered.",matching:"KAIST lab matching",matchingIntro:"Sorted by cosine similarity across field, interests, publications, and lab descriptions.",source:"KAIST lab data",fit:"Text fit",meeting:"Request meeting",meetingDone:"Request saved",reason:"Matching terms",low:"Add interests and publications to improve matching.",newProject:"Register funding project",name:"Project name",amount:"Target amount",description:"Description",submit:"Register",files:"Attachments",fileHelp:"PDF, DOCX, HWP/HWPX, XLSX, PPTX, ZIP, images · up to 20MB each",details:"View details",author:"Author",organization:"Organization",download:"Download",noFiles:"No attachments",uploading:"Registering...",projectDetail:"Project details",publicNotice:"Attachments are visible to project participants."},
  zh:{intro:"根据研究计划和研究人员档案寻找合作伙伴。",saved:"项目已注册。",requested:"会议请求已保存。",close:"关闭",funding:"众筹",fundingIntro:"公开研究计划并争取早期合作和资源。",register:"注册项目",registered:"已注册",goal:"目标金额",created:"注册日期",empty:"暂无注册项目。",matching:"KAIST 实验室匹配",matchingIntro:"根据研究领域、兴趣、论文和实验室说明的余弦相似度排序。",source:"KAIST 实验室数据",fit:"文本匹配度",meeting:"请求会议",meetingDone:"请求已保存",reason:"匹配关键词",low:"添加研究兴趣和论文可提高匹配精度。",newProject:"注册众筹项目",name:"项目名称",amount:"目标金额",description:"项目说明",submit:"注册",files:"附件",fileHelp:"PDF、DOCX、HWP/HWPX、XLSX、PPTX、ZIP、图片 · 每个文件最大20MB",details:"查看详情",author:"作者",organization:"所属机构",download:"下载",noFiles:"无附件",uploading:"正在注册...",projectDetail:"项目详情",publicNotice:"附件将对项目参与者公开。"},
  ja:{intro:"研究計画と研究者プロフィールから共同研究者を探します。",saved:"プロジェクトを登録しました。",requested:"ミーティング依頼を保存しました。",close:"閉じる",funding:"クラウドファンディング",fundingIntro:"研究計画を公開し、初期の協力とリソースを確保します。",register:"プロジェクト登録",registered:"登録済み",goal:"目標金額",created:"登録日",empty:"登録済みプロジェクトはありません。",matching:"KAIST研究室マッチング",matchingIntro:"分野、関心、論文、研究室説明のコサイン類似度で並べます。",source:"KAIST研究室データ",fit:"テキスト適合度",meeting:"面談依頼",meetingDone:"依頼済み",reason:"一致キーワード",low:"関心研究と論文を追加すると精度が上がります。",newProject:"資金調達プロジェクト登録",name:"プロジェクト名",amount:"目標金額",description:"説明",submit:"登録",files:"添付ファイル",fileHelp:"PDF、DOCX、HWP/HWPX、XLSX、PPTX、ZIP、画像 · 1ファイル最大20MB",details:"詳細を見る",author:"作成者",organization:"所属機関",download:"ダウンロード",noFiles:"添付ファイルなし",uploading:"登録中...",projectDetail:"プロジェクト詳細",publicNotice:"添付ファイルはプロジェクト参加者に公開されます。"},
  vi:{intro:"Tìm cộng tác viên từ đề xuất và hồ sơ nghiên cứu.",saved:"Đã đăng ký dự án.",requested:"Đã lưu yêu cầu họp.",close:"Đóng",funding:"Gọi vốn cộng đồng",fundingIntro:"Công bố kế hoạch để tìm cộng tác và nguồn lực ban đầu.",register:"Đăng ký dự án",registered:"Đã đăng ký",goal:"Mục tiêu",created:"Ngày đăng",empty:"Chưa có dự án.",matching:"Ghép phòng thí nghiệm KAIST",matchingIntro:"Sắp xếp theo độ tương đồng cosine của lĩnh vực, sở thích, bài báo và mô tả phòng thí nghiệm.",source:"Dữ liệu phòng thí nghiệm KAIST",fit:"Độ phù hợp",meeting:"Yêu cầu họp",meetingDone:"Đã lưu",reason:"Từ khóa khớp",low:"Thêm sở thích và bài báo để tăng độ chính xác.",newProject:"Đăng ký dự án gọi vốn",name:"Tên dự án",amount:"Số tiền mục tiêu",description:"Mô tả",submit:"Đăng ký",files:"Tệp đính kèm",fileHelp:"PDF, DOCX, HWP/HWPX, XLSX, PPTX, ZIP, hình ảnh · tối đa 20MB mỗi tệp",details:"Xem chi tiết",author:"Tác giả",organization:"Tổ chức",download:"Tải xuống",noFiles:"Không có tệp",uploading:"Đang đăng ký...",projectDetail:"Chi tiết dự án",publicNotice:"Tệp đính kèm được hiển thị cho người tham gia dự án."},
};

export function NetworkClient() {
  const { locale, t } = useLocale();
  const ui = copy[locale];
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FundingProject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const matches = useMemo(() => matchKaistResearchers(profile), [profile]);
  const requestedIds = new Set(profile?.meetingRequests?.map((item) => item.id) || []);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const [value, fundingProjects] = await Promise.all([loadResearcherProfile(user.uid), loadFundingProjects()]);
    setProfile(value); setProjects(fundingProjects);
  }), []);

  async function registerProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const user=auth.currentUser; if(!user)return;
    setSubmitting(true);
    try {
      const data = new FormData(event.currentTarget); const id = crypto.randomUUID();
      const files = data.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
      const uploadedFiles: ProjectFile[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._()\-가-힣]/g, "_");
        const result = await upload(`project-files/${id}/${crypto.randomUUID()}-${safeName}`, file, { access:"public", handleUploadUrl:"/api/project-files/upload" });
        uploadedFiles.push({ name:file.name, url:result.url, pathname:result.pathname, size:file.size, type:file.type || "application/octet-stream" });
      }
      const project: FundingProject = { id, title:String(data.get("title")||""), amount:Number(data.get("amount")||0), description:String(data.get("description")||""), createdAt:new Date().toISOString(), authorId:user.uid, authorName:profile?.fullName || user.displayName || user.email || "Researcher", authorOrganization:profile?.organization || "", files:uploadedFiles };
      await createFundingProject(project); setProjects((current) => [project,...current]); setModalOpen(false); setNotice(ui.saved);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Project registration failed."); }
    finally { setSubmitting(false); }
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
      {projects.length ? projects.map((project) => <button type="button" className="funding-feature" key={project.id} onClick={() => setSelectedProject(project)}><div><StatusPill tone="soft">{ui.registered}</StatusPill><h3>{project.title}</h3><p>{project.description}</p><small>{ui.author} · {project.authorName}{project.authorOrganization ? ` · ${project.authorOrganization}` : ""}</small></div><div className="funding-progress"><b>{new Intl.NumberFormat(locale).format(project.amount)} KRW</b><small>{ui.goal} · {ui.created} {new Intl.DateTimeFormat(locale,{dateStyle:"medium"}).format(new Date(project.createdAt))}</small><span>{ui.details} →</span></div></button>) : <div className="empty-card">{ui.empty}</div>}
    </div>
    <div className="network-section"><div className="card-heading"><div><span className="section-label">COSINE MATCHING</span><h2>{ui.matching}</h2><p>{ui.matchingIntro}</p></div><small className="data-source">{ui.source}</small></div>
      <p className="matching-note">{ui.low}</p><div className="researcher-list">{matches.map((item,index) => { const translated = locale !== "ko"; const professor = translated ? item.professorEn : item.professor; return <article key={item.id}><div className="match-rank">{String(index+1).padStart(2,"0")}</div><div><div className="match-meta"><StatusPill tone="line">{translated ? item.departmentEn : item.department}</StatusPill><b>{ui.fit} {item.score}%</b></div><h3>{translated ? item.labEn : item.lab}</h3><p><strong>{professor}</strong>{item.matchedKeywords.length && !translated ? ` · ${ui.reason}: ${item.matchedKeywords.join(", ")}` : ""}</p></div><button disabled={requestedIds.has(item.id)} onClick={() => void requestMeeting(item.id,professor)}>{requestedIds.has(item.id) ? ui.meetingDone : `${ui.meeting} →`}</button></article>; })}</div>
    </div>
    {modalOpen && <div className="modal-backdrop"><section className="form-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label={ui.close} onClick={() => setModalOpen(false)}>×</button><span className="section-label">NEW PROJECT</span><h2>{ui.newProject}</h2><form onSubmit={(event) => void registerProject(event)}><label>{ui.name}<input name="title" required /></label><label>{ui.amount}<input name="amount" required type="number" min="100000" /></label><label>{ui.description}<textarea name="description" required /></label><label>{ui.files}<input name="files" type="file" multiple accept=".pdf,.doc,.docx,.hwp,.hwpx,.xls,.xlsx,.ppt,.pptx,.zip,.png,.jpg,.jpeg" /><small>{ui.fileHelp}</small><small>{ui.publicNotice}</small></label><button type="submit" disabled={submitting}>{submitting ? ui.uploading : `${ui.submit} →`}</button></form></section></div>}
    {selectedProject && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProject(null); }}><section className="form-modal project-detail-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label={ui.close} onClick={() => setSelectedProject(null)}>×</button><span className="section-label">{ui.projectDetail}</span><h2>{selectedProject.title}</h2><div className="project-author"><b>{ui.author}</b><span>{selectedProject.authorName}</span>{selectedProject.authorOrganization && <small>{ui.organization} · {selectedProject.authorOrganization}</small>}</div><p className="project-description">{selectedProject.description}</p><dl><div><dt>{ui.goal}</dt><dd>{new Intl.NumberFormat(locale).format(selectedProject.amount)} KRW</dd></div><div><dt>{ui.created}</dt><dd>{new Intl.DateTimeFormat(locale,{dateStyle:"long"}).format(new Date(selectedProject.createdAt))}</dd></div></dl><div className="project-files"><b>{ui.files}</b>{selectedProject.files?.length ? selectedProject.files.map((file) => <a href={file.url} target="_blank" rel="noreferrer" download key={file.pathname}><span>{file.name}<small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span><strong>{ui.download} ↓</strong></a>) : <p>{ui.noFiles}</p>}</div></section></div>}
  </section>;
}
