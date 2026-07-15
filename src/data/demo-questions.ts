import type { QuestionCardData } from "@/components/question-card";

export interface DemoQuestion extends QuestionCardData {
  correctKey: string;
  explanation: string;
  topic: string;
}

const generalQuestions: DemoQuestion[] = [
  {
    id: "geral-logica-demorgan",
    statement:
      "A negação lógica de ‘o processo foi auditado e o relatório foi publicado’ corresponde a qual alternativa?",
    alternatives: [
      { key: "A", text: "O processo não foi auditado e o relatório não foi publicado." },
      { key: "B", text: "O processo não foi auditado ou o relatório não foi publicado." },
      { key: "C", text: "O processo foi auditado ou o relatório foi publicado." },
      { key: "D", text: "Se o processo foi auditado, o relatório não foi publicado." },
      { key: "E", text: "O processo foi auditado se, e somente se, o relatório foi publicado." },
    ],
    correctKey: "B",
    explanation:
      "Pela lei de De Morgan, a negação de uma conjunção ‘P e Q’ é ‘não P ou não Q’. Basta que uma das duas afirmações seja falsa para negar a frase original.",
    topic: "Raciocínio lógico · Leis de De Morgan",
    exam_block: "gerais",
    question_weight: 1,
    source_reference: { banca: "Demonstração", ano: 2026, prova: "Conteúdo previsto no edital" },
  },
  {
    id: "geral-seguranca-phishing",
    statement:
      "Qual situação caracteriza, de forma mais direta, uma tentativa de phishing em ambiente de trabalho?",
    alternatives: [
      { key: "A", text: "Atualização automática do navegador pelo canal oficial." },
      { key: "B", text: "Cópia de segurança agendada em servidor institucional." },
      {
        key: "C",
        text: "Mensagem que imita um serviço legítimo e solicita credenciais em um link falso.",
      },
      { key: "D", text: "Uso de autenticação em dois fatores para acessar o correio eletrônico." },
      { key: "E", text: "Criptografia de um arquivo antes do envio autorizado." },
    ],
    correctKey: "C",
    explanation:
      "Phishing usa engenharia social e aparência de legitimidade para induzir a vítima a revelar dados ou executar uma ação perigosa, normalmente por link, anexo ou página falsa.",
    topic: "Informática · Segurança da informação",
    exam_block: "gerais",
    question_weight: 1,
    source_reference: { banca: "Demonstração", ano: 2026, prova: "Conteúdo previsto no edital" },
  },
  {
    id: "geral-lgpd-finalidade",
    statement:
      "No tratamento de dados pessoais, o princípio da finalidade exige que a operação seja realizada para quê?",
    alternatives: [
      { key: "A", text: "Propósitos legítimos, específicos, explícitos e informados ao titular." },
      { key: "B", text: "Qualquer propósito definido posteriormente pelo controlador." },
      { key: "C", text: "Uso irrestrito, desde que o dado tenha sido obtido por meio digital." },
      { key: "D", text: "Compartilhamento automático com todos os órgãos públicos." },
      { key: "E", text: "Armazenamento permanente, independentemente da necessidade." },
    ],
    correctKey: "A",
    explanation:
      "A LGPD vincula o tratamento a propósitos legítimos, específicos, explícitos e informados ao titular, vedando tratamento posterior incompatível com essas finalidades.",
    topic: "Informática aplicada · LGPD",
    exam_block: "gerais",
    question_weight: 1,
    source_reference: { banca: "Demonstração", ano: 2026, prova: "Lei nº 13.709/2018, art. 6º" },
  },
  {
    id: "geral-portugues-coesao",
    statement:
      "Na frase ‘O relatório apresentou evidências suficientes; portanto, a equipe recomendou a correção do procedimento’, o conector ‘portanto’ expressa qual relação?",
    alternatives: [
      { key: "A", text: "Oposição." },
      { key: "B", text: "Condição." },
      { key: "C", text: "Conclusão." },
      { key: "D", text: "Concessão." },
      { key: "E", text: "Alternância." },
    ],
    correctKey: "C",
    explanation:
      "‘Portanto’ introduz uma conclusão decorrente da informação anterior. Reconhecer o valor do conector ajuda a reconstruir a progressão lógica do texto.",
    topic: "Língua Portuguesa · Coesão textual",
    exam_block: "gerais",
    question_weight: 1,
    source_reference: { banca: "Demonstração", ano: 2026, prova: "Conteúdo previsto no edital" },
  },
];

const specialtyQuestions: Record<string, DemoQuestion> = {
  "analista-administracao": makeSpecialty(
    "administracao-pdca",
    "No ciclo PDCA, qual atividade pertence à etapa Check?",
    [
      "Definir metas e métodos.",
      "Executar o plano e treinar a equipe.",
      "Comparar os resultados obtidos com as metas estabelecidas.",
      "Padronizar imediatamente qualquer resultado observado.",
      "Substituir o planejamento por inspeção final.",
    ],
    "C",
    "Na etapa Check, resultados e indicadores são medidos e comparados com o que foi planejado. A etapa Act trata das correções e da padronização.",
    "Administração · Gestão da qualidade",
  ),
  "analista-contabilidade": makeSpecialty(
    "contabilidade-equacao",
    "Qual equação representa a relação patrimonial básica da contabilidade?",
    [
      "Ativo = Passivo + Patrimônio Líquido.",
      "Receita = Ativo + Passivo.",
      "Patrimônio Líquido = Ativo + Passivo.",
      "Despesa = Receita + Ativo.",
      "Passivo = Ativo + Patrimônio Líquido.",
    ],
    "A",
    "Os recursos controlados pela entidade (ativo) são financiados por obrigações com terceiros (passivo) e pelos recursos próprios (patrimônio líquido).",
    "Contabilidade · Estrutura patrimonial",
  ),
  "analista-direito": makeSpecialty(
    "direito-legalidade",
    "Para a Administração Pública, o princípio da legalidade significa, em regra, que o agente público deve agir como?",
    [
      "Conforme sua preferência, desde que não haja dano.",
      "Somente quando e na medida autorizada pelo ordenamento jurídico.",
      "Livremente, sempre que invocar interesse público.",
      "Com base exclusiva em costumes administrativos.",
      "Sem motivação nos atos discricionários.",
    ],
    "B",
    "A atuação administrativa está juridicamente vinculada: competência, finalidade e limites decorrem do ordenamento. O interesse público não cria autorização genérica para agir.",
    "Direito Administrativo · Princípios",
  ),
  "analista-eng-telecom": makeSpecialty(
    "telecom-largura-banda",
    "Em telecomunicações, a largura de banda de um canal corresponde, no domínio da frequência, a quê?",
    [
      "À potência média do transmissor.",
      "À diferença entre as frequências superior e inferior ocupadas pelo canal.",
      "Ao tempo total de propagação do sinal.",
      "À quantidade de antenas do sistema.",
      "Ao número de usuários cadastrados na rede.",
    ],
    "B",
    "A largura de banda em frequência é a faixa ocupada pelo sinal, calculada pela diferença entre seus limites superior e inferior, e é expressa em hertz.",
    "Telecomunicações · Sinais e canais",
  ),
  "analista-eng-eletrica": makeSpecialty(
    "eletrica-ohm",
    "Em um resistor ideal de 10 Ω submetido a uma tensão de 20 V, qual é a corrente elétrica?",
    ["0,5 A.", "2 A.", "10 A.", "20 A.", "200 A."],
    "B",
    "Pela lei de Ohm, I = V/R. Assim, I = 20/10 = 2 A.",
    "Engenharia Elétrica · Circuitos",
  ),
  "analista-eng-mecanica": makeSpecialty(
    "mecanica-primeira-lei",
    "Em um sistema fechado, a primeira lei da Termodinâmica expressa essencialmente qual princípio?",
    [
      "Conservação da energia.",
      "Conservação exclusiva da massa específica.",
      "Aumento obrigatório de pressão.",
      "Temperatura constante em qualquer processo.",
      "Ausência de trabalho de fronteira.",
    ],
    "A",
    "A primeira lei aplica a conservação da energia: a variação da energia do sistema decorre das transferências de calor e trabalho, conforme a convenção adotada.",
    "Engenharia Mecânica · Termodinâmica",
  ),
  "analista-estatistica": makeSpecialty(
    "estatistica-mediana",
    "Em uma distribuição com valores extremos muito altos, qual medida de tendência central tende a ser mais resistente a esses valores?",
    ["Média aritmética.", "Média geométrica.", "Mediana.", "Amplitude.", "Variância."],
    "C",
    "A mediana depende da posição dos dados ordenados e sofre menos influência de valores extremos que a média aritmética.",
    "Estatística · Medidas de posição",
  ),
  "analista-medicina": makeSpecialty(
    "medicina-periodico",
    "No acompanhamento da saúde ocupacional, o exame periódico tem como finalidade principal qual ação?",
    [
      "Substituir toda avaliação clínica por questionário eletrônico.",
      "Acompanhar o estado de saúde do trabalhador ao longo do vínculo e identificar alterações relacionadas ao trabalho.",
      "Autorizar automaticamente aposentadoria por invalidez.",
      "Avaliar somente acidentes já ocorridos.",
      "Eliminar a necessidade de medidas preventivas coletivas.",
    ],
    "B",
    "O exame periódico integra o acompanhamento longitudinal da saúde ocupacional e apoia a detecção precoce de alterações, sem substituir prevenção ou avaliação clínica adequada.",
    "Medicina · Saúde ocupacional",
  ),
  "analista-psicologia": makeSpecialty(
    "psicologia-clima",
    "Em Psicologia Organizacional, o clima organizacional está mais diretamente associado a quê?",
    [
      "À estrutura jurídica da organização.",
      "À percepção compartilhada das pessoas sobre práticas e ambiente de trabalho em determinado período.",
      "A traços imutáveis de personalidade de cada servidor.",
      "Ao organograma formal, exclusivamente.",
      "À soma dos salários pagos no mês.",
    ],
    "B",
    "Clima organizacional descreve percepções relativamente atuais sobre o ambiente e as práticas de trabalho. Cultura envolve pressupostos e valores mais profundos e duradouros.",
    "Psicologia · Comportamento organizacional",
  ),
  "analista-ti": makeSpecialty(
    "ti-indice-banco",
    "Em um banco de dados relacional, qual efeito é esperado da criação criteriosa de um índice sobre uma coluna muito consultada?",
    [
      "Acelerar determinadas consultas, com possível custo adicional em escrita e armazenamento.",
      "Eliminar automaticamente registros duplicados.",
      "Criptografar todos os dados da tabela.",
      "Substituir as chaves primárias.",
      "Impedir qualquer operação de atualização.",
    ],
    "A",
    "Índices podem reduzir o custo de busca em consultas, mas ocupam espaço e precisam ser mantidos durante inserções e atualizações. Por isso, sua criação deve ser seletiva.",
    "Tecnologia da Informação · Banco de dados",
  ),
  "auditor-atuariais": makeSpecialty(
    "atuariais-deficit",
    "Em uma avaliação atuarial previdenciária, há déficit atuarial quando, consideradas as premissas adotadas, ocorre qual situação?",
    [
      "Os ativos e receitas projetadas superam todas as obrigações futuras.",
      "O valor presente das obrigações projetadas supera os ativos e receitas destinados à cobertura do plano.",
      "A folha de pagamento do mês é inferior à arrecadação do mês.",
      "A taxa de juros real é exatamente igual a zero.",
      "Não existem beneficiários ativos no período corrente.",
    ],
    "B",
    "O déficit atuarial representa insuficiência projetada de recursos para cobrir as obrigações avaliadas, em valor presente e conforme as premissas demográficas, econômicas e financeiras.",
    "Ciências Atuariais · Equilíbrio atuarial",
  ),
  "auditor-controle-externo": makeSpecialty(
    "controle-externo-tcu",
    "No modelo constitucional brasileiro, o controle externo federal é exercido pelo Congresso Nacional com o auxílio de qual órgão?",
    [
      "Conselho Nacional de Justiça.",
      "Banco Central do Brasil.",
      "Tribunal de Contas da União.",
      "Advocacia-Geral da União.",
      "Controladoria-Geral da União, exclusivamente.",
    ],
    "C",
    "A Constituição Federal atribui o controle externo ao Congresso Nacional, exercido com o auxílio do Tribunal de Contas da União. O desenho inspira a atuação dos tribunais de contas nos demais entes.",
    "Controle Externo · Constituição Federal, arts. 70 e 71",
  ),
  "auditor-engenharia": makeSpecialty(
    "engenharia-cura-concreto",
    "Qual é a finalidade central da cura adequada do concreto após o lançamento?",
    [
      "Aumentar a evaporação imediata da água.",
      "Manter condições de umidade e temperatura favoráveis à hidratação do cimento e ao desenvolvimento de propriedades.",
      "Eliminar a necessidade de controle tecnológico.",
      "Substituir o adensamento do concreto fresco.",
      "Reduzir obrigatoriamente a quantidade de armadura calculada.",
    ],
    "B",
    "A cura limita a perda precoce de água e mantém condições para a hidratação do cimento, contribuindo para resistência, durabilidade e menor fissuração.",
    "Engenharia Civil · Tecnologia do concreto",
  ),
  "auditor-medicina": makeSpecialty(
    "auditor-medicina-incidencia",
    "Em epidemiologia, a incidência de uma doença mede qual ocorrência?",
    [
      "Todos os casos existentes, antigos e novos, em um momento.",
      "Somente os óbitos atribuídos à doença.",
      "Casos novos surgidos em uma população sob risco durante determinado período.",
      "A proporção de exames laboratoriais realizados.",
      "A duração média de cada internação.",
    ],
    "C",
    "Incidência se refere ao aparecimento de casos novos em uma população sob risco ao longo de um período. Prevalência considera o conjunto de casos existentes.",
    "Medicina · Epidemiologia",
  ),
  "auditor-ti": makeSpecialty(
    "auditor-ti-privilegio",
    "O princípio do menor privilégio em segurança da informação recomenda qual prática?",
    [
      "Conceder acesso administrativo a todos para reduzir chamados.",
      "Conceder apenas as permissões necessárias para a tarefa e pelo tempo necessário.",
      "Compartilhar contas de serviço entre equipes.",
      "Desabilitar registros de auditoria.",
      "Manter permissões antigas após mudança de função.",
    ],
    "B",
    "O menor privilégio reduz a superfície de ataque e o impacto de erros ou comprometimentos, limitando acessos ao estritamente necessário.",
    "Tecnologia da Informação · Segurança",
  ),
  "tecnico-administrativa": makeSpecialty(
    "tecnico-empenho",
    "Na execução da despesa pública, qual estágio cria para o Estado obrigação de pagamento, pendente ou não de condição?",
    ["Arrecadação.", "Previsão.", "Empenho.", "Recolhimento.", "Lançamento tributário."],
    "C",
    "O empenho é o ato da autoridade competente que cria para o Estado obrigação de pagamento, pendente ou não de implemento de condição. Liquidação e pagamento ocorrem depois.",
    "Administração pública · Execução da despesa",
  ),
};

function makeSpecialty(
  id: string,
  statement: string,
  alternatives: string[],
  correctKey: string,
  explanation: string,
  topic: string,
): DemoQuestion {
  return {
    id,
    statement,
    alternatives: alternatives.map((text, index) => ({
      key: String.fromCharCode(65 + index),
      text,
    })),
    correctKey,
    explanation,
    topic,
    exam_block: "especificos",
    question_weight: 2,
    source_reference: { banca: "Demonstração", ano: 2026, prova: "Conteúdo previsto no edital" },
  };
}

export function getDemoSession(positionCode: string): DemoQuestion[] {
  const specialty =
    specialtyQuestions[positionCode] ?? specialtyQuestions["auditor-controle-externo"];
  return [specialty, ...generalQuestions];
}
