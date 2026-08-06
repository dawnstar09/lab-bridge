"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { saveResearcherProfile } from "@/lib/researcher-profile";
import { Logo } from "./logo";
import { countryOptions, TerminologyPreference, useLocale } from "./locale-provider";
import { SearchableSelect } from "./searchable-select";
import { careerStageOptions, institutionOptions, researchFieldOptions, specialtyOptions } from "@/lib/profile-options";

const authErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
  "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/invalid-email": "올바른 이메일 주소를 입력해 주세요.",
  "auth/operation-not-allowed": "Firebase 콘솔에서 이메일 로그인을 활성화해 주세요.",
  "auth/too-many-requests": "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
  "permission-denied": "Firebase Firestore 보안 규칙에서 사용자 프로필 저장 권한을 허용해 주세요.",
};

const profileOptionLabels = {
  ko: { optional: "선택", fields: ["인공지능·데이터", "바이오·의료", "에너지·환경", "소재·화학", "기계·로봇", "전자·통신", "인문·사회", "기타"], careers: ["학부생", "석사과정", "박사과정", "박사후연구원", "연구원", "교수", "기업 연구자"], terms: ["한국어 원문 + 번역 + 설명 (권장)", "번역 우선 + 한국어 병기", "한국어 원문 유지"], account: "이미 계정이 있나요?", accountAction: "로그인" },
  en: { optional: "optional", fields: ["AI & Data", "Bio & Medical", "Energy & Environment", "Materials & Chemistry", "Mechanical & Robotics", "Electronics & Communications", "Humanities & Social Science", "Other"], careers: ["Undergraduate", "Master's student", "Doctoral student", "Postdoctoral researcher", "Researcher", "Professor", "Industry researcher"], terms: ["Korean original + translation + explanation (recommended)", "Translation first + Korean original", "Keep Korean original only"], account: "Already have an account?", accountAction: "Sign in" },
  zh: { optional: "选填", fields: ["人工智能与数据", "生物与医疗", "能源与环境", "材料与化学", "机械与机器人", "电子与通信", "人文与社会科学", "其他"], careers: ["本科生", "硕士生", "博士生", "博士后研究员", "研究员", "教授", "企业研究员"], terms: ["韩语原文＋翻译＋说明（推荐）", "翻译优先＋韩语原文", "仅保留韩语原文"], account: "已有账户？", accountAction: "登录" },
  ja: { optional: "任意", fields: ["AI・データ", "バイオ・医療", "エネルギー・環境", "材料・化学", "機械・ロボット", "電子・通信", "人文・社会科学", "その他"], careers: ["学部生", "修士課程", "博士課程", "博士研究員", "研究員", "教授", "企業研究者"], terms: ["韓国語原文＋翻訳＋説明（推奨）", "翻訳優先＋韓国語原文", "韓国語原文のみ維持"], account: "すでにアカウントをお持ちですか？", accountAction: "ログイン" },
  vi: { optional: "không bắt buộc", fields: ["AI & Dữ liệu", "Sinh học & Y tế", "Năng lượng & Môi trường", "Vật liệu & Hóa học", "Cơ khí & Robot", "Điện tử & Truyền thông", "Khoa học xã hội & Nhân văn", "Khác"], careers: ["Sinh viên đại học", "Học viên cao học", "Nghiên cứu sinh", "Nghiên cứu sau tiến sĩ", "Nhà nghiên cứu", "Giáo sư", "Nhà nghiên cứu doanh nghiệp"], terms: ["Nguyên văn tiếng Hàn + bản dịch + giải thích (khuyên dùng)", "Bản dịch trước + nguyên văn tiếng Hàn", "Chỉ giữ nguyên văn tiếng Hàn"], account: "Đã có tài khoản?", accountAction: "Đăng nhập" },
};

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const { country, locale, terminologyPreference, setCountry, setTerminologyPreference, t } = useLocale();
  const optionLabels = profileOptionLabels[locale];

  function destination() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  }

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) router.replace(destination());
  }), [router]);

  async function handlePasswordReset() {
    setError("");
    setMessage("");
    if (!email.trim()) { setError(t("resetEmailRequired")); return; }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(t("resetSent"));
    } catch (caughtError) {
      const code = caughtError instanceof FirebaseError ? caughtError.code : "";
      setError(authErrorMessages[code] ?? t("resetFailed"));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const remember = formData.get("remember") === "on";

    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const fullName = String(formData.get("fullName") ?? "").trim();
        if (fullName) await updateProfile(credential.user, { displayName: fullName });
        await saveResearcherProfile(credential.user.uid, {
          fullName,
          email,
          organization: String(formData.get("organization") ?? "").trim(),
          researchField: String(formData.get("researchField") ?? "").trim(),
          specialty: String(formData.get("specialty") ?? "").trim(),
          careerStage: String(formData.get("careerStage") ?? "").trim(),
          interests: String(formData.get("interests") ?? "").trim(),
          orcid: String(formData.get("orcid") ?? "").trim(),
          country,
          locale,
          terminologyPreference,
        });
      }

      router.replace(destination());
    } catch (caughtError) {
      const code = caughtError instanceof FirebaseError ? caughtError.code : "";
      setError(authErrorMessages[code] ?? t("authFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Logo />
        <Link href="/">&larr; {t("back")}</Link>
      </header>

      <div className="auth-stage">
        <div className="auth-panel">
          <section className={`auth-card ${isLogin ? "" : "register-card"}`}>
            <div className="auth-heading">
              <span className="auth-eyebrow">{isLogin ? "WELCOME BACK" : "JOIN LAB-BRIDGE"}</span>
              <h1>{isLogin ? t("signin") : t("signup")}</h1>
              <p>{isLogin ? t("welcome") : t("profileDescription")}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && <div className="profile-fields">
                <label className="profile-wide">{t("country")}<select value={country} onChange={(event) => setCountry(event.target.value)}>{countryOptions.map((item) => <option value={item.code} key={item.code}>{item.label}</option>)}</select></label>
                <label>{t("name")}<input name="fullName" type="text" placeholder={t("name")} autoComplete="name" required /></label>
                <label>{t("organization")}<SearchableSelect name="organization" options={institutionOptions} placeholder={t("organization")} required /></label>
                <label>{t("field")}<SearchableSelect name="researchField" options={researchFieldOptions} placeholder={t("field")} required /></label>
                <label>{t("specialty")}<SearchableSelect name="specialty" options={specialtyOptions} placeholder={t("specialty")} required /></label>
                <label>{t("career")}<SearchableSelect name="careerStage" options={careerStageOptions} placeholder={t("career")} required /></label>
                <label>ORCID <span>({optionLabels.optional})</span><input name="orcid" type="text" placeholder="0000-0000-0000-0000" pattern="[0-9Xx-]{19}" /></label>
                <label className="profile-wide">{t("interests")}<textarea name="interests" required maxLength={500} /></label>
                <label className="profile-wide">{t("terminology")}<select value={terminologyPreference} onChange={(event) => setTerminologyPreference(event.target.value as TerminologyPreference)}><option value="original_with_explanation">{optionLabels.terms[0]}</option><option value="translated_with_original">{optionLabels.terms[1]}</option><option value="original_only">{optionLabels.terms[2]}</option></select></label>
              </div>}
              <label>{t("email")}<input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="researcher@example.com" autoComplete="email" required /></label>
              <label>{t("password")}<input name="password" type="password" placeholder="6 characters or more" minLength={6} autoComplete={isLogin ? "current-password" : "new-password"} required /></label>
              <div className="auth-options">
                <label className="remember"><input name="remember" type="checkbox" /> {t("remember")}</label>
                {isLogin && <button type="button" onClick={handlePasswordReset}>{t("forgot")}</button>}
              </div>
              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-message" role="status">{message}</p>}
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "..." : isLogin ? t("submitLogin") : t("submitRegister")}<span aria-hidden="true">&rarr;</span>
              </button>
            </form>

            <div className="auth-divider"><span>{t("or")}</span></div>
            <button className="orcid-button" type="button" disabled><b>iD</b> {t("continueOrcid")}</button>
            <p className="auth-switch">{isLogin ? t("newUser") : optionLabels.account}{" "}<Link href={isLogin ? "/register" : "/login"}>{isLogin ? t("submitRegister") : optionLabels.accountAction}</Link></p>
          </section>

          <aside className="auth-visual">
            <div className="auth-visual-copy"><span>{t("researchConnected")}</span><h2>{t("barrierCopy")}</h2></div>
            <Image src="/login-illustration.png" alt="Two researchers having a conversation" width={919} height={601} priority />
            <p>{t("oneProfile")}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
