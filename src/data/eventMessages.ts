/**
 * Phrases de résultat par option et par issue. Contenu à ajuster librement
 * — la mécanique (effets, probabilités) ne dépend pas de ce texte.
 */

export interface MessagesOption {
  reussiteCritique?: string;
  reussite?: string;
  echec?: string;
  echecCritique?: string;
  /** Options déterministes : un seul message, toujours utilisé. */
  resultat?: string;
}

export const MESSAGES_OPTIONS: Record<string, MessagesOption> = {
  "champ-asteroides-contourner": {
    reussiteCritique: "Le pilotage est d'une précision chirurgicale : pas une éraflure, pas une goutte de sueur.",
    reussite: "Le champ d'astéroïdes est contourné sans encombre, au prix d'un peu de carburant.",
    echec: "La manœuvre est plus tendue que prévu — l'équipage encaisse le stress, le moral en pâtit.",
    echecCritique: "Le vaisseau frôle la collision à plusieurs reprises ; l'équipage sort de la manœuvre les nerfs à vif.",
  },
  "champ-asteroides-foncer": {
    reussiteCritique: "Un passage en force spectaculaire — l'équipage hurle de joie, le pilote entre dans la légende.",
    reussite: "Le vaisseau fonce à travers le champ et s'en sort, secoué mais entier.",
    echec: "Le vaisseau encaisse plusieurs impacts en traversant le champ à pleine vitesse.",
    echecCritique: "La coque prend de plein fouet une pluie de débris — les dégâts sont sévères.",
  },
  "epave-derivante-demonter": {
    reussiteCritique: "Le démontage est un modèle du genre : chaque pièce de valeur est récupérée sans perte.",
    reussite: "Les pièces de valeur sont démontées et stockées dans la soute.",
    echec: "Le démontage tourne au bricolage laborieux — l'équipe technique en ressort frustrée.",
    echecCritique: "Une pièce mal détachée endommage l'équipement de bord ; l'équipe technique perd toute confiance dans la manœuvre.",
  },
  "epave-derivante-fouiller": {
    reussiteCritique: "Les registres livrent bien plus que prévu — une vraie mine d'informations et de crédits.",
    reussite: "Les registres de l'épave sont récupérés, avec quelques crédits au passage.",
    echec: "La fouille déclenche un mécanisme résiduel : l'épave se désagrège en partie contre la coque.",
    echecCritique: "L'autodestruction de l'épave se déclenche en pleine fouille — la coque encaisse l'onde de choc.",
  },
  "epave-derivante-ignorer": {
    resultat: "L'épave est laissée à la dérive, sans un regard en arrière.",
  },
  "fuite-mineure-reparer": {
    reussiteCritique: "La réparation est un travail d'orfèvre — la coque n'a jamais été aussi saine.",
    reussite: "La fuite est colmatée dans les règles de l'art.",
    echec: "La réparation ne tient qu'à moitié — la coque reste fragilisée malgré les efforts.",
    echecCritique: "La réparation tourne mal et aggrave la fuite avant qu'elle ne soit maîtrisée.",
  },
  "fuite-mineure-colmater": {
    reussiteCritique: "Le rafistolage improvisé tient bien mieux que prévu.",
    reussite: "La fuite est colmatée à la va-vite, mais elle tient.",
    echec: "Le colmatage cède presque aussitôt — la fuite continue de ronger la coque.",
    echecCritique: "Le rafistolage explose en pleine réparation, aggravant la fuite et sapant la confiance de l'équipe technique.",
  },
  "chantier-naval-reparation-minutieuse": {
    reussiteCritique: "L'équipe improvisée fait des miracles : la coque ressort du chantier comme neuve.",
    reussite: "La réparation minutieuse redonne à la coque une bonne partie de son intégrité.",
    echec: "La réparation ne tient qu'à moitié — une partie du matériel est gâchée dans l'opération.",
    echecCritique: "Le chantier se révèle piégé : les outils lâchent en pleine réparation, gâchant du matériel et compliquant la manœuvre.",
  },
  "chantier-naval-reparation-sommaire": {
    reussiteCritique: "Le bricolage tient mieux que prévu, presque du travail de professionnel.",
    reussite: "Un bricolage rapide, mais qui tient la route.",
    echec: "Le bricolage ne prend pas correctement — la coque reste dans le même état.",
    echecCritique: "Le bricolage échoue complètement — le temps et l'argent investis n'auront servi à rien.",
  },
  "chantier-naval-passer": {
    resultat: "Le chantier abandonné est laissé derrière, sans qu'on y touche.",
  },
  "station-ravitaillement-negocier": {
    reussiteCritique: "Le plein est fait à un tarif dérisoire, avec le sourire du gérant en prime.",
    reussite: "Le plein est fait au prix négocié.",
    echec: "La négociation échoue : le crédit est débité, mais le réservoir reste désespérément vide.",
    echecCritique: "Le gérant profite de la situation pour blacklister le vaisseau — aucune goutte de carburant, argent perdu.",
  },
  "station-ravitaillement-passer": {
    resultat: "Le vaisseau passe son chemin sans s'arrêter à la station.",
  },
  "patrouille-pirate-combattre": {
    reussiteCritique: "L'affrontement tourne à la démonstration de force — les pirates détalent, la réputation du vaisseau explose.",
    reussite: "Le combat est remporté sans trop de casse.",
    echec: "Le combat tourne mal : la coque encaisse les tirs et la réputation en prend un coup.",
    echecCritique: "La patrouille prend l'ascendant total — la coque est ravagée et la réputation du vaisseau s'effondre.",
  },
  "patrouille-pirate-payer": {
    reussiteCritique: "Le péage est négocié avec un tel aplomb que les pirates en restent presque admiratifs.",
    reussite: "Le péage est payé, la patrouille laisse passer le vaisseau.",
    echec: "Les pillards flairent la faiblesse et exigent une rançon supplémentaire avant de laisser passer.",
    echecCritique: "Les pillards vident purement et simplement les soutes avant de laisser filer le vaisseau.",
  },
  "patrouille-pirate-fuir": {
    reussiteCritique: "La fuite est un modèle de pilotage — la patrouille disparaît du radar en quelques secondes.",
    reussite: "Le vaisseau distance la patrouille pirate sans dommage.",
    echec: "La patrouille rattrape le vaisseau et met la main sur une partie de la cargaison.",
    echecCritique: "La patrouille rattrape le vaisseau et le dépouille méthodiquement avant de le relâcher.",
  },
  "creature-coque-repousser": {
    reussiteCritique: "La créature est repoussée d'un seul geste, sans laisser la moindre trace sur la coque.",
    reussite: "La créature finit par lâcher prise et repart dans le vide.",
    echec: "La créature s'accroche et griffe la coque avant de lâcher prise.",
    echecCritique: "La créature s'arrache violemment, emportant un morceau conséquent de la coque.",
  },
  "creature-coque-manoeuvre": {
    reussiteCritique: "La manœuvre est si brutale que la créature est éjectée sans le moindre dommage.",
    reussite: "La manœuvre brusque suffit à décrocher la créature.",
    echec: "La manœuvre secoue le vaisseau sans déloger la créature, qui s'accroche encore plus fort.",
    echecCritique: "La manœuvre échoue et la créature s'arrache en emportant une plaque entière de coque.",
  },
  "drone-guerre-detruire": {
    reussiteCritique: "Le drone est détruit en un seul tir, ses composants récupérés intacts.",
    reussite: "Le drone est détruit, ses composants récupérés.",
    echec: "Le drone riposte avant d'être détruit — la coque encaisse les tirs.",
    echecCritique: "La patrouille propriétaire du drone rapplique et se venge : la coque est sévèrement touchée.",
  },
  "drone-guerre-brouiller": {
    reussiteCritique: "Le brouillage désactive le drone en un clin d'œil — l'équipage technique jubile.",
    reussite: "Les capteurs du drone sont brouillés, le danger écarté.",
    echec: "Le brouilleur grille sous la charge — du matériel coûteux part en fumée.",
    echecCritique: "Le brouilleur explose littéralement, ruinant l'équipement et le budget du bord.",
  },
  "dispute-bord-trancher": {
    reussiteCritique: "La décision est accueillie avec un soulagement unanime — l'équipage retrouve une cohésion sans faille.",
    reussite: "Le conflit est tranché fermement, l'équipage retrouve son calme.",
    echec: "La décision est mal reçue — la tension retombe en ressentiment.",
    echecCritique: "La décision est vécue comme une injustice ; le moral de l'équipage s'effondre.",
  },
  "dispute-bord-laisser": {
    reussiteCritique: "Le conflit se résout de lui-même, presque dans la bonne humeur.",
    reussite: "Laissé sans arbitrage, le conflit finit par retomber tout seul.",
    echec: "Sans arbitrage, la dispute s'envenime et mine le moral de l'équipage.",
    echecCritique: "Le conflit dégénère largement, laissant un équipage à cran et démoralisé.",
  },
  "fatigue-accumulee-repos": {
    resultat: "Le vaisseau dérive un moment sans but précis, le temps que l'équipage souffle un peu.",
  },
  "fatigue-accumulee-continuer": {
    reussiteCritique: "L'équipage puise dans ses réserves et ressort de l'épreuve plus soudé que jamais.",
    reussite: "L'effort commun paie : la cohésion de l'équipage s'en trouve renforcée.",
    echec: "La fatigue finit par peser sur les nerfs — le moral de l'équipage en pâtit.",
    echecCritique: "L'épuisement fait craquer l'équipage ; le moral chute lourdement.",
  },
  "signal-detresse-porter-secours": {
    reussiteCritique: "Le sauvetage est exemplaire — la réputation du vaisseau grandit dans toute la région.",
    reussite: "Le vaisseau en détresse est secouru avec succès.",
    echec: "C'était un piège : de faux naufragés, en réalité des pirates, dépouillent le vaisseau avant de disparaître.",
    echecCritique: "Le piège se referme complètement — les faux naufragés vident les soutes et siphonnent une bonne partie du carburant.",
  },
  "signal-detresse-reparer": {
    reussiteCritique: "La réparation est un chef-d'œuvre technique, largement récompensée par l'équipage secouru.",
    reussite: "Le vaisseau secouru est réparé avec succès, et généreusement récompensé.",
    echec: "La manipulation tourne mal : le vaisseau secouru explose, endommageant la coque et ternissant la réputation du bord.",
    echecCritique: "L'explosion est violente — dégâts sérieux à la coque et réputation sévèrement entachée.",
  },
  "signal-detresse-ignorer": {
    resultat: "L'appel de détresse est ignoré ; la réputation du vaisseau en pâtit légèrement.",
  },
  "marche-contrebandiers-negocier": {
    reussiteCritique: "La négociation tourne nettement à l'avantage du vaisseau — les contrebandiers cèdent bien plus que prévu.",
    reussite: "La négociation aboutit à un échange profitable.",
    echec: "Les contrebandiers prennent l'ascendant dans la négociation et repartent avec davantage que prévu.",
    echecCritique: "La négociation tourne complètement à l'avantage des contrebandiers, qui repartent avec une bonne partie du carburant en prime.",
  },
  "marche-contrebandiers-refuser": {
    reussiteCritique: "Le vaisseau s'éclipse sans le moindre accroc, laissant les contrebandiers bredouilles.",
    reussite: "Le vaisseau refuse l'échange et s'éloigne sans encombre.",
    echec: "Les contrebandiers rattrapent le vaisseau pendant la fuite et prélèvent leur dû de force.",
    echecCritique: "Les contrebandiers rattrapent le vaisseau et le pillent largement avant de le laisser filer.",
  },
};
