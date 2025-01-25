# Structure des Concepts

On va aborder ici la partie la plus importante du système, à savoir : la représentation symbolique.

On part de l'idée que l'être humain perçoit, mémorise et raisonne à l'aide de **concepts**.

On se moque de la façon dont les concepts sont stockés dans le cerveau —on a vu dans la note sur la [polysémie neuronale](PolysémieLLM.md) que les réseaux de neurones *tendaient* de toute manière vers un encodage symbolique— ici on suppose juste que les concepts existent et permettent la manipulation et le raisonnement symboliques.



Un concept peut être absolument n'importe quoi : ça peut être un objet réel ou bien une notion abstraite, une idée.
Par exemple : Un cube est un concept. Une forme géométrique est un concept. Un animal est un concept. Le goût est un concept. Une couleur est un concept. Les mathématiques sont un concept.

!!! tip " "
     Les concepts représentent l'ensemble des connaissances accessibles par le cerveau humain.



Ce qui est important ici c'est la structuration et l'assemblage de concepts : les liens qu'ils ont entre eux.

Prenons un exemple :

> Michel Dubois est un homme de 43 ans, il est grand (1m80), il travaille dans l'informatique, il est marié à Julie et ils ont 2 enfants (Lucas et Mireille). Il pratique le tir-à-l'arc sur son temps libre.



On peut facilement transposer cette description en un arbre de propriétés :

* **"Michel Dubois"**
    * Homme
    * Âge = 43 ans
    * Taille = 1m80
    * Travail = Informaticien
    * Épouse = Julie
    * Enfant = Lucas, Mireille
    * Hobby = tir-à-l'arc



On n'aura peut-être pas décrit totalement Michel (et sa passion secrète pour le Jack Daniels), mais on aura en tout cas retranscrit **exactement** l'ensemble des informations contenues dans cette description.



## Peut-on **tout** représenter de cette manière ?

La première question qu'on se pose est évidemment : est-ce qu'on peut représenter **toutes** les situations auxquelles nous sommes confrontés dans tout au long de notre existence ?

Peut-on représenter :

* Un objet réel ? Une idée philosophique ?
* Une [qualia](https://en.wikipedia.org/wiki/Qualia) ?
* Des gens ou des animaux ?
* Des personnages de fiction ?
* Des histoires imaginaires ?
* Des évènements passés ou à venir ? Le temps ?
* Des atomes ? Des planètes ? Des étoiles ? Des galaxies ?
* Une lettre, un symbole, un mot, une phrase, un texte ?
* Une action ? Un évènement ? Une séquence ?
* Une relation spatiale, temporelle ou sociale ?
* Une grandeur ? Une comparaison ? Une relation d'ordre ?
* La multitude ou la singularité ?
* Les exclusions ? Les contraires ? La négation ?
* Des états qui varient dans le temps ?
* Une image ? Un son ?



Décrits de cette manière, les concepts ont l'air trop "rigides", trop binaires pour parvenir à décrire l'ensemble des perceptions, des émotions et des expériences humaines, pourtant on va voir qu'on peut s'en servir pour décrire à peu près tout de manière <u>non ambiguë</u>.

## Un concept est unique

Pour commencer, notons qu'un concept est **unique** ! On ne parle pas de mots qui peuvent avoir des homonymes qui rendent le sens ambigu, ici les concepts **sont** le sens.

En théorie, on peut voir chaque concepts comme une définition du dictionnaire. Chaque définition est unique, tandis qu'un même mot peut avoir plusieurs définitions.

!!! note " "
    D'ailleurs, je construis mes concepts à partir des définitions d'un [dictionnaire très complet](https://usito.usherbrooke.ca/). C'est un processus itératif de va-et-vient puisque j'ai besoin des définitions des mots du dictionnaire pour le sens de mes concepts, et j'ai besoin des concepts pour comprendre le sens des mots *dans* les définitions. :grin:



## Un prototype **flou**

Un exemple unique d'objet représenté de manière conceptuelle, peut sembler binaire et "dur", en effet. On décrit *cet objet particulier*, avec ses propriétés particulières qui sont présentes ou absentes (ou ignorées et donc pas représentées). C'est généralement de cette manière qu'on procède dans une base de données classique où une entrée dans une table contient une liste de valeurs.

Mais c'est **l'ensemble des exemples** des objets de même type — qu'on appelle un **prototype**[^1] — qui vont conférer une dimension "floue" à ces propriétés qui vont revêtir différentes valeurs selon les exemples — valeurs qu'on aura du mal à qualifier de binaires ou de rigides, hormis pour les [**propriétés caractéristiques**](#proprietes-caracteristiques) de ces objets.

Prenons le cas classique des oiseaux :

![](..\images\Concepts\Prototype Oiseaux.png)



On peut imaginer ici que ces exemples ont été **perçus** et sont donc beaucoup plus complets que ça en termes de propriétés descriptives, mais disons qu'on a là un échantillon représentatif d'un ensemble d'oiseaux.

* L'ensemble des exemples représente la catégorie des **oiseaux**
    * C'est probablement un argument d'autorité qu'un tuteur nous aura donné
    * Ou bien on aura su faire le groupement nous-même grâce à [l'algorithme d'apprentissage](FondementsApprentissage.md) du fait de qualités communes entre les exemples de toutes ces choses qui volent qu'on aura aperçues pendant nos expéditions et qu'on aura décidé d'appeler "oiseaux".
* On va pouvoir faire une **moyenne** des propriétés qui caractérisent ces exemples :
    * Pour la taille :
        * On a une grande majorité d'oiseaux qui sont **petits** (les plus répandus dans nos contrées du nord)
        * Beaucoup d'oiseaux **moyens** (on pense aux toucans, aux perroquets, aux corvidés, etc.)
        * Peu d'oiseaux **grands** (on pense au condor, à l'aigle, à l'autruche, au flamant rose, aux oies, etc.)
    * Pour la couleur du bec ou des pattes :
        * Beaucoup de becs marrons ou noirs
        * Quelques becs jaunes
        * Très peu de becs d'autres couleurs
    * Pour la couleur de la robe :
        * Très variable
* On va également noter les **propriétés caractéristiques** :
    * Ils ont tous des ailes
    * Ils ont tous des plumes
    * Ils ont tous des becs
    * Ils peuvent tous voler (à de rares exceptions près, on pense à la poule, à l'autruche, aux pingouins)



### Distributions des valeurs

La distribution de la plupart des propriétés du monde réel est hautement variable, par exemple on voit ici la distribution de la longueur des ailes d'oiseaux [^2] :

<img src="..\images\Concepts\Bird Wing Span Distribution.png" style="zoom:50%;" />



#### Catégories grossières

Contrairement aux machines qui peuvent tout à fait gérer l'intégralité d'un énorme dataset de valeurs de propriétés et dresser un histogramme comme dans l'image ci-dessus, les humains se contentent en général de grouper les propriétés en catégories grossières, souvent par groupes de 2 extrêmes autour d'un groupe moyen :

* Petit, Moyen, Grand
* Faible, Moyen, Fort
* Léger, Moyen, Lourd

On a parfois besoin de distinguer davantage de catégories, alors on va plutôt utiliser 5 groupes :

* Minuscule, Petit, Moyen, Grand, Énorme



!!! question "hypothesis"
     Je pense que les humains sont dotés d'un mécanisme interne capable de déterminer plusieurs **modes** de **distributions normales (gaussiennes)**, avec la moyenne et la variance de chaque mode.<br><br>Ce ne sont bien entendu pas les caractéristiques exactes $\mathcal{N}(\mu,\sigma^2)$ comme en statistiques, mais plutôt un "ressenti". Encore une fois — comme pour l'algorithme d'apprentissage qui se base sur la quantité ou la fréquence d'activation de certains neurones ou certains concepts pour en déduire une corrélation — on va se baser sur la quantité et la fréquence d'activation des propriétés pour créer des groupes.

Par exemple, l'histogramme de distribution de la longueur des ailes d'oiseaux sera plutôt représenté sous la forme de 3 modes gaussiens comme ceci :<img src="..\images\Concepts\Bird Wing Span Normal Modes.png" style="zoom:50%;" />

On distingue donc ici 3 catégories d'oiseaux : les petits (la majorité), les moyens (moins nombreux) et les grands (les moins répandus).



#### Propriétés **caractéristiques**

Grâce à cette capacité intrinsèque du cerveau à repérer les modes de distribution des propriétés d'objets, il va être extrêmement aisé de repérer les propriétés pour lesquelles il n'y a qu'un seul mode avec une variance très réduite : ce sont les **propriétés caractéristiques** de la catégorie.

Par exemple pour les oiseaux :

* La propriété **ailes** est tout le temps présente, sa variance est donc de 0 et sa valeur moyenne est "**true**".
* Un cas presque aussi tranché implique la propriété **vole** : elle est cette fois présente 99% du temps, seules quelques exceptions existent (autruche, poule, pingouin). Il existe donc techniquement 2 modes : un mode à **true** avec un nombre extrêmement élevé d'activations, et un mode à **false** avec un tout petit nombre d'activations, qu'il est facile d'ignorer quand on imagine l'oiseau prototype.
* Mais les propriétés **couleur** et **taille** sont trop variables, ce ne sont *pas* des propriétés caractéristiques des oiseaux.



#### Optimisation

Les propriétés caractéristiques vont donc pouvoir être généralisées à tous les exemples et remonter au niveau de la catégorie : par exemple, avoir un **bec**, des **plumes**, des **ailes** et **voler** seront des propriétés qui vont remonter au niveau de la catégorie **oiseau**.

Et même si la propriété **voler** n'est pas toujours vraie, on ne stockera les exceptions qu'au niveau des exemples particuliers de la poule, l'autruche et le pingouin.

On peut ainsi "optimiser" les propriétés en ignorant les détails d'un exemple particulier pour finalement se reposer sur le prototype : seules les *propriétés saillantes* de l'exemple qui diffèrent du prototype importeront.



### Les exemples font les concepts

On a vu plus haut qu'on avait décidé de catégoriser certains animaux en tant que **oiseaux**.

On a ainsi pu regrouper plusieurs exemples d'oiseaux qui nous permettent de former un "*oiseau prototype*".

Et c'est cet *oiseau prototype* qui va représenter la catégorie **oiseaux** en retour !

!!! danger " "
    Les exemples fabriquent le prototype, le prototype classifie les nouveaux exemples, les nouveaux exemples updatent le prototype.



On pense immédiatement à l'exemple des EigenFaces[^3] qui représentent un "visage moyen" (le prototype) ainsi que plusieurs axes de propriétés caractéristiques pour créer des visages particuliers (les exemples) :

<img src="..\images\Concepts\Eigenfaces.png" style="zoom:50%;" />



#### Nearest Neighbors

En plus d'assignations "rigides" à des catégories selon des critères binaires et des règles logiques (par exemple : il a des plumes → c'est un oiseau), il est aisé d'assigner de nouveaux exemples à des catégories existantes quand les prototypes sont déjà bien formés en utilisant l'algorithme de [Nearest Neighbor](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm).

Il suffit en effet de considérer chaque propriété du nouvel exemple comme un axe d'un espace vectoriel et regarder où se situe la valeur de cette propriété par rapport aux valeurs des propriétés des prototypes pour savoir comment catégoriser le nouvel exemple.

Imaginons que nous découvrions pour la première fois l'image d'un léopard :

![](..\images\Concepts\Leopard.png)

On fait la liste de ses propriétés : c'est un animal, il marche à 4 pattes, il a le poil jaune avec des taches noires, il a une longue queue, il possède des griffes, de grandes dents, des moustaches des oreilles arrondies, une truffe triangulaire, c'est un prédateur, il est assez gros, etc.

​	Chaque propriété qu'on va "allumer" va ainsi raisonner de plus en plus avec le prototype du félin.



!!! note " "
    Encore une fois, même si ça n'est probablement une version exacte de cet algorithme qui est utilisée par notre cerveau, il y a une plausibilité biologique à l'existence d'un tel algorithme puisque, dans sa version la plus simple, il ne nécessite que l'activation d'un ensemble de propriétés qui activeront à leur tour le concept prototype au-delà d'un certain seuil (c-à-d si on coche suffisamment de critères)...



#### L'exemple le plus représentatif

On a vu comment on créait des prototypes d'objets mais cela fonctionne pour à peu près tout : nombres, mots, idées, émotions, etc.

On a également la notion d'exemple le plus représentatif : c'est typiquement l'exemple qui correspond le plus à l'image qu'on se fait d'une catégorie, et c'est généralement *l'exemple le plus proche du prototype* (qui est la moyenne de tous les exemples, rappelons-le).

En effet, pour un européen :

* L'oiseau le plus représentatif est souvent le rouge-gorge ou le moineau.
* Le fruit le plus représentatif est la pomme.
* Le nombre type chez les chercheurs sera pi.
* Quand on demande aux gens de penser à un nombre entre 1 et 10, la plupart des gens répondent 7.
* Pour les mots, on a les synonymes et les champs lexicaux dont l'exemple type est souvent le mot le plus usité du champ lexical.



!!! tip " "
    Une note amusante est que l'exemple type des papiers qui portent sur les études de prototypes et de représentation, c'est d'employer des exemples d'oiseaux. Piège dans lequel je suis tombé volontiers... :grin:



### Des prototypes pour tous les concepts ?

Il est assez probable qu'on ait autant de prototypes que de concepts :

* Il est toujours possible de créer des catégories nouvelles dont l'appartenance dépend de la présence ou l'absence d'un certain nombre de propriétés (ces propriétés sont **aussi** des concepts)
* Les groupes d'objets appartenant à ces catégories peuvent toujours être assemblés en une moyenne floue représentant l'objet prototype associé à ce concept
* La formation de ces groupes sur des critères variables est généralement très rapide et utilise les mêmes mécanismes que ceux employés pour la fonction de [mémoire associative](#memoire-associative).



On va donc pouvoir représenter la majeure partie des [exemples cités au début de l'article](#peut-on-tout-representer-de-cette-maniere) quand il s'agit de propriétés "simples", mais c'est un peu plus difficile de voir ce qui se passe dans le cas des sons, des images ou des mouvements : pourquoi a-t-on cette capacité de nous remémorer — parfaitement semble-t-il — certaines scènes qu'on a vécues ou qu'on a vues ?



## Représentation des propriétés émanant des sens

On a donc vu jusqu'ici qu'il était aisé d'assigner des propriétés artificielles aux objets comme la couleur, la taille; ou bien de classer les objets dans des catégories, artificielles elles aussi.

Qu'en est-il des objets qu'on *perçoit* par l'intermédiaire de nos sens ?

Comment parvient-on à se les remémorer comme dans de "petites scènes intérieures" ? (hormis pour les personnes souffrant d'[aphantasie](https://fr.wikipedia.org/wiki/Aphantasie))



## Tout n'est qu'illusion

Image du réseau de perception et de la construction d'une représentation interne

 ==> Toute activation de la représentation interne fait figure de réel

### L'illusion de l'image

tu sais pas dessiner.

L'image prototype est un assemblage d'exemples.

### L'illusion du son

tu sais pas chanter

### L'illusion du mouvement

tu ne conserves que quelques frames et des "intentions"

## Causes et effets



## Mémoire Associative

Highlighting de concepts => activation neuronale.

Corrélation de plusieurs activations => elicit probable results...



## Et le raisonnement dans tout ça ?



## Notation



Symbole concepts : ⬙ (0x2B19)  ou bien notation &lt; Concept &gt;.









## Notes

* Structuration des Concepts
  * Peut-on tout représenter ?
  * Peut-on comprendre de manière non ambiguë même si l'on attache les concepts n'importe comment ? Ou doit-on respecter une hiérarchie particulière ?
* Raisonnement à partir des structures de concepts
  * Comment lire une question et y répondre ?
* Cas de la négation / association d'un fait à une "histoire"
  * besoin de pouvoir inverser d'un coup le sens ou la véracité de qqchose
* Notion de quantité attachée n'importe où
* Trigger un concept ==> les bases de la recherche associative
* Couplage fort concept / image ==> lien sur le papier qui montre les zones du cerveau activées quand un concept et l'image de ce concept sont activées : ce sont les mêmes à peu de chose près...



* Plausibilité biologique
    * On sait que les neurones sont facilement excitables par des impulsions ou des patterns de fréquences particuliers [^4][^5]
    * Il est donc aisé pour le cerveau de créer des hiérarchies de neurones activés par la présence ou l'absence de certain attributs / features

La question est : comment généralise-t-on ça aux actions et aux procédures ? À la planification (réentrance, récursion) ? À la structuration hiérarchique de concepts, et pas juste à des séquences ?



#### 



* Opérations sur les concepts
    * Y a-t-il une algèbre de manipulation de concepts ?





## Algorithme d'apprentissage général

* Règles d'apprentissage générales
    * L'importance de compter les occurrences de patterns
        * La base du "fire together wire together" ?
    * Le fait que c'est un mécanisme simple à implémenter biologiquement
    * Différence par rapport à la back prop ?
* Apprentissage supervisé
    * Importance du tuteur
    * Notion de confiance
* Apprentissage non-supervisé
    * L'importance de fixer des règles
        * Des règles même simples suffisent comme base
    * Notion de certitude et étaiement de la "confiance"
        * La certitude est une notion contextuelle, elle dépend de son environnement
    * Définition de la notion de "avoir du sens" (on sent que quelque chose "clique" et s'emboîte parfaitement dans notre raisonnement : on a *compris* !)





[^1]:1973 Rosch E. ["Natural Categories"](https://www.sciencedirect.com/science/article/abs/pii/0010028573900170)
[^2]: [Dataset AVONET](https://opentraits.org/datasets/avonet.html)
[^3]:1991, Turk M. A., Pentland A. P. ["Face Recognition using EigenFaces"](https://www.mit.edu/~9.54/fall14/Classes/class10/Turk%20Pentland%20Eigenfaces.pdf)
[^4]:2024, Kirsanov A., ["How your brain chooses to remember"](https://www.youtube.com/watch?v=ceFFEmkxTLg&ab_channel=ArtemKirsanov)
[^5]:2024, Yang W. et al. ["Selection of experience for memory by hippocampal sharp wave ripples"](https://www.science.org/doi/10.1126/science.adk8261) ([site](https://winnieyangwannan.github.io/RippleTagging/projects/1_project/)) ([notebook](https://colab.research.google.com/drive/1qwruNxqS20xIl7sXYwjUA5zXKLTMWuTz?usp=drive_link))
