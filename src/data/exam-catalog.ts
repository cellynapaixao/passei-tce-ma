export type PositionGroup = "analista" | "auditor" | "tecnico";

export interface ExamPosition {
  number: number;
  code: string;
  group: PositionGroup;
  groupLabel: string;
  specialty: string;
  fullName: string;
  eligibility: string;
  level: "Superior" | "Médio";
  examDate: "2026-11-22" | "2026-11-29";
}

export const OFFICIAL_NOTICE_URL =
  "https://cdn.cebraspe.org.br/concursos/TCE_MA_26/arquivos/5FADC380CB030A07F557A9C5EEA6D063017A2CA675E683F39C50B65E6D70F57B.pdf";

export const EXAM_POSITIONS: ExamPosition[] = [
  {
    number: 1,
    code: "analista-administracao",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Administração",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Administração",
    eligibility: "Graduação em Administração e registro profissional.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 2,
    code: "analista-contabilidade",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Contabilidade",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Contabilidade",
    eligibility: "Graduação em Ciências Contábeis e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 3,
    code: "analista-direito",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Direito",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Direito",
    eligibility: "Graduação em Direito e registro na OAB.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 4,
    code: "analista-eng-telecom",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Engenharia de Telecomunicações",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Engenharia de Telecomunicações",
    eligibility: "Graduação em Engenharia de Telecomunicações e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 5,
    code: "analista-eng-eletrica",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Engenharia Elétrica",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Engenharia Elétrica",
    eligibility: "Graduação em Engenharia Elétrica e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 6,
    code: "analista-eng-mecanica",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Engenharia Mecânica",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Engenharia Mecânica",
    eligibility: "Graduação em Engenharia Mecânica e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 7,
    code: "analista-estatistica",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Estatística",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Estatística",
    eligibility: "Graduação em Estatística e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 8,
    code: "analista-medicina",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Medicina",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Medicina",
    eligibility: "Graduação em Medicina e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 9,
    code: "analista-psicologia",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Psicologia",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Psicologia",
    eligibility: "Graduação em Psicologia e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 10,
    code: "analista-ti",
    group: "analista",
    groupLabel: "Analista",
    specialty: "Tecnologia da Informação",
    fullName: "Analista Estadual de Apoio ao Controle Externo — Tecnologia da Informação",
    eligibility:
      "Curso superior em TI, incluindo Computação, Sistemas, Software, Redes, Banco de Dados, Segurança, Ciência de Dados ou correlatos.",
    level: "Superior",
    examDate: "2026-11-22",
  },
  {
    number: 11,
    code: "auditor-atuariais",
    group: "auditor",
    groupLabel: "Auditor",
    specialty: "Ciências Atuariais",
    fullName: "Auditor Estadual de Controle Externo — Ciências Atuariais",
    eligibility: "Graduação em Ciências Atuariais e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-29",
  },
  {
    number: 12,
    code: "auditor-controle-externo",
    group: "auditor",
    groupLabel: "Auditor",
    specialty: "Controle Externo",
    fullName: "Auditor Estadual de Controle Externo — Controle Externo",
    eligibility: "Graduação em qualquer área de formação.",
    level: "Superior",
    examDate: "2026-11-29",
  },
  {
    number: 13,
    code: "auditor-engenharia",
    group: "auditor",
    groupLabel: "Auditor",
    specialty: "Engenharia",
    fullName: "Auditor Estadual de Controle Externo — Engenharia",
    eligibility: "Graduação em Engenharia Civil e registro no conselho de classe.",
    level: "Superior",
    examDate: "2026-11-29",
  },
  {
    number: 14,
    code: "auditor-medicina",
    group: "auditor",
    groupLabel: "Auditor",
    specialty: "Medicina",
    fullName: "Auditor Estadual de Controle Externo — Medicina",
    eligibility: "Graduação em Medicina e registro profissional.",
    level: "Superior",
    examDate: "2026-11-29",
  },
  {
    number: 15,
    code: "auditor-ti",
    group: "auditor",
    groupLabel: "Auditor",
    specialty: "Tecnologia da Informação",
    fullName: "Auditor Estadual de Controle Externo — Tecnologia da Informação",
    eligibility:
      "Curso superior em TI, incluindo Computação, Sistemas, Software, Redes, Banco de Dados, Segurança, Ciência de Dados ou correlatos.",
    level: "Superior",
    examDate: "2026-11-29",
  },
  {
    number: 16,
    code: "tecnico-administrativa",
    group: "tecnico",
    groupLabel: "Técnico",
    specialty: "Técnico-Administrativa",
    fullName: "Técnico Estadual de Controle Externo — Técnico-Administrativa",
    eligibility: "Certificado de conclusão do ensino médio.",
    level: "Médio",
    examDate: "2026-11-29",
  },
];

export const POSITION_GROUPS = [
  { key: "analista" as const, label: "Analista", count: 10, dateLabel: "22 nov 2026" },
  { key: "auditor" as const, label: "Auditor", count: 5, dateLabel: "29 nov 2026" },
  { key: "tecnico" as const, label: "Técnico", count: 1, dateLabel: "29 nov 2026" },
];

export function getPosition(code: string | undefined) {
  return EXAM_POSITIONS.find((position) => position.code === code) ?? EXAM_POSITIONS[11];
}

export function formatExamDate(date: ExamPosition["examDate"]) {
  return date === "2026-11-22" ? "22 de novembro de 2026" : "29 de novembro de 2026";
}
