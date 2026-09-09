import { CustomHouseConfig } from './houseGenerator';

export interface BuildingDatabaseEntry {
  id: string;
  name: string;
  category: 'Comércio e Serviços' | 'Governo e Segurança' | 'Religião e Magia' | 'Residencial e Social' | 'Submundo e Entretenimento';
  type: string;
  variation: string;
  architectureMaterials: string;
  config: Omit<CustomHouseConfig, 'seed' | 'stylePreset'> & { stylePreset: CustomHouseConfig['stylePreset'] };
}

export const BUILDING_DATABASE: BuildingDatabaseEntry[] = [
  // --- COMÉRCIO E SERVIÇOS ---
  {
    id: 'tavern-low',
    name: 'O Javali Degolado',
    category: 'Comércio e Serviços',
    type: 'Taverna/Estalagem',
    variation: 'Baixa (Estalagem de beira de estrada suja)',
    architectureMaterials: 'Aparência Externa: Um pardieiro tortuoso de carvalho apodrecido e argamassa rachada, cercado por lamaçal constante. O telhado de palha escura e úmida exibe furos grosseiros, e o duto da chaminé solta cinzas pesadas. Aparência Interna: Chão de terra batida recoberto de serragem rançosa, vigas escoradas e mofadas que rangem ao vento, mesas de pinho manchadas e bancos capengas rústicos impregnados de gordura acumulada.',
    config: {
      width: 0.58,
      length: 0.72,
      height: 0.4,
      roofType: 'cone',
      roofHeight: 0.35,
      roofOverhang: 0.05,
      wallColor: '#5c4d3c', // Dirty brown wood
      roofColor: '#292524', // Rotten dark straw gray
      doorColor: '#451a03', // Weathered brown
      windowGlowColor: '#b45309', // Dim orange candle
      windowCount: 1,
      hasChimney: true,
      chimneyHeight: 0.2,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'tavern-mid',
    name: 'A Taverna do Dragão Caolho',
    category: 'Comércio e Serviços',
    type: 'Taverna/Estalagem',
    variation: 'Média (Taverna de aventureiros)',
    architectureMaterials: 'Aparência Externa: Fachada aconchegante construída em enxaimel com fundação robusta de blocos de arenito cinza. O teto inclinado de telhas de barro escurecidas abriga uma generosa varanda com colunas de pinho. Aparência Interna: Salão amplo revestido de tábuas de carvalho encerado, guarnecido por uma lareira monumental de pedra de rio. Troféus de monstros e escudos heráldicos decoram as paredes sob luz quente de lamparinas de óleo.',
    config: {
      width: 0.78,
      length: 0.88,
      height: 0.52,
      roofType: 'gabled',
      roofHeight: 0.58,
      roofOverhang: 0.14,
      wallColor: '#854d0e', // Amber oak wood
      roofColor: '#7c2d12', // Terracotta roof tiles
      doorColor: '#451a03', // Strong dark wood door
      windowGlowColor: '#eab308', // Welcoming yellow glow
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.32,
      hasPorch: true,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'tavern-high',
    name: 'O Salão do Cálice Dourado',
    category: 'Comércio e Serviços',
    type: 'Taverna/Estalagem',
    variation: 'Alta (Clube nobre exclusivo)',
    architectureMaterials: 'Aparência Externa: Arquitetura neoclássica imponente de mármore branco polido e colunas simétricas de travertino. Amplas janelas arqueadas emolduradas em bronze e telhas esmaltadas azuis criam um aspecto majestoso. Aparência Interna: Salão privativo refinado com carpetes de veludo carmesim espessos, tetos em caixotão decorados com folha de ouro e lustres de cristal reluzente. Balcão talhado em jacarandá e estofados acolchoados luxuosos nas poltronas.',
    config: {
      width: 0.85,
      length: 0.85,
      height: 0.7,
      roofType: 'flat',
      roofHeight: 0.12,
      roofOverhang: 0.18,
      wallColor: '#f1f5f9', // Polished white slate marble
      roofColor: '#0369a1', // Lapis lazuli blue enamel roof
      doorColor: '#fbbf24', // Golden brass handles on mahogany
      windowGlowColor: '#38bdf8', // Elegant cyan glass shine
      windowCount: 4,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'modern'
    }
  },
  {
    id: 'blacksmith-gen',
    name: 'A Bigorna de Ferro Velho',
    category: 'Comércio e Serviços',
    type: 'Ferreiro/Armeiro',
    variation: 'Geral (consertos, armas simples)',
    architectureMaterials: 'Aparência Externa: Oficina austera de pedra calcária bruta enegrecida pela fumaça incessante, ostentando um teto gótico simples de metal rústico. Uma pilha de carvão e sucatas de ferro flanqueia a entrada aberta. Aparência Interna: Piso calçado com paralelepípedos ásperos, fole de couro imenso acoplado a uma fornalha aberta incandescente. Cavaletes de madeira suportam ferraduras e enxadas em processo de têmpera.',
    config: {
      width: 0.65,
      length: 0.65,
      height: 0.48,
      roofType: 'cone',
      roofHeight: 0.32,
      roofOverhang: 0.06,
      wallColor: '#475569', // Ash grey stone
      roofColor: '#1e293b', // Wrought iron dark roof
      doorColor: '#1e1b4b', // Scored dark iron
      windowGlowColor: '#f97316', // Orange forge flame glow
      windowCount: 2,
      hasChimney: true,
      chimneyHeight: 0.4,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'blacksmith-spec',
    name: 'A Guilda da Bigorna de Prata',
    category: 'Comércio e Serviços',
    type: 'Ferreiro/Armeiro',
    variation: 'Especializado (apenas armaduras de placas)',
    architectureMaterials: 'Aparência Externa: Fachada robusta com contrafortes de granito trabalhado e vigas ornamentadas de mogno. Duas vitrines protegidas por grades de ferro exibem elmos góticos e espaldares brilhantes. Aparência Interna: Oficina limpa e organizada, com moldes de gesso e madeira pendurados para fundição, bigornas de aço endurecido calibradas e prateleiras bem cuidadas ostentando couraças brunidas e escudos polidos.',
    config: {
      width: 0.72,
      length: 0.8,
      height: 0.58,
      roofType: 'gabled',
      roofHeight: 0.45,
      roofOverhang: 0.12,
      wallColor: '#64748b', // Steel-blue slate
      roofColor: '#475569', // Dark iron grey tiles
      doorColor: '#334155', // Thick metal door
      windowGlowColor: '#fed7aa', // Warm firelit interior
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.35,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'blacksmith-arcane',
    name: 'A Forja Celestial de Solars',
    category: 'Comércio e Serviços',
    type: 'Ferreiro/Armeiro',
    variation: 'Forja Arcana (encantamentos)',
    architectureMaterials: 'Aparência Externa: Um templo-forja de arenito azul místico com runas gravadas que cintilam suavemente na escuridão. O telhado cônico de liga metálica dourada termina em um longo agulheiro. Aparência Interna: Fornalha de fogo azul etéreo que flutua sem queimar lenha, bigornas de meteorito que emitem zumbidos harmônicos e prateleiras de cristal que suportam frascos de têmpera imbuídos de pó estelar e fluidos elementais.',
    config: {
      width: 0.65,
      length: 0.65,
      height: 0.85,
      roofType: 'spire',
      roofHeight: 0.8,
      roofOverhang: 0.08,
      wallColor: '#1e1b4b', // Midnight indigo blue
      roofColor: '#d97706', // Radiant gold metal
      doorColor: '#7c3aed', // Pulsing violet arcane door
      windowGlowColor: '#22c55e', // Emerald magic glow
      windowCount: 2,
      hasChimney: true,
      chimneyHeight: 0.4,
      hasPorch: false,
      stylePreset: 'wizard'
    }
  },
  {
    id: 'merchant-spice',
    name: 'Bazar das Mil Areias',
    category: 'Comércio e Serviços',
    type: 'Empório/Loja de Variedades',
    variation: 'Mercado de especiarias estrangeiras',
    architectureMaterials: 'Aparência Externa: Estilo otomano pitoresco com paredes de adobe ocre-amarelo e molduras de janelas entalhadas em arco de ferradura. Toldos listrados em tons quentes cobrem cestos repletos de pós coloridos dispostos à porta. Aparência Interna: Prateleiras de sândalo aromático perfumadas por cravo e mirra, tapetes persas sobrepostos no piso de argila cozida e pequenos balcões com balanças de precisão de bronze.',
    config: {
      width: 0.68,
      length: 0.78,
      height: 0.5,
      roofType: 'cone',
      roofHeight: 0.3,
      roofOverhang: 0.1,
      wallColor: '#f59e0b', // Sand amber adobe
      roofColor: '#b91c1c', // Crimson striped fabric feel
      doorColor: '#78350f', // Rich cedar
      windowGlowColor: '#fdba74', // Soft warm amber
      windowCount: 2,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'merchant-survival',
    name: 'O Desbravador das Estepes',
    category: 'Comércio e Serviços',
    type: 'Empório/Loja de Variedades',
    variation: 'Loja de equipamentos de sobrevivência',
    architectureMaterials: 'Aparência Externa: Cabana robusta feita de troncos brutos de pinheiro nórdico com calafetagem de musgo. O telhado de inclinação acentuada é ideal para escoar neve, e uma enorme pele de urso serve de cortina secundária na entrada. Aparência Interna: Paredes forradas de peles e couros, araras com mantas grossas, pilhas de raquetes de neve e cordas de cânhamo resistentes sob a luz de candeeiros rústicos de banha.',
    config: {
      width: 0.65,
      length: 0.9,
      height: 0.45,
      roofType: 'gabled',
      roofHeight: 0.72,
      roofOverhang: 0.2,
      wallColor: '#78350f', // Pine log brown
      roofColor: '#451a03', // Bark dark shingles
      doorColor: '#e2e8f0', // Birchwood white details
      windowGlowColor: '#fbbf24', // Warm orange tallow candle
      windowCount: 2,
      hasChimney: true,
      chimneyHeight: 0.3,
      hasPorch: true,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'merchant-antiques',
    name: 'Relíquias do Tempo Perdido',
    category: 'Comércio e Serviços',
    type: 'Empório/Loja de Variedades',
    variation: 'Comerciante de antiguidades',
    architectureMaterials: 'Aparência Externa: Sobrado em estilo vitoriano com tijolos desgastados pelo tempo e detalhes ornamentais de ferro fundido. Janelas em arco gótico dão uma espiada para o interior sombrio. Aparência Interna: Labirinto de estantes empoeiradas de mogno, entupido com relógios de pêndulo desalinhados, globos celestes enferrujados, grimórios sem capa e baús de metal trancados por segredo.',
    config: {
      width: 0.75,
      length: 0.75,
      height: 0.7,
      roofType: 'cone',
      roofHeight: 0.55,
      roofOverhang: 0.08,
      wallColor: '#7c2d12', // Weathered brick red
      roofColor: '#1e293b', // Slated dark grey
      doorColor: '#451a03', // Carved heavy oak
      windowGlowColor: '#fdba74', // Dim sepia lamp light
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.4,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'apothecary-herbal',
    name: 'O Recanto das Raízes de Sálvia',
    category: 'Comércio e Serviços',
    type: 'Boticário/Alquimista',
    variation: 'Herborista local',
    architectureMaterials: 'Aparência Externa: Chalé de pedra arredondada coberto por espessas trepadeiras floridas, heras e musgo fofo. O telhado rústico de colmo abriga ninhos de pássaros, e floreiras ricas em plantas aromáticas cercam a janela. Aparência Interna: Cheiro agradável de menta, terra úmida e eucalipto. Centenas de maços de ervas e raízes secam pendurados nas vigas do teto, e potes de cerâmica cheios de pomadas dividem espaço com almofarizes de pedra rústica.',
    config: {
      width: 0.6,
      length: 0.8,
      height: 0.42,
      roofType: 'gabled',
      roofHeight: 0.65,
      roofOverhang: 0.18,
      wallColor: '#65a30d', // Mossy green-grey stone
      roofColor: '#78350f', // Dry straw brown
      doorColor: '#a16207', // Warm hazelnut wood
      windowGlowColor: '#a3e635', // Pale lime herbal glow
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.25,
      hasPorch: false,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'apothecary-alchemist',
    name: 'O Alambique de Mercúrio',
    category: 'Comércio e Serviços',
    type: 'Boticário/Alquimista',
    variation: 'Laboratório Alquímico Complexo (vende elixires raros)',
    architectureMaterials: 'Aparência Externa: Estrutura cilíndrica de pedra calcária branca com tubulações de bronze retorcidas que expelem fumaça colorida e adocicada. Vitrais redondos revelam o brilho azul e rosa de líquidos agitados internamente. Aparência Interna: Alambiques monumentais de cobre e vidro borbulhando sem parar, retortas suspensas, prateleiras lotadas de vidraria de alta precisão com suspensões fluorescentes e elixires raros de cura.',
    config: {
      width: 0.65,
      length: 0.65,
      height: 0.8,
      roofType: 'spire',
      roofHeight: 0.7,
      roofOverhang: 0.05,
      wallColor: '#cbd5e1', // Clean limestone white
      roofColor: '#0c4a6e', // Deep mineral blue spire
      doorColor: '#1e293b', // Polished dark slate door
      windowGlowColor: '#ec4899', // Eerie pink-purple chemical glow
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.45,
      hasPorch: false,
      stylePreset: 'wizard'
    }
  },

  // --- GOVERNO E SEGURANÇA ---
  {
    id: 'gov-fort',
    name: 'Bastião da Sentinela de Ferro',
    category: 'Governo e Segurança',
    type: 'Sede do Governo (Castelo/Cidadela/Prefeitura)',
    variation: 'Fortificação Militar',
    architectureMaterials: 'Aparência Externa: Uma fortaleza brutalista colossal erguida com espessos blocos cinzentos de granito basáltico. Ameias defensivas largas, seteiras esguias e portões blindados revestidos de chapas de ferro rebitadas garantem a defesa. Aparência Interna: Corredores de pedra fria com teto em abóbada de berço, tochas em suportes de ferro forjado e uma austera mesa de carvalho no centro do salão de guerra com mapas táticos estendidos.',
    config: {
      width: 0.95,
      length: 0.95,
      height: 0.95,
      roofType: 'flat',
      roofHeight: 0.15,
      roofOverhang: 0.05,
      wallColor: '#475569', // Granite dark grey
      roofColor: '#334155', // Charcoal slate parapet
      doorColor: '#0f172a', // Heavy iron sheet
      windowGlowColor: '#ef4444', // Red-orange guard torch glow
      windowCount: 2,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'gov-palace',
    name: 'Palácio Imperial das Flores',
    category: 'Governo e Segurança',
    type: 'Sede do Governo (Castelo/Cidadela/Prefeitura)',
    variation: 'Palácio Nobre',
    architectureMaterials: 'Aparência Externa: Magnífico palácio barroco com colunatas majestosas de mármore branco de Carrara. Detalhes em estuque dourado guarnecem o telhado em cone de ardósia azul-celeste e os arcos das grandes portas entalhadas. Aparência Interna: Chão em bento grid de mármore espelhado bicolor, tapeçarias monumentais narrando batalhas imperiais, escadarias monumentais em arco duplo e espelhos ornamentados capturando a luz solar.',
    config: {
      width: 0.9,
      length: 0.9,
      height: 0.85,
      roofType: 'cone',
      roofHeight: 0.7,
      roofOverhang: 0.15,
      wallColor: '#f8fafc', // Pristine white marble
      roofColor: '#0284c7', // Sky-blue glazed tiles
      doorColor: '#ca8a04', // Gilded gold doors
      windowGlowColor: '#fef08a', // Glorious warm white/yellow light
      windowCount: 4,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'modern'
    }
  },
  {
    id: 'gov-admin',
    name: 'Chancelaria dos Escribas Reais',
    category: 'Governo e Segurança',
    type: 'Sede do Governo (Castelo/Cidadela/Prefeitura)',
    variation: 'Prédio Administrativo Burocrático',
    architectureMaterials: 'Aparência Externa: Edifício simétrico e austero de arenito cinzento e tijolos escuros. Colunas clássicas simplificadas decoram o portal de entrada, sob um telhado de ardósia bem conservado. Aparência Interna: Um labirinto de salas repletas de prateleiras de carvalho carregando arquivos amarelados, escrivaninhas em série com tinteiros, selos de cera e uma constante atmosfera de poeira de papel.',
    config: {
      width: 0.85,
      length: 0.85,
      height: 0.65,
      roofType: 'gabled',
      roofHeight: 0.4,
      roofOverhang: 0.08,
      wallColor: '#94a3b8', // Slate sandstone
      roofColor: '#1e293b', // Strict grey-slate shingles
      doorColor: '#451a03', // Traditional dark wood
      windowGlowColor: '#fcd34d', // Amber candlelight of working scribes
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.3,
      hasPorch: false,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'guard-post',
    name: 'A Guarita do Lodo',
    category: 'Governo e Segurança',
    type: 'Quartel da Guarda/Delegacia',
    variation: 'Posto Avançado (pequeno, corrupto)',
    architectureMaterials: 'Aparência Externa: Um fortim tosco e enclinado de troncos de pinheiro semi-podres e terra batida nos cantos para vedação. Telhado gotejante de turfa e mato, cercado por paliçadas frouxas. Aparência Interna: Uma única sala fria com cheiro de fumo e bebida barata. Uma mesa manca com dados de osso viciados, um baú de subornos e uma fogueira improvisada gerando fumaça asfixiante.',
    config: {
      width: 0.52,
      length: 0.52,
      height: 0.42,
      roofType: 'cone',
      roofHeight: 0.28,
      roofOverhang: 0.04,
      wallColor: '#451a03', // Damp dark logs
      roofColor: '#1c1917', // Rotten peat dark brown
      doorColor: '#292524', // Loose planks
      windowGlowColor: '#ea580c', // Dim orange soot fire
      windowCount: 1,
      hasChimney: true,
      chimneyHeight: 0.2,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'guard-hq',
    name: 'A Fortaleza da Ordem e da Lei',
    category: 'Governo e Segurança',
    type: 'Quartel da Guarda/Delegacia',
    variation: 'Quartel-General da Guarda da Cidade (grande, organizado)',
    architectureMaterials: 'Aparência Externa: Edifício robusto de dois pavimentos em enxaimel com fundação sólida de blocos de granito lavrado. Possui um amplo pátio de treinamento cercado de muretas e vigas de ferro. Aparência Interna: Piso de lajotas de pedra limpas, arsenal bem catalogado com suportes cheios de alabardas e espadas limpas, celas de custódia provisórias com grades reforçadas e mesa de plantão impecável.',
    config: {
      width: 0.8,
      length: 0.9,
      height: 0.58,
      roofType: 'gabled',
      roofHeight: 0.52,
      roofOverhang: 0.12,
      wallColor: '#cbd5e1', // Grained plaster
      roofColor: '#991b1b', // Command red tiles
      doorColor: '#451a03', // Solid oak with iron band
      windowGlowColor: '#fde047', // Organized yellow lanterns
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.35,
      hasPorch: true,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'prison-jail',
    name: 'O Calabouço de Ferro',
    category: 'Governo e Segurança',
    type: 'Prisão/Masmorras',
    variation: 'Cadeia Municipal',
    architectureMaterials: 'Aparência Externa: Construção atarracada de alvenaria pesada de xisto cinza-escuro e argamassa de cal. As poucas e altas aberturas de ventilação ostentam pesadas grades de ferro enferrujado e corroído pela umidade. Aparência Interna: Corredores úmidos gotejantes de água salobra, celas com portas de ferro batido maciço e trancas triplas. Grilhões chumbados nas paredes de pedra fria e colchões de palha mofada no chão.',
    config: {
      width: 0.72,
      length: 0.72,
      height: 0.5,
      roofType: 'flat',
      roofHeight: 0.08,
      roofOverhang: 0.02,
      wallColor: '#334155', // Wet dark slate
      roofColor: '#1e293b', // Iron grey flat slab
      doorColor: '#020617', // Rusted black iron
      windowGlowColor: '#78350f', // Very dim amber torchlight
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'prison-mage',
    name: 'A Agulha de Antimagia',
    category: 'Governo e Segurança',
    type: 'Prisão/Masmorras',
    variation: 'Prisão de Alta Segurança para Magos',
    architectureMaterials: 'Aparência Externa: Uma agulha monolítica impossível de obsidiana polida imbuída com chumbo rúnico e traçados metálicos prateados. Não possui portas físicas ou janelas na parte externa, sendo vigiada por gárgulas. Aparência Interna: Celas hexagonais revestidas de placas de ferro-frio que drenam fluxo de mana, iluminadas por cristais emissores de luz espectral pálida. Barreiras rúnicas flutuam nas passagens.',
    config: {
      width: 0.55,
      length: 0.55,
      height: 1.1,
      roofType: 'spire',
      roofHeight: 0.9,
      roofOverhang: 0.04,
      wallColor: '#030712', // Obsidian black-purple
      roofColor: '#312e81', // Runed indigo spire
      doorColor: '#4f46e5', // Shimmering forcefield doorway
      windowGlowColor: '#06b6d4', // Eerie cyan antimagic light
      windowCount: 2,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'wizard'
    }
  },

  // --- RELIGIÃO E MAGIA ---
  {
    id: 'temple-war',
    name: 'O Templo de Helm, o Vigilante',
    category: 'Religião e Magia',
    type: 'Templo/Catedral',
    variation: 'Templo do Deus da Guerra (austero)',
    architectureMaterials: 'Aparência Externa: Estrutura quadrangular de blocos ciclópeos de granito cinza áspero. Duas estátuas monumentais de guerreiros de bronze empunhando espadas de duas mãos guardam a grande porta de ferro. Aparência Interna: Um salão solene desprovido de adornos fúteis, contendo colunas brutas de basalto. O altar central de granito exibe armas históricas consagradas e brasões de ordens de cavalaria.',
    config: {
      width: 0.85,
      length: 0.85,
      height: 0.75,
      roofType: 'cone',
      roofHeight: 0.45,
      roofOverhang: 0.05,
      wallColor: '#4b5563', // Brutalist dark grey
      roofColor: '#111827', // Bronze-sheened dark shingles
      doorColor: '#1f2937', // Heavy black iron
      windowGlowColor: '#ea580c', // Bright orange eternal brazier
      windowCount: 2,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'temple-light',
    name: 'A Catedral do Sol Invictus',
    category: 'Religião e Magia',
    type: 'Templo/Catedral',
    variation: 'Catedral do Deus da Luz (grandiosa, cheia de vitrais)',
    architectureMaterials: 'Aparência Externa: Obra-prima gótica com agulhas esguias, arcobotantes elegantes de calcário creme e contrafortes esculpidos. Rosáceas monumentais de vidro soprado colorido cobrem os frontões. Aparência Interna: Nave central altíssima que canaliza raios multicoloridos através dos vitrais, piso de mármore polido imaculado, altar dourado e teto decorado com afrescos divinos e anjos.',
    config: {
      width: 0.88,
      length: 0.95,
      height: 0.9,
      roofType: 'spire',
      roofHeight: 0.95,
      roofOverhang: 0.15,
      wallColor: '#f1f5f9', // Divine white limestone
      roofColor: '#eab308', // Gilded golden-yellow spires
      doorColor: '#fbbf24', // Golden master door
      windowGlowColor: '#fbbf24', // Vibrant golden-white light
      windowCount: 4,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'wizard'
    }
  },
  {
    id: 'shrine-street',
    name: 'Oratório das Lágrimas de Selûne',
    category: 'Religião e Magia',
    type: 'Santuário Menor/Altar',
    variation: 'Altar de rua',
    architectureMaterials: 'Aparência Externa: Pequeno nicho graciosamente esculpido em um contraforte de pedra de esquina urbana. É protegido por uma pequena cobertura em arco de metal decorado com motivos lunares. Aparência Interna: Estatueta detalhada de alabastro da deusa Selûne, cercada por dezenas de velas de cera de abelha, moedas de bronze deixadas por viajantes piedosos e flores silvestres frescas.',
    config: {
      width: 0.45,
      length: 0.45,
      height: 0.38,
      roofType: 'cone',
      roofHeight: 0.3,
      roofOverhang: 0.08,
      wallColor: '#94a3b8', // Silver-grey stone
      roofColor: '#1e293b', // Deep silver-slate roof
      doorColor: '#64748b', // Iron grill gate
      windowGlowColor: '#38bdf8', // Pale blue candle light
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'shrine-forest',
    name: 'O Bosque Sagrado de Silvanus',
    category: 'Religião e Magia',
    type: 'Santuário Menor/Altar',
    variation: 'Santuário oculto na floresta urbana',
    architectureMaterials: 'Aparência Externa: Um altar místico formado por pedras megalíticas ásperas erguidas em círculo sob as copas dos carvalhos. Heras rústicas e musgos rasteiros recobrem os megálitos. Aparência Interna: No centro, uma bacia de pedra de rio esculpida com água cristalina sempre calma. Oferendas de sementes, espigas de trigo e cinzas de ervas rituais perfumam o pequeno solo coberto de folhas secas.',
    config: {
      width: 0.5,
      length: 0.5,
      height: 0.32,
      roofType: 'flat',
      roofHeight: 0.06,
      roofOverhang: 0.2,
      wallColor: '#475569', // Granite grey megalith
      roofColor: '#16a34a', // Grass/moss turf flat top
      doorColor: '#78350f', // Hollow log entrance
      windowGlowColor: '#4ade80', // Emerald glowing forest light
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'mage-tower-hermit',
    name: 'A Agulha do Vórtice Astral',
    category: 'Religião e Magia',
    type: 'Torre de Mago/Guilda Arcana',
    variation: 'Torre Isolada de um Mago Eremita',
    architectureMaterials: 'Aparência Externa: Torre sinuosa e verticalmente alongada construída em ardósia negra-azulada. Telhado em espiral pontiagudo ornamentado com esferas de bronze e runas gravadas que brilham na névoa. Aparência Interna: Uma escada espiral infinita contornando prateleiras repletas de livros flutuantes e pergaminhos soltos, com um observatório sob o teto cônico contendo telescópios e astrolábios de latão.',
    config: {
      width: 0.52,
      length: 0.52,
      height: 1.2,
      roofType: 'spire',
      roofHeight: 0.85,
      roofOverhang: 0.12,
      wallColor: '#312e81', // Indigo mage stone
      roofColor: '#1e1b4b', // Midnight purple spire
      doorColor: '#fbbf24', // Gilded magic glyph door
      windowGlowColor: '#a855f7', // Arcane purple glow
      windowCount: 2,
      hasChimney: true,
      chimneyHeight: 0.4,
      hasPorch: false,
      stylePreset: 'wizard'
    }
  },
  {
    id: 'mage-tower-college',
    name: 'O Colégio de Magia de Oakhaven',
    category: 'Religião e Magia',
    type: 'Torre de Mago/Guilda Arcana',
    variation: 'Academia de Magia Organizada',
    architectureMaterials: 'Aparência Externa: Edifício monumental de arquitetura renascentista com amplos pátios formados por arcos de arenito dourado, telhado de ardósia nobre e torre octogonal imponente. Aparência Interna: Biblioteca com estantes de mogno de três andares acessadas por escadas móveis, teto pintado com o mapa estelar mecânico que se move de acordo com as estações do ano.',
    config: {
      width: 0.88,
      length: 0.88,
      height: 0.8,
      roofType: 'cone',
      roofHeight: 0.65,
      roofOverhang: 0.14,
      wallColor: '#ca8a04', // Gilded ochre sandstone
      roofColor: '#4f46e5', // Deep cobalt sapphire roof
      doorColor: '#1e293b', // Dark ironwood
      windowGlowColor: '#06b6d4', // Bright cyan mana crystal light
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.45,
      hasPorch: true,
      stylePreset: 'castle'
    }
  },
  {
    id: 'cemetery-noble',
    name: 'O Mausoléu das Dinastias Silenciosas',
    category: 'Religião e Magia',
    type: 'Cemitério/Catacumbas',
    variation: 'Cemitério Nobre (mausoléus)',
    architectureMaterials: 'Aparência Externa: Capela funerária de proporções góticas feita de mármore cinzento polido com estátuas de gárgulas vigilantes. Portão duplo em treliça artística de ferro fundido escuro. Aparência Interna: Sarcófagos esculpidos em alabastro com efígies de cavaleiros e damas medievais em oração perpétua. Luz mortiça penetra através de frestas finas das paredes cinzentas.',
    config: {
      width: 0.65,
      length: 0.75,
      height: 0.55,
      roofType: 'cone',
      roofHeight: 0.42,
      roofOverhang: 0.04,
      wallColor: '#64748b', // Cold slate marble
      roofColor: '#334155', // Charcoal weathered grey
      doorColor: '#0f172a', // Wrought iron gate
      windowGlowColor: '#e2e8f0', // Pale ghostly blue-grey shine
      windowCount: 2,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'cemetery-slum',
    name: 'O Poço dos Esquecidos',
    category: 'Religião e Magia',
    type: 'Cemitério/Catacumbas',
    variation: 'Valas Comuns do Baixo Ventre',
    architectureMaterials: 'Aparência Externa: Terreno cercado por muros desmoronados de pedra seca sem argamassa. Cruzes de madeira podre tortas e covas coletivas delimitadas por cal branca e terra remexida. Aparência Interna: Sob o solo rústico, as catacumbas consistem em túneis de terra escorados por vigas fracas, com ossuários abarrotados, poeira fúnebre, teias de aranha e cheiro constante de mofo e terra batida.',
    config: {
      width: 0.55,
      length: 0.55,
      height: 0.35,
      roofType: 'flat',
      roofHeight: 0.05,
      roofOverhang: 0.02,
      wallColor: '#52525b', // Grim zinc stone
      roofColor: '#27272a', // Ash black flat dirt
      doorColor: '#451a03', // Broken wood door
      windowGlowColor: '#b45309', // Dim amber lantern of diggers
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },

  // --- RESIDENCIAL E SOCIAL ---
  {
    id: 'res-mansion-fort',
    name: 'Solar dos Valerius',
    category: 'Residencial e Social',
    type: 'Mansão/Distrito Nobre',
    variation: 'Mansão Fortificada',
    architectureMaterials: 'Aparência Externa: Propriedade fortificada cercada por muralha ameada de pedra aparelhada. Fachada suntuosa de tijolos vermelhos nobres, janelas estreitas com molduras de ferro reforçado e portão de carvalho com brasão. Aparência Interna: Hall de entrada amplo com piso de granito polido, escadaria de carvalho escuro, lareira de mármore e paredes adornadas com retratos a óleo de ancestrais da dinastia.',
    config: {
      width: 0.88,
      length: 0.88,
      height: 0.72,
      roofType: 'gabled',
      roofHeight: 0.5,
      roofOverhang: 0.15,
      wallColor: '#b91c1c', // Royal brick red
      roofColor: '#334155', // Strong slate roof
      doorColor: '#451a03', // Noble dark oak with iron emblem
      windowGlowColor: '#fbbf24', // Warm candlelite glow
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.4,
      hasPorch: true,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'res-mansion-magic',
    name: 'Mansão das Linhas de Ley',
    category: 'Residencial e Social',
    type: 'Mansão/Distrito Nobre',
    variation: 'Propriedade com Jardins Mágicos',
    architectureMaterials: 'Aparência Externa: Mansão no estilo elfo-vitoriano com curvas suaves esculpidas em alabastro puro e treliças de latão reluzente. Varandas suspensas sustentam floreiras de botões cintilantes. Aparência Interna: Paredes de quartzo rosa translúcido que emitem calor radiante e harmonizam o ambiente, fontes internas de água mágica levitante que borbulham suavemente sob a luz translúcida.',
    config: {
      width: 0.8,
      length: 0.8,
      height: 0.78,
      roofType: 'cone',
      roofHeight: 0.65,
      roofOverhang: 0.2,
      wallColor: '#e2e8f0', // Pearlescent alabaster
      roofColor: '#ec4899', // Pink blossom tiles
      doorColor: '#f59e0b', // Gilded amber wood
      windowGlowColor: '#38bdf8', // Magic neon sky glow
      windowCount: 3,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'modern'
    }
  },
  {
    id: 'res-house-wood',
    name: 'A Residência do Marceneiro',
    category: 'Residencial e Social',
    type: 'Casa Comum (Artesãos/Classe Média)',
    variation: 'Casa de Madeira',
    architectureMaterials: 'Aparência Externa: Estrutura em enxaimel tradicional com painéis de carvalho encerado e junções de pinho rústico. Floreiras coloridas ornamentam as janelas com cortinas de linho claro. Aparência Interna: Sala acolhedora cheia de serragem fina aromática de pinho, ferramentas manuais meticulosamente organizadas na bancada, fogão de ferro fundido para aquecimento e comida.',
    config: {
      width: 0.62,
      length: 0.78,
      height: 0.45,
      roofType: 'gabled',
      roofHeight: 0.42,
      roofOverhang: 0.1,
      wallColor: '#d97706', // Warm pine wood orange-brown
      roofColor: '#451a03', // Cedar shingles
      doorColor: '#78350f', // Polished door
      windowGlowColor: '#fef08a', // Soft hearth yellow
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.25,
      hasPorch: false,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'res-house-mason',
    name: 'A Casa dos Tecelões',
    category: 'Residencial e Social',
    type: 'Casa Comum (Artesãos/Classe Média)',
    variation: 'Sobrado de Alvenaria',
    architectureMaterials: 'Aparência Externa: Sobrado sólido de dois pavimentos erguido em tijolos avermelhados de barro cozido com cal. Telhado simétrico de telhas rústicas vermelhas e uma lareira de tijolos visível. Aparência Interna: Chão de tijolo polido, teares mecânicos de madeira encostados perto da janela para aproveitar a luz do dia, novelos de lã colorida pendurados sob vigas de eucalipto.',
    config: {
      width: 0.7,
      length: 0.7,
      height: 0.62,
      roofType: 'cone',
      roofHeight: 0.38,
      roofOverhang: 0.08,
      wallColor: '#c2410c', // Terracotta brick
      roofColor: '#7c2d12', // Red tiles
      doorColor: '#451a03', // Solid brown
      windowGlowColor: '#fdba74', // Warm orange tallow lamp
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.3,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'slum-shack',
    name: 'O Ninho dos Retalhos',
    category: 'Residencial e Social',
    type: 'Cortiço/Favelas',
    variation: 'Barracos improvisados',
    architectureMaterials: 'Aparência Externa: Uma colagem frágil de vigas descartadas de pinho, remendos de lona impermeabilizada com graxa, placas de estanho amassadas e telhas soltas de zinco enferrujado. Aparência Interna: Espaço minúsculo com colchão de retalhos sobre caixotes de feira. Fogareiro a querosene solta cheiro acre, paredes cobertas por sacos de estopa para vedar a umidade e goteiras.',
    config: {
      width: 0.45,
      length: 0.45,
      height: 0.35,
      roofType: 'flat',
      roofHeight: 0.05,
      roofOverhang: 0.02,
      wallColor: '#78716c', // Scrap wood grey
      roofColor: '#44403c', // Rusty tin brown-black
      doorColor: '#451a03', // Piece of cloth or rotten board
      windowGlowColor: '#9a3412', // Very dim candle flame red-orange
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'slum-tenement',
    name: 'O Cortiço das Cinzas',
    category: 'Residencial e Social',
    type: 'Cortiço/Favelas',
    variation: 'Edifício arruinado e superlotado',
    architectureMaterials: 'Aparência Externa: Sobrado arruinado de três pavimentos com reboco descascado revelando tijolos estruturais quebrados. Varal de estopa esticado cruzando a fachada sob o telhado remendado. Aparência Interna: Quartos subdivididos por cortinas grossas de lona, escadarias rangentes de madeira solta, cheiro de fritura barata, umidade constante e corredores tumultuados.',
    config: {
      width: 0.72,
      length: 0.72,
      height: 0.75,
      roofType: 'flat',
      roofHeight: 0.08,
      roofOverhang: 0.04,
      wallColor: '#57534e', // Grimy dark stucco
      roofColor: '#292524', // Ash soot roof
      doorColor: '#1c1917', // Rotting broken door
      windowGlowColor: '#b45309', // Pale amber candlelite
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.25,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'guild-merchants',
    name: 'Palacete dos Mercadores do Mar',
    category: 'Residencial e Social',
    type: 'Sede de Guilda (Comercial)',
    variation: 'Guilda dos Mercadores (rica)',
    architectureMaterials: 'Aparência Externa: Mansão renascentista imponente com fachada de calcário refinado de cor creme. Grandes janelas de vidro plano ostentam molduras luxuosas de latão e bronze polido. Aparência Interna: Salão de negociações pavimentado em mármore, balcões de atendimento talhados em jacarandá imperial, quadros de caravelas adornados com molduras de ouro e cofres de aço rústicos.',
    config: {
      width: 0.85,
      length: 0.85,
      height: 0.7,
      roofType: 'gabled',
      roofHeight: 0.52,
      roofOverhang: 0.16,
      wallColor: '#cbd5e1', // Elegant light grey calc
      roofColor: '#1e293b', // Luxurious graphite grey
      doorColor: '#fbbf24', // Rich polished gold handle on mahogany
      windowGlowColor: '#eab308', // Radiant opulent golden glow
      windowCount: 4,
      hasChimney: true,
      chimneyHeight: 0.35,
      hasPorch: true,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'guild-stonemasons',
    name: 'A Guilda dos Cinzeladores de Rocha',
    category: 'Residencial e Social',
    type: 'Sede de Guilda (Comercial)',
    variation: 'Guilda dos Pedreiros',
    architectureMaterials: 'Aparência Externa: Sede no estilo românico erguida com pedras de junta-seca imensas perfeitamente lapidadas pelos próprios membros. Um portal de arco triunfal maciço ostenta cinzéis gravados. Aparência Interna: Salão com pilares poligonais maciços de granito esculpido, maquetes em blocos de gesso de grandes catedrais e castelos dispostos em bancadas de ardósia cinza.',
    config: {
      width: 0.82,
      length: 0.82,
      height: 0.65,
      roofType: 'cone',
      roofHeight: 0.4,
      roofOverhang: 0.05,
      wallColor: '#64748b', // Highly detailed mason granite
      roofColor: '#334155', // Solid slate shingles
      doorColor: '#1e293b', // Iron reinforced stone slab door
      windowGlowColor: '#fef08a', // Warm stone furnace light
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.35,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },

  // --- SUBMUNDO E ENTRETENIMENTO ---
  {
    id: 'thieves-sewer',
    name: 'O Cofre Flutuante',
    category: 'Submundo e Entretenimento',
    type: 'Sede da Guilda dos Ladrões',
    variation: 'Esconderijo nos Esgotos',
    architectureMaterials: 'Aparência Externa: Fachada imperceptível de pedra lamosa em uma junção úmida dos esgotos. A entrada secreta é acessada girando um bloco falso de esgoto com marcas discretas de giz. Aparência Interna: Salão abobadado subterrâneo de tijolos antigos lodosos e úmidos, passarelas metálicas barulhentas suspensas sobre a água cinza escura e mesas de jogo iluminadas por tochas fracas.',
    config: {
      width: 0.58,
      length: 0.58,
      height: 0.38,
      roofType: 'flat',
      roofHeight: 0.05,
      roofOverhang: 0.02,
      wallColor: '#292524', // Muddy dark stone
      roofColor: '#1c1917', // Wet soot black flat top
      doorColor: '#1e293b', // Rusty iron trapdoor
      windowGlowColor: '#ea580c', // Eerie dim orange flame
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'thieves-bakery',
    name: 'O Forno Dourado',
    category: 'Submundo e Entretenimento',
    type: 'Sede da Guilda dos Ladrões',
    variation: 'Camuflada como uma Padaria',
    architectureMaterials: 'Aparência Externa: Fachada idílica de confeitaria em enxaimel com janelas limpas exbindo pães e doces de mentira, emanando aromas artificiais deliciosos de canela e açúcar. Aparência Interna: Uma loja limpa com cestos de vime e balcão de pinho. Sob o forno de tijolos maciço, há um mecanismo secreto que abre um alçapão que leva ao subsolo lotado de mapas de assaltos e joias roubadas.',
    config: {
      width: 0.65,
      length: 0.75,
      height: 0.48,
      roofType: 'gabled',
      roofHeight: 0.55,
      roofOverhang: 0.12,
      wallColor: '#fca5a5', // Charming pastel pink/wood stucco
      roofColor: '#b91c1c', // Bright red shingles
      doorColor: '#78350f', // Polished warm wood door
      windowGlowColor: '#fef08a', // Warm appetizing yellow lamp
      windowCount: 3,
      hasChimney: true,
      chimneyHeight: 0.38,
      hasPorch: false,
      stylePreset: 'nordic'
    }
  },
  {
    id: 'blackmarket-night',
    name: 'O Mercado das Sombras',
    category: 'Submundo e Entretenimento',
    type: 'Mercado Negro',
    variation: 'Bazar Móvel Noturno',
    architectureMaterials: 'Aparência Externa: Tendas precárias de veludo negro e lonas pesadas montadas com amarras portáteis de bambu e bronze escurecido. Lanternas de fenda azuladas dão um toque fantasmagórico. Aparência Interna: Mesas dobráveis repletas de mercadorias exóticas contrabandeadas, adagas de veneno cintilantes, peles de monstros proibidas e poções de origem suspeita vendidas às pressas.',
    config: {
      width: 0.68,
      length: 0.68,
      height: 0.4,
      roofType: 'cone',
      roofHeight: 0.35,
      roofOverhang: 0.08,
      wallColor: '#1c1917', // Coal black fabric walls
      roofColor: '#4f46e5', // Shimmering dark indigo roof tent
      doorColor: '#451a03', // Simple hide curtain
      windowGlowColor: '#a855f7', // Eerie purple/violet light
      windowCount: 2,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'blackmarket-auction',
    name: 'O Saguão do Véu Escarlate',
    category: 'Submundo e Entretenimento',
    type: 'Mercado Negro',
    variation: 'Leilão Clandestino de Relíquias',
    architectureMaterials: 'Aparência Externa: Fachada de sobrado residencial arruinado e abandonado de pedra calcária, com portas de carvalho trancadas por correntes oxidadas. Um segurança fica na viela lateral. Aparência Interna: Subsolo abobadado imenso com colunas de pedra crua, revestido por tapeçarias de veludo carmesim espessas para isolar o som, poltronas de couro desgastadas e um púlpito suntuoso.',
    config: {
      width: 0.78,
      length: 0.78,
      height: 0.62,
      roofType: 'flat',
      roofHeight: 0.08,
      roofOverhang: 0.05,
      wallColor: '#451a03', // Rich dark mahogany wood panels
      roofColor: '#991b1b', // Scarlet velvet top feel
      doorColor: '#0f172a', // Heavy dark metal bolt door
      windowGlowColor: '#b45309', // Low golden amber candles
      windowCount: 2,
      hasChimney: true,
      chimneyHeight: 0.28,
      hasPorch: false,
      stylePreset: 'castle'
    }
  },
  {
    id: 'arena-pit',
    name: 'O Fosso de Sangue e Poeira',
    category: 'Submundo e Entretenimento',
    type: 'Arena/Coliseu',
    variation: 'Pit de Luta de Rua',
    architectureMaterials: 'Aparência Externa: Um fosso escavado circundado por uma paliçada defensiva tosca e alta de troncos rústicos com pontas afiadas de ferro, sob uma cobertura plana gasta. Aparência Interna: Solo central de areia ensanguentada e terra batida compacta. Arquibancadas de madeira bruta de pinho escoradas de qualquer jeito, cheiro forte de suor, álcool destilado e feromônios.',
    config: {
      width: 0.9,
      length: 0.9,
      height: 0.32,
      roofType: 'flat',
      roofHeight: 0.06,
      roofOverhang: 0.05,
      wallColor: '#78350f', // Rough log barricade
      roofColor: '#292524', // Grimy canvas roof
      doorColor: '#451a03', // Raw wood gate
      windowGlowColor: '#ea580c', // Dim orange torchlight flare
      windowCount: 1,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  },
  {
    id: 'arena-coliseum',
    name: 'O Coliseu Imperial de Sol',
    category: 'Submundo e Entretenimento',
    type: 'Arena/Coliseu',
    variation: 'Grande Anfiteatro Real',
    architectureMaterials: 'Aparência Externa: Monumental arena elíptica de arquitetura clássica romana em mármore polido e travertino. Arcos monumentais triplos ostentam estátuas de combatentes lendários. Aparência Interna: Arena de areia fina clara, cercada por fosso de proteção profundo e arquibancadas de mármore branco em degraus perfeitamente alinhados, coroado pelo camarote imperial folheado a ouro.',
    config: {
      width: 0.95,
      length: 0.95,
      height: 0.65,
      roofType: 'cone',
      roofHeight: 0.2,
      roofOverhang: 0.1,
      wallColor: '#cbd5e1', // Polished white travertin
      roofColor: '#ca8a04', // Gilded fabric velarium golden ring
      doorColor: '#78350f', // Massive cedar gates
      windowGlowColor: '#fbbf24', // Sparkling royal braziers
      windowCount: 4,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'modern'
    }
  },
  {
    id: 'casino-luxury',
    name: 'O Palácio da Fortuna',
    category: 'Submundo e Entretenimento',
    type: 'Casa de Jogos/Bordel',
    variation: 'Cassino de Luxo',
    architectureMaterials: 'Aparência Externa: Prédio luxuoso com fachada suntuosa em mármore nero e lambris dourados. Ostenta um terraço de lazer privativo no topo e uma entrada imensa de carvalho. Aparência Interna: Salão suntuoso com painéis de mogno envernizado brilhante, mesas de jogo revestidas de feltro verde imperial sob a luz difusa de lustres luxuosos de bronze e ouro.',
    config: {
      width: 0.85,
      length: 0.85,
      height: 0.72,
      roofType: 'flat',
      roofHeight: 0.1,
      roofOverhang: 0.14,
      wallColor: '#0f172a', // Obsidian dark marble
      roofColor: '#fbbf24', // Golden brass deck linings
      doorColor: '#ca8a04', // Polished heavy brass-plated double door
      windowGlowColor: '#38bdf8', // Emerald-cyan brilliant glass glow
      windowCount: 4,
      hasChimney: false,
      chimneyHeight: 0.1,
      hasPorch: true,
      stylePreset: 'modern'
    }
  },
  {
    id: 'casino-dirty',
    name: 'O Covil do Dado Viciado',
    category: 'Submundo e Entretenimento',
    type: 'Casa de Jogos/Bordel',
    variation: 'Antro de Apostas Sujo',
    architectureMaterials: 'Aparência Externa: Porão de taverna decrépito de tijolo escurecido e vigas expostas úmidas. A entrada na ruela escura é indicada apenas por um lampião vermelho engordurado de sebo. Aparência Interna: Teto muito baixo com vigas enegrecidas pela fumaça de cachimbos vulgares, poeira, mesas manchadas de cerveja azeda, serragem espalhada no chão de argila úmida.',
    config: {
      width: 0.55,
      length: 0.55,
      height: 0.4,
      roofType: 'cone',
      roofHeight: 0.3,
      roofOverhang: 0.05,
      wallColor: '#451a03', // Damp rotten timber
      roofColor: '#1c1917', // Grimy soot shingles
      doorColor: '#292524', // Shabby planks
      windowGlowColor: '#b91c1c', // Crimson red oil lamp glow
      windowCount: 1,
      hasChimney: true,
      chimneyHeight: 0.22,
      hasPorch: false,
      stylePreset: 'cabin'
    }
  }
];
