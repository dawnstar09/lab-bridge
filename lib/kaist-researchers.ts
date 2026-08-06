export type KaistResearcher = {
  id: string;
  lab: string;
  labEn: string;
  professor: string;
  professorEn: string;
  department: string;
  departmentEn: string;
  keywords: string[];
};

export const kaistResearchers: KaistResearcher[] = [
  { id:"kaist-smesh", lab:"시스템 대사 공학 및 시스템 헬스케어(SMESH) 실험실", labEn:"Systems Metabolic Engineering and Systems Healthcare (SMESH) Laboratory", professor:"이상엽 교수", professorEn:"Prof. Sang Yup Lee", department:"화학 및 생체분자공학", departmentEn:"Chemical and Biomolecular Engineering", keywords:["대사공학","시스템생물학","바이오","헬스케어","화학생명공학"] },
  { id:"kaist-acoustic-microfluidics", lab:"헬스케어 음향미세유체 연구실", labEn:"Acousto-Microfluidics Research Center for Next-Generation Healthcare", professor:"성형진 교수", professorEn:"Prof. Hyung Jin Sung", department:"기계공학", departmentEn:"Mechanical Engineering", keywords:["음향","마이크로유체","의료기기","기계공학","바이오메디컬"] },
  { id:"kaist-computational-materials", lab:"응집물질계산물리 연구실", labEn:"Computational Condensed Matter Physics Laboratory", professor:"장기주 교수", professorEn:"Prof. Kee Joo Chang", department:"물리학", departmentEn:"Physics", keywords:["계산재료","응집물질","물리학","시뮬레이션","재료과학","양자"] },
  { id:"kaist-catalyst-design", lab:"촉매설계 및 화학반응 연구실", labEn:"Catalyst Design and Chemical Reactions Laboratory", professor:"유룡 교수", professorEn:"Prof. Ryong Ryoo", department:"화학", departmentEn:"Chemistry", keywords:["촉매","화학반응","분자설계","합성","화학"] },
  { id:"kaist-nanophotonics", lab:"나노포토닉스 연구소", labEn:"Nanophotonics Laboratory", professor:"이용희 교수", professorEn:"Prof. Yong-Hee Lee", department:"물리학", departmentEn:"Physics", keywords:["나노포토닉스","광학","레이저","물리학","나노기술"] },
  { id:"kaist-biodeengineering", lab:"KAIST 바이오디그리니어링 연구소", labEn:"KAIST Biodesign Engineering Laboratory", professor:"김선창 교수", professorEn:"Prof. Sun Chang Kim", department:"생물과학", departmentEn:"Biological Sciences", keywords:["바이오","생물과학","합성생물학","유전공학","생명공학"] },
  { id:"kaist-thermal-superconductor", lab:"열 초전도체 연구소", labEn:"Thermal Superconductor Laboratory", professor:"김성진 교수", professorEn:"Prof. Sung Jin Kim", department:"기계공학", departmentEn:"Mechanical Engineering", keywords:["초전도체","열공학","에너지","재료","기계공학"] },
  { id:"kaist-sustainable-chemistry", lab:"지속 가능한 화학 변환 및 유기 합성 실험실", labEn:"Sustainable Chemical Transformation and Organic Synthesis Laboratory", professor:"장석복 교수", professorEn:"Prof. Sukbok Chang", department:"화학", departmentEn:"Chemistry", keywords:["지속가능화학","유기합성","화학변환","촉매","화학"] },
  { id:"kaist-semiconductor-packaging", lab:"KAIST 시스템 반도체 패키징 연구실", labEn:"KAIST System Semiconductor Packaging Laboratory", professor:"김정호 교수", professorEn:"Prof. Joungho Kim", department:"전기공학", departmentEn:"Electrical Engineering", keywords:["시스템반도체","패키징","반도체","회로","전기전자"] },
  { id:"kaist-pde", lab:"편미분방정식을 위한 합성 연구의 최전선", labEn:"Frontiers of Synthetic Research for Partial Differential Equations", professor:"재영변 교수", professorEn:"Prof. Jaeyoung Byeon", department:"수학과학", departmentEn:"Mathematical Sciences", keywords:["편미분방정식","수학","해석학","수리모델","계산수학"] },
  { id:"kaist-extreme-materials", lab:"항공우주·극한 재료 및 공정 연구소", labEn:"Aerospace and Extreme Materials and Processes Laboratory", professor:"김춘곤 교수", professorEn:"Prof. Chun-Gon Kim", department:"항공우주공학", departmentEn:"Aerospace Engineering", keywords:["항공우주","극한재료","복합재료","공정","구조"] },
  { id:"kaist-vic-agi", lab:"비전중심 범용 인공지능 연구실(ViC-AGI)", labEn:"Vision-Centric Artificial General Intelligence (ViC-AGI) Laboratory", professor:"권인소 교수", professorEn:"Prof. In So Kweon", department:"전기공학", departmentEn:"Electrical Engineering", keywords:["인공지능","컴퓨터비전","AGI","딥러닝","전기전자"] },
  { id:"kaist-ai-semiconductor", lab:"차세대 AI 반도체 시스템 연구실", labEn:"Next-Generation AI Semiconductor Systems Laboratory", professor:"유회준 교수", professorEn:"Prof. Hoi-Jun Yoo", department:"전기공학", departmentEn:"Electrical Engineering", keywords:["AI반도체","인공지능","시스템반도체","가속기","전기전자"] },
  { id:"kaist-molecular-spectroscopy", lab:"분자 분광학 및 화학 동역학 연구실", labEn:"Molecular Spectroscopy and Chemical Dynamics Laboratory", professor:"김상규 교수", professorEn:"Prof. Sang Kyu Kim", department:"화학", departmentEn:"Chemistry", keywords:["분광학","화학동역학","분자","레이저","물리화학"] },
  { id:"kaist-advanced-data", lab:"첨단 데이터 컴퓨팅 연구소", labEn:"Advanced Data Computing Laboratory", professor:"문수복 교수", professorEn:"Prof. Sue Moon", department:"컴퓨팅", departmentEn:"Computing", keywords:["데이터","컴퓨팅","네트워크","인공지능","고성능컴퓨팅"] },
];
