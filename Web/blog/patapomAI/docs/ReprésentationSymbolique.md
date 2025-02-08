# Représentation Symbolique

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

La première question qu'on se pose est évidemment : est-ce qu'on peut représenter **toutes** les situations auxquelles nous sommes confrontés tout au long de notre existence ?

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
    D'ailleurs, je construis mes concepts à partir des définitions d'un [dictionnaire très complet](https://usito.usherbrooke.ca/). C'est un processus itératif de va-et-vient puisque j'ai besoin des définitions des mots du dictionnaire pour le sens de mes concepts, et j'ai besoin des concepts pour comprendre le sens des mots *dans les phrases* des définitions. :grin:



!!! info "Note"
    Certains concepts peuvent parfois se référer à un **groupe de définitions**, si tant est qu'elles englobent toutes le même sens.<br>On notera par exemple le cas du [concept de **Type**](StructureConcepts.md#notion-de-type) qui se réfère au [groupe de définitions II.B](https://usito.usherbrooke.ca/d%C3%A9finitions/type#E9E90cd18015e123) dans le dictionnaire Usito — chaque définition du groupe II.B spécialisant la notion de type à des usages particuliers mais ne variant pas le sens.



## Un prototype **flou**

Un exemple unique d'objet représenté de manière conceptuelle, peut sembler binaire et "dur", en effet. On décrit *cet objet particulier à un instant donné*, avec ses propriétés particulières qui sont présentes ou absentes (ou ignorées et donc pas représentées). C'est généralement de cette manière qu'on procède dans une base de données classique où une entrée dans une table contient une liste de valeurs.

Mais c'est **l'ensemble des exemples** des objets de même type — qu'on appelle un **prototype**[^1] — qui vont conférer une dimension "floue" à ces propriétés et revêtir différentes valeurs selon les exemples — valeurs qu'on aura du mal à qualifier de binaires ou de rigides, hormis pour les [**propriétés caractéristiques**](#proprietes-caracteristiques) de ces objets qui ne varient pas ou très peu.

Prenons le cas classique des oiseaux :

![](images\Concepts\Prototype Oiseaux.png)



On peut imaginer ici que ces exemples ont été **perçus** et sont donc beaucoup plus complets que ça en termes de propriétés descriptives, mais disons qu'on a là un échantillon représentatif d'un ensemble d'oiseaux.

* L'ensemble des exemples représente la catégorie des **oiseaux**
    * C'est probablement un argument d'autorité qu'un tuteur nous aura donné
    * Ou bien on aura su faire le groupement nous-même grâce à [l'algorithme d'apprentissage](FondementsApprentissage.md) du fait de qualités communes entre les exemples de toutes ces choses qui volent qu'on aura aperçues pendant nos expéditions et qu'on aura décidé d'appeler "oiseaux".
* On va pouvoir faire une **moyenne** des propriétés qui caractérisent ces exemples :
    * Pour la taille :
        * On a une grande majorité d'oiseaux qui sont **petits** (les plus répandus dans nos contrées du nord)
        * Beaucoup d'oiseaux **moyens** (on pense aux toucans, aux perroquets, aux corvidés, au geais, etc.)
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
    * Ils peuvent tous voler (à de rares exceptions près, en général on pense à la poule, à l'autruche ou aux pingouins)



### Distributions des valeurs

La distribution de la plupart des propriétés du monde réel est hautement variable, par exemple on voit ici la distribution de la longueur des ailes d'oiseaux [^2] :

<img src="..\images\Concepts\Bird Wing Span Distribution.png" style="zoom:50%;" />



#### Catégories grossières

Contrairement aux machines qui peuvent tout à fait gérer l'intégralité d'un énorme dataset de valeurs de propriétés et dresser un histogramme comme dans l'image ci-dessus, les humains se contentent en général de grouper les propriétés en catégories grossières, souvent par groupes de 2 extrêmes autour d'un groupe moyen :

* Petit, Moyen, Grand
* Faible, Moyen, Fort
* Léger, Moyen, Lourd



!!! note
    On notera que l'on considère comme "moyennes" des caractéristiques qui sont similaires à nos propres caractéristiques humaines, que ça soit la taille, le poids, la force, la vitesse, etc.



On a parfois besoin de distinguer davantage de catégories, on utilisera alors plutôt 5 groupes :

* Minuscule, Petit, Moyen, Grand, Énorme

    <br>

!!! question "Hypothèse"
     Je pense que les humains sont dotés d'un mécanisme interne capable de déterminer plusieurs **modes** de **distributions normales (gaussiennes)**, avec la moyenne et la variance de chaque mode.<br><br>Ce ne sont bien entendu pas les caractéristiques exactes $\mathcal{N}(\mu,\sigma^2)$ comme en statistiques, mais plutôt un "ressenti". Encore une fois — comme pour l'algorithme d'apprentissage qui se base sur la quantité ou la fréquence d'activation de certains neurones ou certains concepts pour en déduire une corrélation — on va se baser sur la quantité et la fréquence d'activation des propriétés pour créer des groupes.

Par exemple, l'histogramme de distribution de la longueur des ailes d'oiseaux sera plutôt représenté sous la forme de 3 modes gaussiens comme ceci :

<img src="..\images\Concepts\Bird Wing Span Normal Modes.png" style="zoom:50%;" />

On distingue donc ici 3 catégories d'oiseaux : les petits (la majorité), les moyens (moins nombreux) et les grands (les moins répandus).

!!! warning "Attention"
    Ici il ne faut pas confondre la variance sur les valeurs des tailles de chaque catégorie, et la fréquence à laquelle on observe des membres de chaque catégorie (souvent ou rarement). On notera toutefois que les catégories se recoupent peu, ce qui leur confère justement un côté discret et prompt à la séparation en groupes distincts.



#### Propriétés **caractéristiques**

Grâce à cette capacité intrinsèque du cerveau à repérer les modes de distribution des propriétés d'objets, il va être extrêmement aisé de déterminer les propriétés pour lesquelles il n'y a qu'un seul mode avec une variance très réduite : ce sont les **propriétés caractéristiques** de la catégorie.

Par exemple pour les oiseaux :

* Les propriétés **ailes** et **plumes** sont tout le temps présentes, leur variance est donc de 0 et leur valeur moyenne est "**true**".
* Un cas presque aussi tranché implique la propriété **vole** : elle est cette fois présente 99% du temps, seules quelques exceptions existent (autruche, poule, pingouin). Il existe donc techniquement 2 modes : un mode à **true** avec un nombre extrêmement élevé d'activations, et un mode à **false** avec un tout petit nombre d'activations, qu'il est facile d'ignorer quand on imagine l'oiseau prototype.
* Mais les propriétés **couleur** et **taille** sont trop variables, ce ne sont donc *pas* des propriétés caractéristiques des oiseaux.



#### Optimisation

Les propriétés caractéristiques vont donc pouvoir être généralisées à tous les exemples et remonter au niveau de la catégorie parente : par exemple, avoir un **bec**, des **plumes**, des **ailes** et **voler** seront des propriétés qui vont remonter au niveau de la catégorie **oiseau**.

Et même si la propriété **voler** n'est pas toujours vraie, on ne stockera les exceptions qu'au niveau des exemples particuliers de la poule, l'autruche et le pingouin.

On peut ainsi "optimiser" les propriétés en ignorant les détails d'un exemple particulier pour finalement se reposer sur le prototype : seules les *propriétés saillantes* de l'exemple qui diffèrent du prototype importeront.

!!! tip "Remarque"
    L'optimisation est un facteur important dans le cerveau, à la fois pour minimiser le temps de traitement et de réaction (meilleures chances pour l'organisme de rester en vie s'il réagit vite aux menaces), mais également pour minimiser l'énergie et la matière dépensées pour construire les connexions neuronales.



### Les exemples font les concepts

On a vu plus haut qu'on avait décidé de catégoriser certains animaux en tant que **oiseaux**.

On a ainsi pu regrouper plusieurs exemples d'oiseaux qui nous permettent de former un "*oiseau prototype*".

Et c'est cet *oiseau prototype* qui va représenter la catégorie **oiseaux** en retour.

!!! danger "En résumé"
    Les exemples fabriquent le prototype, le prototype classifie les nouveaux exemples, les nouveaux exemples updatent le prototype.



On pense immédiatement à l'exemple des EigenFaces[^3] qui représentent un "visage moyen" (le prototype) ainsi que plusieurs axes de propriétés caractéristiques pour créer des visages particuliers (les exemples) :

<img src="..\images\Concepts\Eigenfaces.png" style="zoom:50%;" />



En effet, comme on l'a vu [plus haut](#optimisation), on va faire remonter les propriétés communes au niveau de la catégorie et ne conserver que les propriétés particulières au niveau des exemples (les *principal components* mises en exergue par l'algorithme de PCA utilisé pour les *Eigen Faces*), ce qui apportera un avantage substantiel dans la rapidité de traitement et la conservation de l'énergie et de la matière cérébrale.



#### *Nearest Neighbors*

En plus d'assignations "rigides" à des catégories selon des critères binaires et des règles logiques (par exemple : il a des plumes → c'est un oiseau), il est aisé d'assigner de nouveaux exemples à des catégories existantes quand les prototypes sont déjà bien formés en utilisant l'algorithme de [*Nearest Neighbor*](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm).

Il suffit en effet de considérer chaque propriété du nouvel exemple comme un axe d'un espace vectoriel et mesurer la distance entre la valeur de cette propriété et celles des différents prototypes pour savoir comment catégoriser le nouvel exemple.

Imaginons que nous découvrions pour la première fois l'image d'un léopard :

<img src="..\images\Concepts\Leopard.png" style="zoom:50%;" />

On fait la liste de ses propriétés : c'est un animal, il marche à 4 pattes, il a le poil jaune avec des taches noires, il a une longue queue, il possède des griffes, de grandes dents, des moustaches des oreilles arrondies, une truffe triangulaire, c'est un prédateur, il est assez gros, etc.

​	Chaque propriété qu'on va "allumer" va ainsi résonner de plus en plus avec le prototype du félin.



!!! note "Remarque"
    Encore une fois, même si ça n'est probablement une version exacte de cet algorithme qui est utilisée par notre cerveau, il y a une plausibilité biologique à l'existence d'un tel algorithme puisque, dans sa version la plus simple, il ne nécessite que l'activation d'un ensemble de propriétés qui activeront à leur tour le concept prototype au-delà d'un certain seuil (c-à-d si on coche suffisamment de critères), ce qui est exactement le principe de fonctionnement d'un neurone...



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
    Une note amusante est que l'exemple type des papiers qui portent sur les études de prototypes et de représentation, c'est d'employer l'exemple des oiseaux. Piège dans lequel je suis tombé volontiers... :grin:



### Des prototypes pour tous les concepts ?

Il est assez probable qu'on ait autant de prototypes que de concepts :

* Il est toujours possible de créer des catégories nouvelles dont l'appartenance dépend de la présence ou l'absence d'un certain nombre de propriétés (ces propriétés sont **aussi** des concepts)
* Les groupes d'objets appartenant à ces catégories peuvent toujours être assemblés en une moyenne floue représentant l'objet prototype associé à ce concept
* La formation de ces groupes sur des critères variables est généralement très rapide et utilise les mêmes mécanismes que ceux employés pour la fonction de [mémoire associative](MémoireAssociative.md).



On va donc pouvoir représenter la majeure partie des [exemples cités au début de l'article](#peut-on-tout-representer-de-cette-maniere) quand il s'agit de propriétés "simples", mais c'est un peu plus difficile de voir ce qui se passe dans le cas des sons, des images ou des mouvements : pourquoi a-t-on cette capacité de nous remémorer — parfaitement semble-t-il — certaines scènes qu'on a vécues ou qu'on a vues dans un film ?



#### L'exemple des mots de la langue

J'aime à me représenter la définition d'un mot — et donc son sens, directement lié à un concept unique — comme un nuage un peu flou de ses synonymes, de ses antonymes, de ses représentations dans d'autres langues, de son orthographe (et donc des symboles qui le représentent), de son champ lexical, des exemples de son utilisation dans des phrases ou des expressions, des images, des sons ou des odeurs qui lui sont associés, etc.

On voit bien ici que ce qui définit un mot — ce qui constitue son prototype — est une nébuleuse de choses qui lui sont liées. Il en va probablement de même pour n'importe quel concept qu'on aura défini.

C'est l'activation d'un concept de cette nébuleuse qui, en retour, par associativité, ira activer tous les autres concepts connexes et nous fournira automatiquement une mesure de la pertinence et de l'attention qu'on devra porter à ces concepts, comme expliqué dans [l'algorithme de mémoire associative](MémoireAssociative.md).



## Représentation des propriétés émanant des sens

On a donc vu jusqu'ici qu'il était aisé d'assigner des propriétés artificielles aux objets comme la couleur ou la taille; ou bien de classer les objets dans des catégories, artificielles elles aussi.

Qu'en est-il des objets qu'on *perçoit* par l'intermédiaire de nos sens ?

Comment parvient-on à se les remémorer de manière parfois très vive, comme de "petites scènes intérieures" ? (hormis pour les personnes souffrant d'[aphantasie](https://fr.wikipedia.org/wiki/Aphantasie))



### Un fort couplage entre langage et vision

Dans un article de Nature[^4] très intéressant de 2021, on peut voir la mise en évidence d'un lien très fort entre représentation visuelle et représentation linguistique :

<img src="..\images\Concepts\Visual and Language Representation Coupling.png" style="zoom:50%;" />



Dans l'image ci-dessus, les 2 représentations se "rejoignent" (partie blanche) à la frontière du cortex visuel, comme si l'image d'une chose et le mot qui la représente étaient liés dos-à-dos.

Ce couplage entre le texte et la chose qu'il représente existe également dans les réseaux de neurones artificiels :

![](images\Concepts\apple.webp)

Il est légitime d'imaginer que nous conservions donc une sorte "d'empreinte" visuelle des choses que nous avons pu voir au cours de nos expériences.

Mais quelle forme cette empreinte peut bien revêtir ?

### Tout n'est qu'illusion ?

D'après le chercheur en neurosciences Anil Seth, tout ce que nous percevons ne serait qu'une sorte d'illusion[^5].

!!! quote
    We do not perceive the world as it objectively is, but rather that we are prediction machines, constantly inventing our world and correcting our mistakes by the microsecond, and that we can now observe the biological mechanisms in the brain that accomplish this process of consciousness.

En tant que programmeur qui essaie toujours de factoriser mon code, cette vision des choses offre tellement de sens et semble tellement évidente *a fortiori* ! :boom: :dizzy_face:

Le cerveau ne perçoit donc pas *directement* l'environnement extérieur mais crée *d'abord* une **représentation interne de l'environnement**. On opère ensuite *à partir* de cette représentation interne, de ce modèle de l'environnement.

On peut donc attaquer ce "*théâtre interieur*" de 2 manières :

1. Directement, à l'aide de nos sens
2. En imaginant ou en nous remémorant une scène, comme pendant nos rêves où le cerveau est en roue libre



![](images\Concepts\Modèle Interne.png)

!!! danger " "
    Toute activation de la représentation interne fait **figure de réel** ! On n'a aucun moyen de distinguer le réel de l'imaginaire...



Il y a de nombreux exemples qui mettent en évidence cette illusion :

* Vous croyez savoir parfaitement dessiner un cheval ? Votre image mentale d'un cheval vous semble extrêmement détaillée ? Vous êtes certain de connaître tous les détails de l'anatomie d'un cheval ? Eh bien essayez d'en dessiner un... (cela ne vaut évidemment pas pour un dessinateur professionnel)
* Vous croyez pouvoir chanter cette chanson parfaitement ? Vous vous rappelez parfaitement des paroles ? Eh bien essayez... (cela ne vaut évidemment pas pour un chanteur professionnel)
* Vous croyez vous rappeler de chaque moment de votre film préféré ? Eh bien écrivez donc une scène de mémoire, revoyez-la dans le film et comparez...
* Rappelez-vous vos souvenirs d'enfance et votre foi inébranlable dans votre capacité à sauter d'un endroit à un autre tel un ninja ? Et maintenant observez depuis l'extérieur les mouvements de votre jeune enfant qui se projette dans les mêmes fantasmes que vous... :sweat_smile:



Je théorise qu'on a seulement **l'illusion de la maîtrise et de la fidélité de nos souvenirs**.

Si on part de l'idée que cette théorie est correcte alors ça veut dire qu'on réécrit en permanence nos souvenirs et, tel le proverbial bateau de Thésée, on n'aurait jamais une version exacte ou complète de la chose dont on se souvient **tout en ayant le sentiment qu'on s'en souvient toujours de manière exacte** !



La question est : jusqu'à quel niveau de dégradation de nos souvenirs peut-on descendre avant qu'on ne commence à réaliser la perte de fidélité ?

!!! note " Anecdote"
    Je repense souvent à l'exemple de mon grand-père, décédé il y a maintenant plus de 20 ans. J'ai toujours des images très vives de son visage, mais toujours les mêmes, toujours dans la même posture, et ces images correspondent peu ou prou aux quelques photos qui me restent de lui. Suis-je même capable d'imaginer d'autres situations ? Quelques unes mais jamais très détaillées. Et évidemment, ce sont toujours de situations exceptionnelles, des faits marquants, jamais des situations ordinaires... Pourtant ce magma de souvenirs flous, ça représente l'ensemble des expériences que j'ai vécues avec mon grand-père et c'est quelque chose d'unique que je ne pourrai jamais transmettre à qui que ce soit et qui me sont propres.<br>Il en sera de même pour l'expérience que les gens vivront en ma compagnie, et ainsi de suite.<br>C'est éminemment personnel et incessible.



### Représentation visuelle

Si la théorie du "*théâtre intérieur*" est vraie, alors ce qu'on perçoit de la réalité n'est pas directement une représentation détaillée de chaque "pixel" reçu par notre nerf optique, mais une représentation de *features* de haut-niveau qui sont activées par un ensemble spécifique de pixels agencés d'une manière spécifique.

L'équipe d'Anthropic a déjà mis en évidence [^6][^7] une hiérarchisation de la complexité des *features* détectées par des *Convolutional Neural Networks* (CNN) qui correspond assez fidèlement à ce qui se produit dans le cortex visuel du cerveau humain :

![Architecture de GoogLeNet et diverses activations](images\Concepts\GoogLeNet Architecture and Features Visualization.png)

On voit qu'il y a une gradation :

* des *features* bas-niveau dans le *layer* 3 : edges, contrastes, fréquences, courbes, dégradés, filtres de Gabor
* un "*sweet spot*" de *features* de niveau intermédiaire dans le *layer* 4 où l'on va trouver des éléments visuels très intéressants composés à partir des *features* du niveau précédent, à différents niveaux de détail (par exemple un oeil d'animal en gros plan dans 4a mais également des éléments de paysage vu de loin dans 4b)
* puis une composition de *features* de haut-niveau dans le *layer* 5 qui n'ont plus vraiment de représentation visuelle, c'est probablement dans ces étages que le CNN va former ses dernières représentations à des fins de classification.



Il est donc probable que les étages de composition et de classification dans le cerveau (l'équivalent du *layer* 5) opèrent sur des *features* du type de celles présentes dans le *layer* 4 et que la "scène de notre théâtre intérieur" soit plutôt composée de *textured patches* que de pixels :

<img src="..\images\Concepts\Théâtre Intérieur.jpg" style="zoom:50%;" />



!!! remark "Remarque"
    J'ai pris la liberté de représenter un *tiling* hexagonal dans l'image ci-dessus car on a déjà rencontré une structure neuronale similaire utilisée par les *grid cells*[^8].<br><img src="..\images\Concepts\Grid Cells.jpg" style="zoom:40%;" />



#### Représentation d'un exemple

On pourrait dès lors imaginer que l'on conserve des "signatures visuelles" sous forme de maillage de *patches* des objets qu'on a vus, et qu'on puisse ensuite se les représenter en les faisant entrer sur la scène de notre "théâtre" dès qu'on cherche à s'en rappeler. Mais on peut imaginer aussi d'autres représentations, basées sur les silhouettes ou sur les couleurs, qui viendraient compléter les informations de texture.

De plus, la proximité de cette signature visuelle avec la zone du langage impliquerait qu'on puisse donc immédiatement faire *venir à l'esprit* les images associées à des objets dès lors qu'on active le champ lexical des mots qui sont associés à cet objet.

On imagine qu'il en va probablement de même pour les représentations sonores, par exemples la prononciation des mots faisant partie du champ lexical d'un concept, ou bien les cris quand il s'agit animaux, etc.

!!! bug "TODO"
    Trouver des exemples de papiers qui parlent de "signatures sonores" car je n'ai pas vraiment lu grand-chose à ce sujet... :confused:



#### Représentation du prototype

Si l'on imagine que l'activation d'une catégorie, par exemple "oiseau", implique l'activation de tous les exemples d'oiseaux, et donc de leur "signature visuelle", comment cela se traduit-il sur la scène de notre *théâtre* ?

Encore une fois, on va avoir de nombreuses activations de propriétés et donc de *features* visuelles communes à tous les exemples (ailes, bec, plumes, patte, dans le cas des oiseaux) et donc ces *features* seront fortement représentées dans l'image du prototype; tandis que les nombreuses propriétés très variables vont être activées plus faiblement et donc formeront une image beaucoup plus "diffuse".

Ma théorie est que notre image prototype est une sorte de moyenne pondérée des *features* visuelles de chaque exemple, où le poids de chaque *feature* est simplement le nombre d'occurrences dans les exemples qu'on aura perçus et expérimentés.

!!! warning "Remarque"
    Je parle ici de pondération mais il ne faut pas y voir des poids en *floats* comme dans les réseaux de neurones classiques ! Ici on raisonne de manière biologiquement plausible. La pondération se fera en fonction de la *fréquence d'activation* des structures représentant les concepts : plus un concept sera activé fréquemment, plus il aura de prépondérance face aux autres.



Pour un citadin européen de l'ouest comme moi, j'aurai donc :

* Vu énormément de petits oiseaux et quelques oiseaux de taille moyenne → mon prototype sera donc de petite taille
* Vu énormément de moineaux, de merles, de corbeaux et de pigeons → mon prototype sera donc probablement de couleur marron foncé ou noir

Il est également probable qu'on puisse également pondérer les prototypes par des **préférences** personnelles et ainsi accorder plus d'importance, arbitrairement et consciemment, à certains exemples plutôt que d'autres.

En ce qui me concerne par exemple, j'accorde beaucoup d'importance au côté petit et mignon des oiseaux, et ma préférence se porte en grande partie sur les rouge-gorges.

!!! warning "C'est un autre sujet"
    Mais ici, on commence à faire intervenir la notion de goût subjectif, et donc une notion d'agenda. Or notre assistant personnel n'est pas là pour avoir un agenda autre que celui qu'on lui aura indiqué. S'il possède des préférences c'est qu'on les lui aura précisées, par exemple en lui faisant adopter nos goûts et nos aspirations.<br><br>C'est malgré tout très important d'y penser dès maintenant, car cette pondération des exemples et donc des sources d'information aura une <u>importance fondamentale</u> dès lors qu'on parlera de [l'algorithme d'apprentissage](FondementsApprentissage.md) et de la fiabilité des sources !



### Représentation du mouvement

On a vu plus haut que nous avions donc une représentation interne de ce que l'on perçoit de l'environnement : le cerveau passe donc son temps à essayer de créer une image aussi fidèle et aussi **cohérente** que possible à ce qu'on imagine être la réalité.

On s'attarde ici sur la notion de **cohérence** : le cerveau est une fantastique machine à réduire la surprise permanente que représente l'environnement.

Un mouvement dans les buissons ? Vite, regardons pour identifier la source et ainsi former une image mentale qui explique et réduit cette surprise.

Mais ce travail de réduction de surprise ne se produit pas seulement ponctuellement : il s'effectue en permanence en comblant les trous dus aux limitations de notre perception.

Chaque *moment* de notre vie est un "*collage*" de 2 instants disjoints que le cerveau transforme en une illusion de continuité.

Est-ce que cette expérience de vivre des évènement *apparemment* parfaitement représentés et continus dans le temps — alors qu'ils sont vraisemblablement disjoints et imparfaits — ne représente pas là l'essence-même du "travail" qu'effectue le cerveau ?



On pense bien sûr au fait qu'on ne parvienne pas à voir plus de 24 images par seconde, mais nous avons l'illusion que ça représente "parfaitement" notre réalité.

On pense aussi au *blind spot* de l'oeil que le cerveau "remplit" avec une illusion de continuité spatiale :

<img src="..\images\Concepts\blind spot.jpg" style="zoom:10%;" />

A plus grande échelle, nous reprenons le cours de notre vie comme si de rien n'était après une nuit de sommeil ou une anesthésie générale. Or, on a pourtant vécu l'expérience d'un "trou" dans notre existence consciente dont la longueur nous est totalement inconnue...

Malgré tout ça, nous avons l'impression d'être une entité qui évolue de manière continue dans l'espace et le temps.

Il est donc aisé d'extrapoler ce phénomène et d'imaginer que nos représentations internes de mouvements sont probablement composées d'un ensemble assez limité de *frames d'animation*, à l'image de ce qu'on peut voir dans les films ou les logiciels d'animation. On ne conserve sans doute que les *key frames* (les instants essentiels) d'un mouvement.

#### Mouvements physiques

De plus, il est probable qu'on ne conserve encore une fois que l'essentiel des propriétés du mouvement (ses **propriétés caractéristiques**, ) et qu'il soit adaptable à n'importe quelle entité : comme décrit dans [le mécanisme d'apprentissage](FondementsApprentissage.md), on ne conserve que les propriétés communes au mouvement — donc si on voit *"une pomme qui rebondit par terre"*, *"une balle qui rebondit par terre"*, *"un caillou qui rebondit par terre"*, etc. on ne conservera que la partie *"qui rebondit par terre"*, peu importe l'objet rebondissant.

De même que lorsque j'imagine le mouvement associé à "un rebond", je vois le prototype du rebond qui correspond à peu près à ça :

![](images\Concepts\Rebond.png)

Et de manière générale, j'imagine volontiers qu'on encode des mouvements un peu à la manière des "lignes de vitesse" et du langage visuel employé dans la bande dessinée :

![](images\Concepts\Tintin.png)



#### Séquences d'actions

Sur le même modèle que toutes les autres représentations, les séquences d'actions ne sont probablement représentées que par leurs *moments clés* et la continuité dans le temps est assurée par le cerveau. C'est le cas de la plupart des situations que l'on rencontre quotidiennement ou que l'on voit dans des films : on se rappelle des moments clés de la journée comme autant de "points de référence" mais pas des détails de chaque mouvement que l'on a pu faire pour réaliser chaque action.

Au besoin, on peut *inférer* la façon dont s'est précisément déroulée chaque action en accolant un "prototype de mouvement" qu'on amendera avec les caractéristiques de ce mouvement-là précis, si tant est qu'on ait les capacités mémorielles pour se rappeler avec autant de détails des gestes quotidiens banals et donc largement oubliables.

Mais la plupart des actions qu'on se remémore d'une journée sont des actions globales et de haut-niveau : j'ai été acheter du pain, puis j'ai fait le plein d'essence, finalement je suis rentré à la maison, je me suis fait un sandwich puis j'ai travaillé toute l'après-midi.



#### États qui varient dans le temps

Comment gère-t-on, à l'aide de concepts et de hiérarchie de propriétés, des états qui varient dans le temps ?

Par exemple un être vivant qui meurt ? Une croyance qui change ? Une mesure qui évolue ?

On note déjà le côté presque "violent et définitif" d'assigner une propriété $P$ à la représentation conceptuelle de quelque chose : la chose **est** ou **a** cette propriété. Point.

Mais on notera également le côté "graduel et doux" qu'on peut affecter à $P$ en lui assignant par la suite d'autres propriétés qui vont la quantifier et la qualifier :

* On pourra par exemple indiquer le nombre de pattes d'un animal en spécifiant "4" à la propriété "patte" sous la description de l'animal
* On pourra indiquer une valeur à la propriété "taille" d'un individu
    * :warning: Encore une fois : cette propriété "taille" n'est valide qu'à un instant donné et peut évoluer dans le temps !



Mais on peut tout aussi bien spécifier des **propriétés temporelles** à ces propriétés pour :

* Les tagger avec une date précise
* Indiquer un début ou une fin d'intervalle temporel



La durée de validité d'une propriété est donc *par défaut* infinie et toujours vraie, jusqu'à ce qu'une propriété de même type ou une spécialisation plus fine de la propriété en question se voie affublée d'une propriété temporelle plus récente, auquel cas la nouvelle propriété prend nécessairement le pas sur l'ancienne.

Tout repose ensuite sur l'interprétation —et donc le raisonnement— qu'on va appliquer à des suites de points temporels : est-ce qu'on va décider que les valeurs sont discrètes (par exemple pour une action particulière, comme acheter une baguette de pain), ou seront interpolées dans le temps (par exemple, pour la mesure de la taille d'une personne) ?

On retrace ainsi le changement d'un lieu à l'autre de quelqu'un simplement en analysant les propriétés temporelles des actions liées à cette personne, avec une granularité plus ou moins fine selon qu'on aura enregistré son GPS pendant toute une semaine, ou simplement lu des articles de presse à son sujet qui font état de sa présence à tel ou tel évènement (on imagine alors que la personne ne reste pas à un endroit donné jusqu'à ce qu'un autre article de presse paraisse et nous donne sa nouvelle position : on suppose juste qu'on n'a pas d'information sur les faits et gestes de cette personne dans l'intervalle de temps).



#### Changement abrupt de sens

Un dernier avantage tout à fait souhaitable de l'assignation "violente et définitive" d'une propriété $P$ à la représentation conceptuelle d'une chose est de modifier <u>radicalement</u> la façon dont cette chose est perçue :

* On pense par exemple au cas de la **négation** où le fait d'assigner une négation à quelque chose la transforme instantanément en son contraire (« je t'aime... :heart_eyes: **pas** ! :sob: »)
* On pense aussi au **contexte** dans lequel se déroule une histoire : est-ce la réalité ou bien un rêve ?

Les évènements revêtent en effet une qualité radicalement différente selon qu'ils sont vrais ou faux !

Il est donc très facile de faire changer le contexte d'une action ou de l'existence d'un ensemble de propriétés simplement en assignant des propriétés *pivot* comme le **temps** (qu'on a déjà vu plus haut), le **contexte** ou l'**histoire** dans lequel se situe la structure et la **vraisemblance** de cette structure.



## Et le raisonnement dans tout ça ?

Après avoir lu la [note sur la composition de structures conceptuelles basiques](StructureConcepts.md), on peut réfléchir aux opérations qu'on va pouvoir effectuer de manière symbolique à l'aide de ces structures.

Je vous encourage donc à lire cette note sur le [raisonnement symbolique](RaisonnementSymbolique.md) qui traite des briques de raisonnement de base, des relations de cause à effet, ainsi que des décisions qu'on peut prendre en analysant de telles structures.

Il y a aussi une partie qui traite des problèmes de Bongard et du challenge ARC qui montrent des instances particulières de problèmes intéressants à résoudre.



## L'illusion... de la conscience ?

On a donc vu que je me basais fortement sur l'hypothèse d'une illusion construite et maintenue en permanence par notre cerveau.

Maintenant, la question à 1 million de dollars : **en est-t-il de même pour la conscience ?** Est-ce que ce sentiment d'être doués de conscience n'est pas finalement qu'une illusion, lui aussi ?

<img src="../images/Concepts/Mind Blown.png" style="zoom:50%;display: block;margin-left: auto;margin-right: auto;width: 50%"; />





## Refs possibles

[The Geometry of Categorical and Hierarchical Concepts in Large Language Models](https://arxiv.org/abs/2406.01506)

[How Organisms Come to Know the World: Fundamental Limits on Artificial General Intelligence](https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2021.806283/full)

[How to Grow a Mind: Statistics, Structure, and Abstraction](https://cocosci.princeton.edu/tom/papers/LabPublications/GrowMind.pdf)  ← Tufas !

[Human-level concept learning through probabilistic program induction](https://cenl.ucsd.edu/labspace/JclubLabMeetings/Lijuan-Science-2015-Lake-1332-8.pdf)

[FAIR's Large Concept Models](https://github.com/facebookresearch/large_concept_model) ([paper](https://arxiv.org/abs/2412.08821))

[Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)

[Language Models are Few-Shot Learners](https://arxiv.org/pdf/2005.14165)

Brain is an illusion machine https://www.youtube.com/watch?v=iPj9D9LgK2A&ab_channel=ArtemKirsanov





[^1]:1973 Rosch E. ["Natural Categories"](https://www.sciencedirect.com/science/article/abs/pii/0010028573900170)
[^2]: [Dataset AVONET](https://opentraits.org/datasets/avonet.html)
[^3]:1991, Turk M. A., Pentland A. P. ["Face Recognition using EigenFaces"](https://www.mit.edu/~9.54/fall14/Classes/class10/Turk%20Pentland%20Eigenfaces.pdf)
[^4]:2021 Popham S. F. et al. ["Visual and linguistic semantic representations are aligned at the border of human visual cortex"](https://www.nature.com/articles/s41593-021-00921-6)
[^5]:2017 Seth A. ["Your brain hallucinates your conscious reality"](https://www.ted.com/talks/anil_seth_your_brain_hallucinates_your_conscious_reality)
[^6]: 2017 Olah C. ["Feature Visualization"](https://distill.pub/2017/feature-visualization/) ([visualization](https://distill.pub/2017/feature-visualization/appendix/))
[^7]:  2020 Olah C. ["An Overview of Early Vision in InceptionV1"](https://distill.pub/2020/circuits/early-vision)
[^8]:  ["PLACENESS, PLACE, PLACELESSNESS"](https://www.placeness.com/place-cells-and-sense-of-place-in-neuroscience/)

