"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "ko" | "en" | "zh" | "ja" | "vi";
export type TerminologyPreference = "original_with_explanation" | "translated_with_original" | "original_only";

export const countryOptions = [
  { code: "KR", locale: "ko" as Locale, label: "대한민국 / Korea" },
  { code: "US", locale: "en" as Locale, label: "United States / English" },
  { code: "CN", locale: "zh" as Locale, label: "中国 / China" },
  { code: "JP", locale: "ja" as Locale, label: "日本 / Japan" },
  { code: "VN", locale: "vi" as Locale, label: "Việt Nam / Vietnam" },
];

const messages: Record<Locale, Record<string, string>> = {
  ko: { rd:"R&D 사업",proposal:"계획서 작성",network:"연구 도움/미팅",login:"로그인",register:"시작하기",mypage:"마이페이지",logout:"로그아웃",back:"홈으로 돌아가기",welcome:"다시 오신 것을 환영합니다",signin:"로그인",signup:"계정 만들기",country:"국가·기본 언어",name:"이름",organization:"소속 기관",field:"연구 분야",specialty:"세부 전공",career:"경력 단계",interests:"연구 관심사",terminology:"한국 R&D 전문용어 표시",email:"이메일",password:"비밀번호",remember:"로그인 유지",forgot:"비밀번호 찾기",submitLogin:"로그인",submitRegister:"회원가입",profileDescription:"연구 프로필을 만들고 맞춤형 기회를 찾아보세요.",filter:"사업 조건",keyword:"키워드",notices:"R&D 사업 공고",details:"상세 보기",proposalTitle:"연구계획서 편집",proposalDescription:"공고 기관에서 제공한 연구계획서 양식을 그대로 불러오세요.",chooseFile:"계획서 파일 선택",assistant:"AI 작성 조수",assistantDescription:"현재 문서 본문을 근거로 연구 행정 관점의 피드백을 제공합니다.",selectedReview:"선택 문장 검토",question:"문서에 관해 질문하기",networkTitle:"연구 도움과 미팅",profile:"연구자 프로필",editProfile:"프로필 수정",save:"저장하기" },
  en: { rd:"R&D Programs",proposal:"Proposal Editor",network:"Research Network",login:"Sign in",register:"Get started",mypage:"My page",logout:"Sign out",back:"Back to home",welcome:"Welcome back",signin:"Sign in",signup:"Create your account",country:"Country & default language",name:"Full name",organization:"Organization",field:"Research field",specialty:"Specialty",career:"Career stage",interests:"Research interests",terminology:"Korean R&D terminology display",email:"Email",password:"Password",remember:"Remember me",forgot:"Forgot password?",submitLogin:"Sign in",submitRegister:"Create account",profileDescription:"Build your research profile and find relevant opportunities.",filter:"Program filters",keyword:"Keyword",notices:"R&D opportunities",details:"View details",proposalTitle:"Research proposal editor",proposalDescription:"Open the proposal template supplied by the funding agency.",chooseFile:"Choose proposal file",assistant:"AI writing assistant",assistantDescription:"Feedback based on the current document and Korean research administration.",selectedReview:"Review selected sentence",question:"Ask about the document",networkTitle:"Research help & meetings",profile:"Researcher profile",editProfile:"Edit profile",save:"Save" },
  zh: { rd:"研发项目",proposal:"计划书编辑",network:"研究协作/会议",login:"登录",register:"开始使用",mypage:"我的页面",logout:"退出登录",back:"返回首页",welcome:"欢迎回来",signin:"登录",signup:"创建账户",country:"国家和默认语言",name:"姓名",organization:"所属机构",field:"研究领域",specialty:"细分专业",career:"职业阶段",interests:"研究兴趣",terminology:"韩国研发专业术语显示",email:"电子邮件",password:"密码",remember:"保持登录",forgot:"忘记密码？",submitLogin:"登录",submitRegister:"创建账户",profileDescription:"建立研究档案并寻找合适的机会。",filter:"项目条件",keyword:"关键词",notices:"研发项目公告",details:"查看详情",proposalTitle:"研究计划书编辑",proposalDescription:"打开资助机构提供的研究计划书模板。",chooseFile:"选择计划书文件",assistant:"AI写作助手",assistantDescription:"根据当前文档和韩国科研行政提供反馈。",selectedReview:"审查所选句子",question:"询问文档",networkTitle:"研究帮助与会议",profile:"研究者档案",editProfile:"编辑档案",save:"保存" },
  ja: { rd:"R&D事業",proposal:"計画書作成",network:"研究支援・面談",login:"ログイン",register:"始める",mypage:"マイページ",logout:"ログアウト",back:"ホームへ戻る",welcome:"おかえりなさい",signin:"ログイン",signup:"アカウント作成",country:"国・基本言語",name:"氏名",organization:"所属機関",field:"研究分野",specialty:"専門分野",career:"キャリア段階",interests:"研究関心",terminology:"韓国R&D専門用語の表示",email:"メール",password:"パスワード",remember:"ログインを保持",forgot:"パスワードを忘れた場合",submitLogin:"ログイン",submitRegister:"アカウント作成",profileDescription:"研究プロフィールを作成し、適切な機会を探します。",filter:"事業条件",keyword:"キーワード",notices:"R&D事業公募",details:"詳細を見る",proposalTitle:"研究計画書エディター",proposalDescription:"公募機関が提供する計画書様式を開きます。",chooseFile:"計画書ファイルを選択",assistant:"AI作成アシスタント",assistantDescription:"現在の文書と韓国の研究行政に基づいてフィードバックします。",selectedReview:"選択文をレビュー",question:"文書について質問",networkTitle:"研究支援と面談",profile:"研究者プロフィール",editProfile:"プロフィール編集",save:"保存" },
  vi: { rd:"Chương trình R&D",proposal:"Soạn đề xuất",network:"Hỗ trợ/kết nối nghiên cứu",login:"Đăng nhập",register:"Bắt đầu",mypage:"Trang cá nhân",logout:"Đăng xuất",back:"Về trang chủ",welcome:"Chào mừng trở lại",signin:"Đăng nhập",signup:"Tạo tài khoản",country:"Quốc gia và ngôn ngữ mặc định",name:"Họ tên",organization:"Cơ quan",field:"Lĩnh vực nghiên cứu",specialty:"Chuyên ngành",career:"Giai đoạn nghề nghiệp",interests:"Mối quan tâm nghiên cứu",terminology:"Hiển thị thuật ngữ R&D Hàn Quốc",email:"Email",password:"Mật khẩu",remember:"Duy trì đăng nhập",forgot:"Quên mật khẩu?",submitLogin:"Đăng nhập",submitRegister:"Tạo tài khoản",profileDescription:"Tạo hồ sơ nghiên cứu và tìm cơ hội phù hợp.",filter:"Điều kiện chương trình",keyword:"Từ khóa",notices:"Thông báo chương trình R&D",details:"Xem chi tiết",proposalTitle:"Trình soạn kế hoạch nghiên cứu",proposalDescription:"Mở biểu mẫu do cơ quan tài trợ cung cấp.",chooseFile:"Chọn tệp kế hoạch",assistant:"Trợ lý viết AI",assistantDescription:"Phản hồi dựa trên tài liệu hiện tại và thủ tục nghiên cứu Hàn Quốc.",selectedReview:"Đánh giá câu đã chọn",question:"Hỏi về tài liệu",networkTitle:"Hỗ trợ và kết nối nghiên cứu",profile:"Hồ sơ nhà nghiên cứu",editProfile:"Sửa hồ sơ",save:"Lưu" },
};

const additionalMessages: Record<Locale, Record<string, string>> = {
  ko: { noResults:"검색 결과가 없습니다.",selectRequired:"검색 결과에서 항목을 선택해 주세요.",authChecking:"로그인 정보를 확인하고 있습니다...",resetEmailRequired:"비밀번호 재설정 메일을 받을 이메일을 입력해 주세요.",resetSent:"비밀번호 재설정 메일을 보냈습니다.",resetFailed:"재설정 메일을 보내지 못했습니다.",authFailed:"인증 중 문제가 발생했습니다. 다시 시도해 주세요.",newUser:"LAB-BRIDGE가 처음인가요?",or:"또는",continueOrcid:"ORCID로 계속하기",researchConnected:"연구, 연결되다",barrierCopy:"언어 장벽을 넘어 연구하세요.",oneProfile:"하나의 프로필로 모든 기회를 만나세요.",profileUse:"R&D 사업 추천과 연구자 매칭에 활용됩니다.",cancel:"취소",notEntered:"미입력",hello:"안녕하세요.",close:"닫기",profileSaved:"연구자 프로필이 저장되었습니다.",profileLoadFailed:"연구자 프로필을 불러오지 못했습니다. Firestore 설정을 확인해 주세요.",recentAchievements:"최근 연구 성과",achievementHelp:"프로필 추천에 활용되는 연구 정보입니다.",addAchievement:"성과 추가",achievementPlaceholder:"논문, 프로젝트 또는 연구 성과명",add:"추가하기",collaborationStatus:"협력 연구 상태",activeConnections:"진행 중인 연결",upcomingMeeting:"미팅 예정",underReview:"검토 중",waitingReply:"상대방 응답 대기",recommendedPrograms:"추천 R&D 사업",recommendationHelp:"프로필 기준 높은 적합도의 공고입니다.",viewAll:"전체 보기",profileMatch:"프로필 매칭",check:"확인하기",saved:"저장됨",saveProgram:"관심 사업 저장" },
  en: { noResults:"No results found.",selectRequired:"Select an item from the search results.",authChecking:"Checking your sign-in...",resetEmailRequired:"Enter the email address for the password reset.",resetSent:"Password reset email sent.",resetFailed:"Could not send the reset email.",authFailed:"Authentication failed. Please try again.",newUser:"New to LAB-BRIDGE?",or:"or",continueOrcid:"Continue with ORCID",researchConnected:"RESEARCH, CONNECTED",barrierCopy:"Build beyond the language barrier.",oneProfile:"One profile. Every opportunity.",profileUse:"Used for R&D recommendations and researcher matching.",cancel:"Cancel",notEntered:"Not entered",hello:"Hello.",close:"Close",profileSaved:"Researcher profile saved.",profileLoadFailed:"Could not load the researcher profile. Check Firestore settings.",recentAchievements:"Recent research achievements",achievementHelp:"Research information used for profile recommendations.",addAchievement:"Add achievement",achievementPlaceholder:"Paper, project, or research achievement",add:"Add",collaborationStatus:"Collaboration status",activeConnections:"Active connections",upcomingMeeting:"Meeting scheduled",underReview:"Under review",waitingReply:"Waiting for a response",recommendedPrograms:"Recommended R&D programs",recommendationHelp:"High-fit opportunities based on your profile.",viewAll:"View all",profileMatch:"Profile match",check:"View",saved:"Saved",saveProgram:"Save program" },
  zh: { noResults:"未找到结果。",selectRequired:"请从搜索结果中选择一项。",authChecking:"正在检查登录信息……",resetEmailRequired:"请输入接收密码重置邮件的邮箱。",resetSent:"密码重置邮件已发送。",resetFailed:"无法发送重置邮件。",authFailed:"认证失败，请重试。",newUser:"第一次使用 LAB-BRIDGE？",or:"或",continueOrcid:"使用 ORCID 继续",researchConnected:"研究，连接世界",barrierCopy:"跨越语言障碍开展研究。",oneProfile:"一个档案，连接所有机会。",profileUse:"用于推荐 R&D 项目和匹配研究人员。",cancel:"取消",notEntered:"未填写",hello:"您好。",close:"关闭",profileSaved:"研究人员档案已保存。",profileLoadFailed:"无法加载研究人员档案，请检查 Firestore 设置。",recentAchievements:"近期研究成果",achievementHelp:"用于档案推荐的研究信息。",addAchievement:"添加成果",achievementPlaceholder:"论文、项目或研究成果名称",add:"添加",collaborationStatus:"合作研究状态",activeConnections:"正在进行的联系",upcomingMeeting:"会议已安排",underReview:"审核中",waitingReply:"等待对方回复",recommendedPrograms:"推荐的 R&D 项目",recommendationHelp:"根据档案推荐的高匹配项目。",viewAll:"查看全部",profileMatch:"档案匹配",check:"查看",saved:"已保存",saveProgram:"收藏项目" },
  ja: { noResults:"検索結果がありません。",selectRequired:"検索結果から項目を選択してください。",authChecking:"ログイン情報を確認しています…",resetEmailRequired:"パスワード再設定メールを受け取るメールアドレスを入力してください。",resetSent:"パスワード再設定メールを送信しました。",resetFailed:"再設定メールを送信できませんでした。",authFailed:"認証に失敗しました。もう一度お試しください。",newUser:"LAB-BRIDGEは初めてですか？",or:"または",continueOrcid:"ORCIDで続行",researchConnected:"研究を、つなぐ",barrierCopy:"言語の壁を越えて研究を広げましょう。",oneProfile:"一つのプロフィールですべての機会へ。",profileUse:"R&D事業の推薦と研究者マッチングに使用されます。",cancel:"キャンセル",notEntered:"未入力",hello:"こんにちは。",close:"閉じる",profileSaved:"研究者プロフィールを保存しました。",profileLoadFailed:"研究者プロフィールを読み込めませんでした。Firestore設定を確認してください。",recentAchievements:"最近の研究成果",achievementHelp:"プロフィール推薦に利用される研究情報です。",addAchievement:"成果を追加",achievementPlaceholder:"論文、プロジェクト、研究成果名",add:"追加",collaborationStatus:"共同研究の状況",activeConnections:"進行中のつながり",upcomingMeeting:"ミーティング予定",underReview:"検討中",waitingReply:"相手の返信待ち",recommendedPrograms:"おすすめR&D事業",recommendationHelp:"プロフィールに基づく適合度の高い公募です。",viewAll:"すべて見る",profileMatch:"プロフィール適合",check:"確認",saved:"保存済み",saveProgram:"関心事業を保存" },
  vi: { noResults:"Không tìm thấy kết quả.",selectRequired:"Hãy chọn một mục trong kết quả tìm kiếm.",authChecking:"Đang kiểm tra đăng nhập...",resetEmailRequired:"Nhập email để nhận thư đặt lại mật khẩu.",resetSent:"Đã gửi email đặt lại mật khẩu.",resetFailed:"Không thể gửi email đặt lại mật khẩu.",authFailed:"Xác thực thất bại. Vui lòng thử lại.",newUser:"Lần đầu dùng LAB-BRIDGE?",or:"hoặc",continueOrcid:"Tiếp tục với ORCID",researchConnected:"NGHIÊN CỨU, KẾT NỐI",barrierCopy:"Vượt qua rào cản ngôn ngữ.",oneProfile:"Một hồ sơ. Mọi cơ hội.",profileUse:"Dùng để đề xuất chương trình R&D và kết nối nhà nghiên cứu.",cancel:"Hủy",notEntered:"Chưa nhập",hello:"Xin chào.",close:"Đóng",profileSaved:"Đã lưu hồ sơ nhà nghiên cứu.",profileLoadFailed:"Không thể tải hồ sơ. Hãy kiểm tra cài đặt Firestore.",recentAchievements:"Thành tựu nghiên cứu gần đây",achievementHelp:"Thông tin nghiên cứu dùng cho đề xuất hồ sơ.",addAchievement:"Thêm thành tựu",achievementPlaceholder:"Tên bài báo, dự án hoặc thành tựu",add:"Thêm",collaborationStatus:"Trạng thái hợp tác",activeConnections:"Kết nối đang hoạt động",upcomingMeeting:"Đã lên lịch họp",underReview:"Đang xem xét",waitingReply:"Đang chờ phản hồi",recommendedPrograms:"Chương trình R&D đề xuất",recommendationHelp:"Cơ hội phù hợp cao dựa trên hồ sơ.",viewAll:"Xem tất cả",profileMatch:"Độ khớp hồ sơ",check:"Xem",saved:"Đã lưu",saveProgram:"Lưu chương trình" },
};

const terminologyMessages: Record<Locale, Record<string, string>> = {
  ko: { termOriginalExplanation:"한국어 원문 + 번역 + 설명",termTranslationFirst:"번역 우선 + 한국어 병기",termOriginalOnly:"한국어 원문 유지" },
  en: { termOriginalExplanation:"Korean original + translation + explanation",termTranslationFirst:"Translation first + Korean original",termOriginalOnly:"Keep Korean original" },
  zh: { termOriginalExplanation:"韩语原文＋翻译＋说明",termTranslationFirst:"翻译优先＋韩语原文",termOriginalOnly:"仅保留韩语原文" },
  ja: { termOriginalExplanation:"韓国語原文＋翻訳＋説明",termTranslationFirst:"翻訳優先＋韓国語原文",termOriginalOnly:"韓国語原文のみ維持" },
  vi: { termOriginalExplanation:"Nguyên văn tiếng Hàn + bản dịch + giải thích",termTranslationFirst:"Bản dịch trước + nguyên văn tiếng Hàn",termOriginalOnly:"Giữ nguyên tiếng Hàn" },
};

const accessibilityMessages: Record<Locale, Record<string, string>> = {
  ko: { navigation:"주요 메뉴",home:"홈" },
  en: { navigation:"Main navigation",home:"Home" },
  zh: { navigation:"主菜单",home:"首页" },
  ja: { navigation:"メインメニュー",home:"ホーム" },
  vi: { navigation:"Điều hướng chính",home:"Trang chủ" },
};

const completionMessages: Record<Locale, Record<string, string>> = {
  ko:{publications:"논문 및 연구성과",publicationsPlaceholder:"논문 제목을 한 줄에 하나씩 입력하세요. DOI 또는 URL도 함께 적을 수 있습니다.",noPublications:"등록된 논문이나 연구성과가 없습니다.",savedPrograms:"저장한 R&D 공고",savedProgramsHelp:"관심 사업 저장 버튼으로 추가한 공고입니다.",noSavedPrograms:"저장한 공고가 없습니다."},
  en:{publications:"Publications & research outputs",publicationsPlaceholder:"Enter one publication per line. You may include a DOI or URL.",noPublications:"No publications or research outputs have been added.",savedPrograms:"Saved R&D programs",savedProgramsHelp:"Programs added with the Save program button.",noSavedPrograms:"No saved programs."},
  zh:{publications:"论文与研究成果",publicationsPlaceholder:"每行输入一项论文，可同时填写 DOI 或 URL。",noPublications:"尚未添加论文或研究成果。",savedPrograms:"已收藏的 R&D 公告",savedProgramsHelp:"通过收藏项目按钮添加的公告。",noSavedPrograms:"没有收藏的公告。"},
  ja:{publications:"論文・研究成果",publicationsPlaceholder:"論文を1行に1件入力してください。DOIやURLも記載できます。",noPublications:"登録された論文・研究成果はありません。",savedPrograms:"保存したR&D公募",savedProgramsHelp:"関心事業を保存ボタンで追加した公募です。",noSavedPrograms:"保存した公募はありません。"},
  vi:{publications:"Công bố và kết quả nghiên cứu",publicationsPlaceholder:"Nhập mỗi công bố trên một dòng; có thể kèm DOI hoặc URL.",noPublications:"Chưa có công bố hoặc kết quả nghiên cứu.",savedPrograms:"Chương trình R&D đã lưu",savedProgramsHelp:"Các chương trình được thêm bằng nút Lưu chương trình.",noSavedPrograms:"Chưa lưu chương trình nào."},
};

const activityMessages: Record<Locale, Record<string, string>> = {
  ko:{researchActivity:"연구 네트워크 활동",researchActivityHelp:"직접 등록하거나 요청한 실제 활동입니다.",meetingRequestLabel:"미팅 요청",fundingProjectLabel:"펀딩 프로젝트",noResearchActivity:"등록된 네트워크 활동이 없습니다."},
  en:{researchActivity:"Research network activity",researchActivityHelp:"Projects and requests you actually created.",meetingRequestLabel:"Meeting request",fundingProjectLabel:"Funding project",noResearchActivity:"No network activity yet."},
  zh:{researchActivity:"研究网络活动",researchActivityHelp:"您实际登记或请求的活动。",meetingRequestLabel:"会议请求",fundingProjectLabel:"众筹项目",noResearchActivity:"尚无网络活动。"},
  ja:{researchActivity:"研究ネットワーク活動",researchActivityHelp:"実際に登録・依頼した活動です。",meetingRequestLabel:"ミーティング依頼",fundingProjectLabel:"ファンディングプロジェクト",noResearchActivity:"ネットワーク活動はまだありません。"},
  vi:{researchActivity:"Hoạt động mạng lưới nghiên cứu",researchActivityHelp:"Các dự án và yêu cầu bạn đã thực sự tạo.",meetingRequestLabel:"Yêu cầu họp",fundingProjectLabel:"Dự án gọi vốn",noResearchActivity:"Chưa có hoạt động mạng lưới."},
};

type LocaleContextValue = { locale: Locale; country: string; terminologyPreference: TerminologyPreference; setCountry: (country: string) => void; setLocale: (locale: Locale) => void; setTerminologyPreference: (value: TerminologyPreference) => void; t: (key: string) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");
  const [country, setCountryState] = useState("KR");
  const [terminologyPreference, setTerminologyState] = useState<TerminologyPreference>("original_with_explanation");

  useEffect(() => {
    const savedLocale = localStorage.getItem("labbridge-locale") as Locale | null;
    const savedCountry = localStorage.getItem("labbridge-country");
    const savedTerminology = localStorage.getItem("labbridge-terminology") as TerminologyPreference | null;
    if (savedLocale && messages[savedLocale]) setLocaleState(savedLocale);
    if (savedCountry) setCountryState(savedCountry);
    if (savedTerminology) setTerminologyState(savedTerminology);
  }, []);

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = (value: Locale) => { setLocaleState(value); localStorage.setItem("labbridge-locale", value); };
  const setCountry = (value: string) => { setCountryState(value); localStorage.setItem("labbridge-country", value); setLocale(countryOptions.find((item) => item.code === value)?.locale || "en"); };
  const setTerminologyPreference = (value: TerminologyPreference) => { setTerminologyState(value); localStorage.setItem("labbridge-terminology", value); };
  const context = useMemo(() => ({ locale, country, terminologyPreference, setCountry, setLocale, setTerminologyPreference, t: (key: string) => activityMessages[locale][key] || completionMessages[locale][key] || accessibilityMessages[locale][key] || terminologyMessages[locale][key] || additionalMessages[locale][key] || messages[locale][key] || activityMessages.ko[key] || completionMessages.ko[key] || accessibilityMessages.ko[key] || terminologyMessages.ko[key] || additionalMessages.ko[key] || messages.ko[key] || key }), [locale, country, terminologyPreference]);
  return <LocaleContext.Provider value={context}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
