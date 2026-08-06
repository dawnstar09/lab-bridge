export const koreanRAndDGlossary = [
  ["연구개발계획서", "R&D proposal / research and development plan", "한국 국가 R&D 과제 신청에 사용하는 공식 계획 문서"],
  ["공고문", "official call for proposals", "지원 자격·기간·제출 서류를 규정한 정부 또는 전문기관의 공식 공고"],
  ["주관연구개발기관", "lead R&D institution", "과제 전체를 책임지고 관리하는 대표 수행기관"],
  ["공동연구개발기관", "participating R&D institution", "주관기관과 역할을 나누어 과제를 수행하는 기관"],
  ["정부지원연구개발비", "government R&D contribution", "정부가 과제 수행을 위해 지원하는 연구개발비"],
  ["기관부담연구개발비", "institutional matching contribution", "수행기관이 현금 또는 현물로 부담하는 연구개발비"],
  ["세부과제", "subproject", "총괄과제 아래에서 독립된 목표와 책임자를 갖는 하위 과제"],
  ["위탁연구", "commissioned research", "핵심 과제의 일부를 외부기관에 위탁하여 수행하는 연구"],
  ["전문기관", "R&D management agency", "정부 부처를 대신해 공고·평가·협약·정산을 관리하는 기관"],
  ["협약", "R&D funding agreement", "선정 이후 연구기관과 전문기관이 체결하는 과제 수행 계약"],
  ["정산", "eligible-cost settlement", "과제 종료 또는 연차 종료 시 연구비 사용 적정성을 확인하는 절차"],
  ["기술성숙도(TRL)", "Technology Readiness Level (TRL)", "기술의 개념 단계부터 실제 환경 검증까지의 성숙도 척도"],
  ["국가연구개발혁신법", "National R&D Innovation Act", "한국 국가연구개발사업의 관리 기준을 규정하는 법률"],
  ["IRIS(범부처통합연구지원시스템)", "Integrated R&D Information System (IRIS)", "한국 정부 R&D 과제 신청과 관리를 통합한 시스템"],
  ["NTIS(국가과학기술지식정보서비스)", "National Science & Technology Information Service (NTIS)", "국가 R&D 과제·성과·연구자 정보를 제공하는 한국의 정보 서비스"],
] as const;

export function glossaryPrompt() {
  return koreanRAndDGlossary.map(([term, translation, explanation]) => `- ${term}: ${translation}. ${explanation}`).join("\n");
}
