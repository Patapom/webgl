# Introduction

Je vais écrire toute cette section en français car *1)* j'ai besoin de renouer avec cette langue et *2)* il est impératif que je sois le plus clair possible, ce que je ne peux faire que dans ma langue natale.
(Et aussi *3)*, je suis à peu près persuadé que le français est une langue bien plus intéressante et précise pour entraîner un apprentissage sémantique, même si on part avec un handicap puisque les datasets existants sont souvent en anglais)

A l'heure où j'écris ces lignes, j'ai totalement perdu l'habitude d'écrire en français et je suis dans un état d'épuisement mental assez conséquent dû aux suites d'un burn out sévère en 2016 dont je ne me suis jamais totalement remis,
 le tout doublé d'une privation de sommeil et d'un accaparement constant d'attention et d'énergie apparemment assez typiques de la condition de papa d'un jeune enfant! :sweat_smile:

## Intelligence Artificielle

On va donc parler d'intelligence artificielle (IA) mais pas seulement !
Mon approche de l'IA est hybride : à la fois curieux des progrès en Machine Learning (ML) de ces dernières années grâce au deep learning tout en restant très critique vis-à-vis de cette technique;
 je continue de m'intéresser de près à tout ce qui touche aux *neurosciences*, à la *psychologie* et à la *philosophie*.

Dans cette section de blog, on va discuter de mon approche sur le sujet qui transparaîtra, je l'espère, à travers diverses notes.

### Pas besoin d'intelligence

Déjà, contrairement à la majorité des gens dans le domaine de l'IA, je ne m'intéresse pas du tout à l'aspect *intelligence* lui-même : mon but est essentiellement de constituer une base de données sémantique capable de "raisonner"
 de manière probabiliste (approche bayésienne) en choisissant les options les plus probables, ce qu'on fera en se basant à la fois sur les nombreux exemples collectés (à la manière de l'approche ML actuelle)
 et à la fois sur un **sens commun** qu'on aura miraculeusement réussi à faire "apprendre" à notre database (DB).

Je veux que cette database soit capable d'extraire la sémantique des textes, audios et vidéos qu'on lui aura fait ingurgiter, de manière à :

1. être capable de synthétiser l'essence sémantique des documents, et
2. répondre à des queries en exploitant les relations sémantiques entre les documents.

En gros, je veux faire un moteur de recherche entièrement sémantique, mais il n'y a aucune notion "d'**agency**" là-dedans.

### Une note concernant l'agency

Ce que j'entends par "agency" c'est le fait de créer un *agent* qu'on va doter d'une volonté, de besoins, d'un moteur de raisonnement, et qu'on va (probablement) tenter d'immerger dans le monde réel (robots) ou un monde virtuel (cf. ma note sur l'[Embodied Cognition](../EmbodiedCognition)).

Pour moi, l'agency est quelque chose d'accessoire, de pas du tout fondamental. J'ai d'ailleurs du mal à voir un intérêt à donner une quelconque volonté à mon système (même si j'ai quelques idées sur la façon de procéder) hormis
 pour en faire un gadget amusant comme on en voit dans de nombreuses séries de SF.
J'ai l'impression que commencer par créer un robot c'est simplement mettre la charrue avant les boeufs.

De même, j'ai très peu d'intérêt pour les questions de **raisonnement** logique tels que l'induction, la déduction ou l'analogie.<br>
Beaucoup de chercheurs partent de l'hypothèse que c'est la clé de l'intelligence, c'est probablement
  en partie vrai mais sans mémoire au préalable, aucun raisonnement logique n'est valable/possible. Encore une fois, c'est quelque chose qu'on pourra envisager par la suite mais ça n'est pas du tout ma priorité.

Il est, à mon avis, non essentiel de développer une agency ou un moteur de raisonnement pour créer ce que je cherche à créer : une mémoire sémantique !

Un algorithme relativement simple de [groupement et d'optimisation des **concepts**](../Apprentissage) entre eux devrait suffire.


## Plan d'ensemble

On va donc détailler les points suivants :

* Approche connexionniste
	* [Les inconvénients d'une structure fixe](../ArchitectureFixe)
	* Le besoin d'une structure "molle" et plastique
	* Vers une informatique tolérante à l'erreur
* La mémoire définit l'être
	* Pourquoi il faut commencer par cerner comment créer la mémoire avant tout autre chose!
	* Les implications sur la possibilité "d'uploader sa conscience dans la machine"
* Les concepts comme clé de voute de la mémoire et de la connaissance
	* Les concepts "statiques" (noms)
	* L'articulation des concepts "dynamiques" (verbes)
	* [L'apprentissage de nouveaux concepts (grouping / optimizing)](../Apprentissage)
* La notion de "sens commun"
	* [Le besoin d'embodied cognition afin d'expérimenter pleinement le sens commun lié aux phénomènes physiques](../EmbodiedCognition)
	* Les limites de l'embodied cognition: où s'arrête-t-on?
	* La nécessité d'imperfection (pas besoin d'aller jusqu'à Planck!)
	* A-t-on besoin de causalité?

* Réflexions sur la conscience
	* [L'illusion de personnalité](../IllusionPersonnalité)
* Une simple database sans volonté
	* Pas de soucis moraux ou éthiques
* La curiosité comme moteur de la volonté
	* Notamment la poursuite de la collecte d'information
	* La différence entre information et données
	* Une règle simple pour réglementer les agents et résoudre le scénarios catastrophe du fabricateur de trombones (au diable Asimov et ses lois ambigues!)



Inutile de simuler le moindre détail : on peut stick to the symbolic level ! C'est à mon sens le niveau idéal d'intervention ! (et le seuls auquel on peut intervenir de manière réaliste)

Problème ds gens qui voient tout sous le prisme unique du ML!

Plein de pipeules qui veulent résoudre tous les problèmes du monde, moi je veux simplement une database qui répond à toutes mes questions sur les connaissances humaines actuelles.

 
## Critiques du ML

Ma principale critique vis-à-vis du ML et des réseaux de neurones artificiels est, pour l'instant, leur extrême rigidité: [l'architecture du réseau est toujours figée](../ArchitectureFigée), généralement designée par un humain qui
 va ensuite lancer l'optimisation du modèle afin de maximiser/minimiser une fonction d'objectif en le nourrissant de milliers, de millions voire de milliards de données (le dataset).
Chaque fois qu'on va vouloir modifier la structure du réseau, il va falloir lui faire réapprendre tout depuis le début.
Parfois on peut prendre un modèle entraîné et l'adapter à un nouveau dataset (fine tuning), en gros on part d'un point d'équilibre dans un optimum local (ou global!) pour reprendre l'entraînement sur un nouvel
 ensemble de données afin de rendre le modèle tolérant à de nouveaux exemples qu'il n'avait pas vus auparavant.

Cela reste malgré tout un processus extrêmement lourd, qui consomme énormément de données, de temps et d'énergie et qui se révèle très peu flexible. On constate de plus assez souvent une incapacité à s'adapter
 à de nouvelles situations non rencontrées durant l'apprentisasge (out of distribution data), et ces réseaux sont capables de tâches extrêmement réduites (on parle de narrow AI), même s'il on peut difficilement
 considérer la maîtrise du langage par certains modèles comme étant une tâche réduite.

### Illusion de personnalité

Je ne crois pas non plus à l'émergence de la conscience ou de la "sentience" simplement en continuant d'augmenter le nombre de paramètres des modèles de neural networks actuels,
 même si certains commencent à sérieusement se poser la question au vu des derniers progrès des Large Language Models (LLM) comme GPT-3 ou Lambda.
Mon opinion sur le sujet est simplement que ces modèles sont entraînés sur de gigantesques corpus de texte mettant en scène des interactions entre humains, dans des situations réelles et crédibles,
 il en ressort évidemment **forcément** des choses qui peuvent amener à penser qu'on a affaire à une vraie personne, dans une situation réelle et crédble.

Pourtant, il ne s'agit ni plus ni moins ici qu'une illusion de personnalité:
 la machine recrée simplement une conversation plausible, dans laquelle on trouve généralement des indices du fait qu'il s'agit là uniquement d'une simulation; c'est le cas par exemple quand la machine répond
 sans sourciller qu'elle prend beaucoup de plaisir quand elle est entourée de ses amis et de sa famille :expressionless:. Elle joue la comédie et endosse le rôle d'un être un humain! Et c'est apparemment très convaincant!

On notera que ce genre de "tromperie" a déjà été employée par le passé pour faire passer le Turing test à plusieurs chat bots, notamment celui qui simulait le fait d'être un gamin de 13 ans pour excuser
 le fait qu'il répondait souvent n'importe quoi aux questions qu'on lui posait... (??? source)

On reconnaît donc là un jeu d'acteur, un peu à la manière dont les psychopathes simulent les émotions humaines afin de se faire passer (souvent avec succès) pour d'authentiques être humains animés de sentiments.


## Concentration sur le langage et la manipulation de symboles

C'est ma conviction profonde que le langage et la manipulation de symboles/concepts sont la clé de l'intelligence humaine.

Le langage, tout particulièrement, est notre façon typiquement humaine de véhiculer nos idées. Le sens des mots peut **généralement** être directement lié à un *concept*, et les concepts sont les éléments
clés sur lesquels est articulée l'intégralité de notre être.

Par la suite, dans ce blog, on ne parlera pas des mots sans distinguer le fait qu'ils n'ont qu'un seul *sens*, et à chaque *sens* on associera un seul et unique *concept*.
Les 2 mots, sens et concept, sont les 2 faces d'une seule et même pièce.

Même quand un mot est polysémantique, ou quand on rencontre des homonymes, je voudrai toujours parler d'un seul sens particulier, de manière totalement non-ambiguë!
(c'est d'ailleurs une autre critique que je ferais volontiers aux language models actuels: il semblerait qu'lis ne fassent absolument pas de distinction sémantique entre les homonymes! Cf. [ma critique sur Word2Vec](../ProblèmeWord2Vec))

### Les symboles dans le règne animal

Il est très probable que de nombreuses espèces animales évoluées savent maîtriser les symboles et réfléchissent de manière symbolique pour représenter les choses auxquelles elles sont confrontées au quotidien:
 nourriture, proie, prédateur, troupeau, le temps qu'il fait, de vagues notions de distance et de quantité, etc. mais seuls les humains, à notre connaissance,
 ont appris à se baser sur ces symboles afin de [construire des concepts plus complexes](../GroupementConcepts) et surtout, ont accolé un langage pour exprimer ces concepts, ainsi qu'une langue pour communiquer
 ces concepts avec leurs congénères.

### Le langage comme outil pour articuler les symboles et les concepts

J'aimerais faire la distinction entre le langage signifiant et la langue parlée: le langage donne des règles pour articuler les concepts entre eux, il est (probablement) universel dans sa construction, tandis que la langue
 est une façon bien particulière d'exprimer le langage, elle possède son vocabulaire et ses règles propres qui changent d'une peuplade ou d'une région à l'autre.

Un exemple d'utilisation du langage sémantique universel:

	<un homme> <fait une action> <sur un objet>

Peu importe la façon dont on encode &lt;un homme&gt;, l'&lt;action&gt; ou l'&lt;objet&gt; dans une langue ou une autre, il est même probable qu'ils existe des langues qui n'ont aucune représentation exacte pour l'un ou 
 l'autre des termes de cette phrase (par manque de vocabulaire, ou même manque du concept), il est toujours possible de décrire l'homme, l'action qui est faite et l'objet en présence.
Au pire en employant une longue et difficile périphrase.

