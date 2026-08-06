"use client";

import Script from "next/script";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Locale, useLocale } from "./locale-provider";

type UploadedDocument = { id: string; name: string };
type AiResult = { answer: string; citations: Array<{ quote: string; feedback: string }>; locale?: Locale };
type SavedFeedback = { id: string; quote: string; feedback: string; savedAt: string; locale?: Locale };
type RecentDocument = UploadedDocument & { updatedAt: string; result?: AiResult; savedFeedback?: SavedFeedback[] };

const recentDocumentsKey = "labbridge-recent-documents";

const proposalUi: Record<Locale, Record<string, string>> = {
  ko: { uploadIntro:"DOCX 파일을 올리면 OpenAI가 문서 내용을 먼저 분석합니다.",reopened:"저장된 문서를 다시 열었습니다. 필요한 내용을 질문해 주세요.",editorReconnect:"문서 편집기를 다시 연결하고 있습니다. 잠시 후 문서를 다시 선택해 주세요.",analysisFailed:"AI 분석에 실패했습니다.",loading:"문서를 안전하게 불러오는 중입니다.",uploadFailed:"파일을 불러오지 못했습니다.",editorCommandFailed:"DOCX 편집기 명령을 전달하지 못했습니다.",editorServerFailed:"문서 편집 서버에 연결하지 못했습니다. Docker Desktop을 확인해 주세요.",format:"DOCX 권장 · HWP/HWPX는 DOCX로 자동 변환됩니다.",current:"현재 문서",none:"선택된 파일 없음",autosave:"자동 저장 및 댓글 사용 가능",docxOnly:"DOCX만 지원",download:"현재 파일 다운로드",recent:"최근 작업 문서",example:"예시 양식",template:"연구개발계획서 본문1 작성서식",templateMeta:"국가 R&D 표준 양식 · 다운로드",webEditor:"실제 웹 편집기",features:"페이지 · 표 · 이미지 · 댓글",conversionNote:"한글 파일은 DOCX로 변환한 뒤 편집되며 복잡한 표·글상자는 일부 달라질 수 있습니다.",emptyTitle:"연구계획서 양식을 불러오세요",emptyText:"파일을 선택하면 Word 형식의 웹 편집기와 OpenAI 문서 분석이 함께 시작됩니다.",openDocx:"DOCX 파일 열기",analyzing:"문서 분석 중…",openaiAnswer:"OpenAI 답변",issueCards:"문서 문제 카드 · 문장을 누르면 DOCX에서 표시됩니다",issue:"문제",collapse:"접기",viewFeedback:"피드백 보기",aiComment:"AI 댓글",saved:"저장됨",saveFeedback:"피드백 저장",addComment:"DOCX 댓글로 추가",savedFeedback:"저장한 피드백",clarifyGoal:"목표 구체화",adminStyle:"행정 문체 점검",selectionPlaceholder:"문서에서 문장을 복사해 붙여넣으세요.",questionPlaceholder:"문서에 관해 질문하세요." },
  en: { uploadIntro:"Upload a DOCX file and OpenAI will analyze its contents first.",reopened:"The saved document has been reopened. Ask any question you need.",editorReconnect:"Reconnecting the document editor. Please select the document again shortly.",analysisFailed:"AI analysis failed.",loading:"Loading the document securely.",uploadFailed:"Could not load the file.",editorCommandFailed:"Could not send the command to the DOCX editor.",editorServerFailed:"Could not connect to the document editor server. Check Docker Desktop.",format:"DOCX recommended · HWP/HWPX files are converted automatically.",current:"Current document",none:"No file selected",autosave:"Autosave and comments available",docxOnly:"DOCX only",download:"Download current file",recent:"Recent documents",example:"Example template",template:"R&D proposal body template",templateMeta:"National R&D standard template · Download",webEditor:"Web document editor",features:"Pages · tables · images · comments",conversionNote:"Hangul files are converted to DOCX; complex tables and text boxes may change.",emptyTitle:"Open a proposal template",emptyText:"Selecting a file starts the Word-compatible editor and OpenAI analysis.",openDocx:"Open DOCX file",analyzing:"Analyzing document…",openaiAnswer:"OpenAI response",issueCards:"Document issue cards · Select a sentence to locate it in the DOCX",issue:"Issue",collapse:"Collapse",viewFeedback:"View feedback",aiComment:"AI comment",saved:"Saved",saveFeedback:"Save feedback",addComment:"Add as DOCX comment",savedFeedback:"Saved feedback",clarifyGoal:"Clarify objectives",adminStyle:"Check administrative style",selectionPlaceholder:"Copy and paste a sentence from the document.",questionPlaceholder:"Ask about the document." },
  zh: { uploadIntro:"上传 DOCX 文件后，OpenAI 会先分析文档内容。",reopened:"已重新打开保存的文档。您可以继续提问。",editorReconnect:"正在重新连接文档编辑器，请稍后重新选择文档。",analysisFailed:"AI 分析失败。",loading:"正在安全加载文档。",uploadFailed:"无法加载文件。",editorCommandFailed:"无法向 DOCX 编辑器发送命令。",editorServerFailed:"无法连接文档编辑服务器，请检查 Docker Desktop。",format:"建议使用 DOCX · HWP/HWPX 将自动转换",current:"当前文档",none:"未选择文件",autosave:"支持自动保存和批注",docxOnly:"仅支持 DOCX",download:"下载当前文件",recent:"最近编辑的文档",example:"示例模板",template:"R&D 计划书正文模板",templateMeta:"国家 R&D 标准模板 · 下载",webEditor:"网页文档编辑器",features:"页面 · 表格 · 图片 · 批注",conversionNote:"韩文文件会转换为 DOCX，复杂表格和文本框可能发生变化。",emptyTitle:"打开研究计划书模板",emptyText:"选择文件后将同时启动 Word 兼容编辑器和 OpenAI 分析。",openDocx:"打开 DOCX 文件",analyzing:"正在分析文档……",openaiAnswer:"OpenAI 回答",issueCards:"文档问题卡片 · 点击句子可在 DOCX 中定位",issue:"问题",collapse:"收起",viewFeedback:"查看反馈",aiComment:"AI 批注",saved:"已保存",saveFeedback:"保存反馈",addComment:"添加为 DOCX 批注",savedFeedback:"已保存的反馈",clarifyGoal:"明确目标",adminStyle:"检查行政文体",selectionPlaceholder:"从文档复制并粘贴句子。",questionPlaceholder:"就文档内容提问。" },
  ja: { uploadIntro:"DOCXファイルをアップロードすると、OpenAIが文書内容を先に分析します。",reopened:"保存済み文書を再度開きました。必要な内容を質問してください。",editorReconnect:"文書エディターを再接続しています。しばらくしてから文書を選択し直してください。",analysisFailed:"AI分析に失敗しました。",loading:"文書を安全に読み込んでいます。",uploadFailed:"ファイルを読み込めませんでした。",editorCommandFailed:"DOCXエディターにコマンドを送信できませんでした。",editorServerFailed:"文書編集サーバーに接続できません。Docker Desktopを確認してください。",format:"DOCX推奨 · HWP/HWPXは自動変換されます",current:"現在の文書",none:"ファイル未選択",autosave:"自動保存・コメント対応",docxOnly:"DOCXのみ対応",download:"現在のファイルをダウンロード",recent:"最近の作業文書",example:"サンプル様式",template:"研究開発計画書本文様式",templateMeta:"国家R&D標準様式 · ダウンロード",webEditor:"Web文書エディター",features:"ページ · 表 · 画像 · コメント",conversionNote:"韓国語文書はDOCXに変換され、複雑な表やテキストボックスは一部変わる場合があります。",emptyTitle:"研究計画書の様式を開く",emptyText:"ファイルを選択するとWord互換エディターとOpenAI分析が開始されます。",openDocx:"DOCXファイルを開く",analyzing:"文書を分析中…",openaiAnswer:"OpenAIの回答",issueCards:"文書の問題カード · 文を押すとDOCX内で表示します",issue:"問題",collapse:"閉じる",viewFeedback:"フィードバックを見る",aiComment:"AIコメント",saved:"保存済み",saveFeedback:"フィードバックを保存",addComment:"DOCXコメントとして追加",savedFeedback:"保存したフィードバック",clarifyGoal:"目標を具体化",adminStyle:"行政文体を確認",selectionPlaceholder:"文書から文章をコピーして貼り付けてください。",questionPlaceholder:"文書について質問してください。" },
  vi: { uploadIntro:"Tải tệp DOCX lên để OpenAI phân tích nội dung trước.",reopened:"Đã mở lại tài liệu đã lưu. Bạn có thể tiếp tục đặt câu hỏi.",editorReconnect:"Đang kết nối lại trình soạn thảo. Vui lòng chọn lại tài liệu sau giây lát.",analysisFailed:"Phân tích AI thất bại.",loading:"Đang tải tài liệu an toàn.",uploadFailed:"Không thể tải tệp.",editorCommandFailed:"Không thể gửi lệnh tới trình soạn thảo DOCX.",editorServerFailed:"Không thể kết nối máy chủ soạn thảo. Hãy kiểm tra Docker Desktop.",format:"Khuyên dùng DOCX · HWP/HWPX được tự động chuyển đổi",current:"Tài liệu hiện tại",none:"Chưa chọn tệp",autosave:"Có tự động lưu và bình luận",docxOnly:"Chỉ hỗ trợ DOCX",download:"Tải tài liệu hiện tại",recent:"Tài liệu gần đây",example:"Biểu mẫu mẫu",template:"Biểu mẫu nội dung kế hoạch R&D",templateMeta:"Biểu mẫu R&D quốc gia · Tải xuống",webEditor:"Trình soạn thảo web",features:"Trang · bảng · ảnh · bình luận",conversionNote:"Tệp Hangul được chuyển sang DOCX; bảng và hộp văn bản phức tạp có thể thay đổi.",emptyTitle:"Mở biểu mẫu kế hoạch nghiên cứu",emptyText:"Chọn tệp để khởi động trình soạn thảo tương thích Word và phân tích OpenAI.",openDocx:"Mở tệp DOCX",analyzing:"Đang phân tích…",openaiAnswer:"Phản hồi OpenAI",issueCards:"Thẻ vấn đề tài liệu · Nhấn câu để định vị trong DOCX",issue:"Vấn đề",collapse:"Thu gọn",viewFeedback:"Xem phản hồi",aiComment:"Bình luận AI",saved:"Đã lưu",saveFeedback:"Lưu phản hồi",addComment:"Thêm bình luận DOCX",savedFeedback:"Phản hồi đã lưu",clarifyGoal:"Làm rõ mục tiêu",adminStyle:"Kiểm tra văn phong hành chính",selectionPlaceholder:"Sao chép và dán một câu từ tài liệu.",questionPlaceholder:"Đặt câu hỏi về tài liệu." },
};

declare global {
  interface Window {
    DocsAPI?: {
      DocEditor: new (elementId: string, config: Record<string, unknown>) => { destroyEditor: () => void };
    };
  }
}

export function ProposalEditor() {
  const { locale, terminologyPreference, t } = useLocale();
  const ui = proposalUi[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<{ destroyEditor: () => void } | null>(null);
  const editorStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousLocaleRef = useRef(locale);
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [activeCitations, setActiveCitations] = useState<number[]>([]);
  const [savedFeedback, setSavedFeedback] = useState<SavedFeedback[]>([]);
  const [result, setResult] = useState<AiResult>({
    answer: ui.uploadIntro,
    citations: [],
  });
  const [question, setQuestion] = useState("");
  const [selectedExcerpt, setSelectedExcerpt] = useState("");

  useEffect(() => {
    if (previousLocaleRef.current === locale) return;
    previousLocaleRef.current = locale;
    setSavedFeedback((current) => current.filter((item) => (item.locale || "ko") === locale));
    if (document) void askOpenAI(document, "이 연구개발계획서를 전체 검토하고 가장 중요한 문제와 개선 방향을 알려주세요.", "review");
    else setResult({ answer: ui.uploadIntro, citations: [], locale });
  }, [locale]);

  useEffect(() => {
    if (window.DocsAPI) setScriptReady(true);
    const handlePageShow = () => {
      if (window.DocsAPI) setScriptReady(true);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(recentDocumentsKey) || "[]") as RecentDocument[];
      const valid = saved.filter((item) => item.id && item.name && item.updatedAt).slice(0, 8);
      setRecentDocuments(valid);
      if (valid[0]) {
        setDocument({ id: valid[0].id, name: valid[0].name });
        if (valid[0].result) setResult(valid[0].result);
        setSavedFeedback((valid[0].savedFeedback || []).filter((item) => (item.locale || "ko") === locale));
      }
    } catch {
      window.localStorage.removeItem(recentDocumentsKey);
    }
  }, []);

  function saveRecent(target: UploadedDocument, savedResult?: AiResult) {
    setRecentDocuments((current) => {
      const previous = current.find((item) => item.id === target.id);
      const next: RecentDocument[] = [{
        ...target,
        updatedAt: new Date().toISOString(),
        result: savedResult || previous?.result,
        savedFeedback: previous?.savedFeedback,
      }, ...current.filter((item) => item.id !== target.id)].slice(0, 8);
      window.localStorage.setItem(recentDocumentsKey, JSON.stringify(next));
      return next;
    });
  }

  function openRecent(item: RecentDocument) {
    setDocument({ id: item.id, name: item.name });
    setResult(item.result?.locale === locale ? item.result : { answer: ui.reopened, citations: [], locale });
    setActiveCitations([]);
    setSavedFeedback((item.savedFeedback || []).filter((feedback) => (feedback.locale || "ko") === locale));
    saveRecent(item, item.result);
  }

  useEffect(() => {
    if (!document || !scriptReady || !window.DocsAPI) return;
    let cancelled = false;
    if (editorStartTimerRef.current) clearTimeout(editorStartTimerRef.current);
    try {
      editorRef.current?.destroyEditor();
    } catch {
      // The previous iframe may already have been removed during client navigation.
    }
    editorRef.current = null;

    editorStartTimerRef.current = setTimeout(() => {
      if (cancelled || !window.DocsAPI || !window.document.getElementById("onlyoffice-editor")) return;
      const port = window.location.port || "80";
      const containerHost = `http://host.docker.internal:${port}`;

      editorRef.current = new window.DocsAPI.DocEditor("onlyoffice-editor", {
        documentType: "word",
        type: "desktop",
        width: "100%",
        height: "100%",
        document: {
          fileType: "docx",
          key: document.id,
          title: document.name,
          url: `${containerHost}/api/documents/${document.id}`,
          permissions: { comment: true, download: true, edit: true, print: true },
        },
        editorConfig: {
          callbackUrl: `${containerHost}/api/documents/${document.id}/callback`,
          lang: "ko",
          mode: "edit",
          user: { id: "labbridge-user", name: "Lab-BridGE 연구자" },
          customization: { autosave: true, compactHeader: false, forcesave: true },
          plugins: {
            autostart: ["asc.{A6843506-4E9A-4B1C-8D53-4E4E44C315E2}"],
            pluginsData: ["http://localhost:8080/sdkjs-plugins/labbridge-bridge/config.json?v=1.0.1"],
          },
        },
        events: {
          onError: () => setResult({ answer: ui.editorReconnect, citations: [], locale }),
        },
      });
    }, 350);

    return () => {
      cancelled = true;
      if (editorStartTimerRef.current) clearTimeout(editorStartTimerRef.current);
      editorStartTimerRef.current = null;
      try {
        editorRef.current?.destroyEditor();
      } catch {
        // Ignore teardown errors from an iframe that is already closing.
      }
      editorRef.current = null;
    };
  }, [document, scriptReady]);

  async function askOpenAI(target: UploadedDocument, prompt: string, mode: "review" | "question" = "question") {
    setAiLoading(true);
    try {
      const response = await fetch(`/api/documents/${target.id}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, mode, locale, terminologyPreference }),
      });
      const data = (await response.json()) as AiResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "AI 분석에 실패했습니다.");
      const localizedResult = { ...data, locale };
      setResult(localizedResult);
      setActiveCitations(data.citations.length ? [0] : []);
      saveRecent(target, localizedResult);
    } catch (error) {
      setResult({ answer: error instanceof Error ? error.message : ui.analysisFailed, citations: [], locale });
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult({ answer: ui.loading, citations: [], locale });

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/documents/upload", { method: "POST", body });
      const data = (await response.json()) as UploadedDocument & { error?: string };
      if (!response.ok) throw new Error(data.error || "파일 업로드에 실패했습니다.");
      const uploaded = { id: data.id, name: data.name };
      setDocument(uploaded);
      setSavedFeedback([]);
      saveRecent(uploaded);
      void askOpenAI(uploaded, "이 연구개발계획서를 전체 검토하고 가장 중요한 문제와 개선 방향을 알려주세요.", "review");
    } catch (error) {
      setResult({ answer: error instanceof Error ? error.message : ui.uploadFailed, citations: [], locale });
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  async function submitQuestion() {
    if (!document || !question.trim()) return;
    const prompt = question.trim();
    setQuestion("");
    await askOpenAI(document, prompt);
  }

  async function reviewSelectedExcerpt() {
    if (!document || !selectedExcerpt.trim()) return;
    const excerpt = selectedExcerpt.trim();
    await askOpenAI(document, `다음 선택 문장을 전체 연구개발계획서의 맥락과 비교해 문제점과 개선안을 검토해 주세요.\n\n선택 문장: “${excerpt}”`);
  }

  function toggleCitation(index: number) {
    setActiveCitations((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  }

  function saveFeedbackCard(quote: string, feedback: string) {
    if (!document) return;
    const saved: SavedFeedback = { id: crypto.randomUUID(), quote, feedback, savedAt: new Date().toISOString(), locale };
    setSavedFeedback((current) => {
      const next = [saved, ...current.filter((item) => item.quote !== quote)];
      setRecentDocuments((documents) => {
        const updated = documents.map((item) => item.id === document.id ? { ...item, savedFeedback: next } : item);
        window.localStorage.setItem(recentDocumentsKey, JSON.stringify(updated));
        return updated;
      });
      return next;
    });
  }

  async function sendEditorCommand(action: "navigate" | "comment", quote: string, feedback?: string) {
    if (!document) return;
    const response = await fetch("/api/editor-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id, action, quote, feedback }),
    });
    if (!response.ok) {
      setResult({ answer: ui.editorCommandFailed, citations: result.citations, locale });
    }
  }

  return (
    <section className="proposal-workspace onlyoffice-workspace">
      <Script src="http://localhost:8080/web-apps/apps/api/documents/api.js" strategy="afterInteractive" onLoad={() => setScriptReady(true)} onReady={() => setScriptReady(true)} onError={() => setResult({ answer: ui.editorServerFailed, citations: [], locale })} />

      <aside className="document-nav">
        <span className="section-label">DOCUMENT</span>
        <h2>{t("proposalTitle")}</h2>
        <p>{t("proposalDescription")}</p>
        <input ref={fileInputRef} className="file-input" type="file" accept=".docx,.hwp,.hwpx" onChange={handleFile} />
        <button className="upload-trigger" type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}><span>+</span>{loading ? "…" : t("chooseFile")}</button>
        <small className="format-recommendation">{ui.format}</small>
        <div className="current-file"><span>{ui.current}</span><strong>{document?.name || ui.none}</strong><small>{document ? ui.autosave : ui.docxOnly}</small></div>
        {document && <a className="document-download" href={`/api/documents/${document.id}?download=1`}>{ui.download}</a>}
        {recentDocuments.length > 0 && <div className="recent-documents"><b>{ui.recent}</b>{recentDocuments.map((item) => <button className={document?.id === item.id ? "recent-document active" : "recent-document"} type="button" key={item.id} onClick={() => openRecent(item)}><span>DOCX</span><strong>{item.name}</strong><small>{new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.updatedAt))}</small></button>)}</div>}
        <div className="example-template"><b>{ui.example}</b><a href="/templates/research-development-plan-template.hwp" download><span>HWP</span><strong>{ui.template}</strong><small>{ui.templateMeta}</small></a></div>
        <div className="format-notice"><b>{ui.webEditor}</b><p>{ui.features}</p><small>{ui.conversionNote}</small></div>
      </aside>

      <div className="document-editor onlyoffice-shell">
        {document ? <div id="onlyoffice-editor" key={document.id} /> : <div className="editor-empty"><span>STEP 1</span><h1>{ui.emptyTitle}</h1><p>{ui.emptyText}</p><button type="button" onClick={() => fileInputRef.current?.click()}>{ui.openDocx}</button></div>}
      </div>

      <aside className="ai-tutor">
        <div><span className="section-label">OPENAI ASSISTANT</span><h2>{t("assistant")}</h2><p>{t("assistantDescription")}</p></div>
        <div className="ai-message"><b>{aiLoading ? ui.analyzing : ui.openaiAnswer}</b><p>{result.answer}</p></div>
        {result.citations.length > 0 && <div className="ai-citations"><b>{ui.issueCards}</b>{result.citations.map((citation, index) => { const isOpen = activeCitations.includes(index); const isSaved = savedFeedback.some((item) => item.quote === citation.quote); return <article className={isOpen ? "active" : ""} key={`${citation.quote}-${index}`}><button type="button" aria-expanded={isOpen} onClick={() => { toggleCitation(index); void sendEditorCommand("navigate", citation.quote); }}><span>{ui.issue} {index + 1}</span><strong>“{citation.quote}”</strong><i>{isOpen ? ui.collapse : ui.viewFeedback}</i></button>{isOpen && <div className="feedback-bubble"><b>{ui.aiComment}</b><p>{citation.feedback}</p><div className="feedback-actions"><button type="button" onClick={() => saveFeedbackCard(citation.quote, citation.feedback)}>{isSaved ? ui.saved : ui.saveFeedback}</button><button type="button" onClick={() => void sendEditorCommand("comment", citation.quote, citation.feedback)}>{ui.addComment}</button></div></div>}</article>; })}</div>}
        {savedFeedback.length > 0 && <div className="saved-feedback"><b>{ui.savedFeedback}</b>{savedFeedback.map((item) => <button type="button" key={item.id} onClick={() => void sendEditorCommand("navigate", item.quote)}><strong>“{item.quote}”</strong><span>{item.feedback}</span></button>)}</div>}
        <div className="ai-actions">
          <button type="button" disabled={!document || aiLoading} onClick={() => document && void askOpenAI(document, "연구 목표가 구체적이고 측정 가능한지 검토해 주세요.")}>{ui.clarifyGoal}</button>
          <button type="button" disabled={!document || aiLoading} onClick={() => document && void askOpenAI(document, "한국 R&D 계획서의 행정 문체와 표현 관점에서 검토해 주세요.")}>{ui.adminStyle}</button>
        </div>
        <label className="selection-review">{t("selectedReview")}<textarea maxLength={700} value={selectedExcerpt} onChange={(event) => setSelectedExcerpt(event.target.value)} placeholder={ui.selectionPlaceholder} /><button type="button" disabled={!document || aiLoading || !selectedExcerpt.trim()} onClick={() => void reviewSelectedExcerpt()}>{t("selectedReview")}</button></label>
        <label>{t("question")}<textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={ui.questionPlaceholder} /><button type="button" disabled={!document || aiLoading || !question.trim()} onClick={() => void submitQuestion()}>{t("question")}</button></label>
      </aside>
    </section>
  );
}
