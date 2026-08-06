export type KaistResearcher = {
  id: string;
  lab: string;
  professor: string;
  department: string;
  keywords: string[];
};

export const kaistResearchers: KaistResearcher[] = [
  { id:"kaist-smesh", lab:"시스템 대사 공학 및 시스템 헬스케어(SMESH) 실험실", professor:"이상엽 교수", department:"화학 및 생체분자공학", keywords:["대사공학","시스템생물학","바이오","헬스케어","화학생명공학"] },
  { id:"kaist-acoustic-microfluidics", lab:"차세대 의료를 위한 음향-마이크로유체 연구센터", professor:"형진성 교수", department:"기계공학", keywords:["음향","마이크로유체","의료기기","기계공학","바이오메디컬"] },
  { id:"kaist-computational-materials", lab:"계산 재료 물리학 연구소", professor:"창 기주 교수", department:"물리학", keywords:["계산재료","물리학","시뮬레이션","재료과학","양자"] },
  { id:"kaist-catalyst-design", lab:"촉매 및 화학 반응 분자 설계 연구소", professor:"류 룡 교수", department:"화학", keywords:["촉매","화학반응","분자설계","합성","화학"] },
  { id:"kaist-nanophotonics", lab:"나노포토닉스 연구소", professor:"이용희 교수", department:"물리학", keywords:["나노포토닉스","광학","레이저","물리학","나노기술"] },
  { id:"kaist-biodeengineering", lab:"KAIST 바이오디그리니어링 연구소", professor:"김선창 교수", department:"생물과학", keywords:["바이오","생물과학","합성생물학","유전공학","생명공학"] },
  { id:"kaist-thermal-superconductor", lab:"열 초전도체 연구소", professor:"김성진 교수", department:"기계공학", keywords:["초전도체","열공학","에너지","재료","기계공학"] },
  { id:"kaist-sustainable-chemistry", lab:"지속 가능한 화학 변환 및 유기 합성 실험실", professor:"장석복 교수", department:"화학", keywords:["지속가능화학","유기합성","화학변환","촉매","화학"] },
  { id:"kaist-semiconductor-packaging", lab:"KAIST 시스템 반도체 패키징 연구소", professor:"김중호 교수", department:"전기공학", keywords:["시스템반도체","패키징","반도체","회로","전기전자"] },
  { id:"kaist-pde", lab:"편미분방정식을 위한 합성 연구의 최전선", professor:"재영변 교수", department:"수학과학", keywords:["편미분방정식","수학","해석학","수리모델","계산수학"] },
  { id:"kaist-extreme-materials", lab:"항공우주·극한 재료 및 공정 연구소", professor:"김춘곤 교수", department:"항공우주공학", keywords:["항공우주","극한재료","복합재료","공정","구조"] },
  { id:"kaist-vic-agi", lab:"Vision 중심 인공지능(ViC-AGI)을 위한 세대 간 협업 연구소", professor:"인소권 교수", department:"전기공학", keywords:["인공지능","컴퓨터비전","AGI","딥러닝","전기전자"] },
  { id:"kaist-ai-semiconductor", lab:"차세대 모델·AI 반도체 시스템 연구소", professor:"유호이준 교수", department:"전기공학", keywords:["AI반도체","인공지능","시스템반도체","가속기","전기전자"] },
  { id:"kaist-molecular-spectroscopy", lab:"분자 분광학 및 화학 동역학 연구실", professor:"김상규 교수", department:"화학", keywords:["분광학","화학동역학","분자","레이저","물리화학"] },
  { id:"kaist-advanced-data", lab:"첨단 데이터 컴퓨팅 연구소", professor:"문수복 교수", department:"컴퓨팅", keywords:["데이터","컴퓨팅","네트워크","인공지능","고성능컴퓨팅"] },
];
