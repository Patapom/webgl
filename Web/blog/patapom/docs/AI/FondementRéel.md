# Garder les pieds sur Terre

Encore un reproche qu'on peut faire au ML et au deep learning en particulier : une espèce de fuite en avant vers toujours des nouvelles mesures d'erreurs, des nouvelles fonctions d'objectif, 
 un dataset encore plus gigantesque, des nouvelles structures et procédures qui améliorent chaque fois les résultats de manière marginale.

A chaque nouvelle étape, à chaque nouvel outil, on constate des mathématiques de plus en plus poussées pour que la gradient descent soit plus efficace, ou que la fonction d'objectif soit plus contrastée, ou je ne sais quoi d'autre encore.

Pourtant, jamais on ne change l'algorithme de base (backpropagation), ni l'architecture de base (des neurones connectés de manière rigide), et ce sont bien les seules choses qui sont **grounded** dans la réalité :
 après tout, on est partis d'un modèle de neurone biologique pour créer le [Perceptron](https://en.wikipedia.org/wiki/Perceptron) implémenté pour la première fois en 1958, et depuis... plus rien !

J'exagère sans doute (comme souvent), je ne suis pas courant de toutes les recherches menées dans le domaine, mais d'une bonne partie tout de même. Et je dois bien avouer que si l'on commence timidement à renouer avec
 les neurosciences, l'approche symbolique, voire parfois avec la psychologie et même la philosophie, on reste malgré tout dans le domaine de l'abstrait mathématique.<br>
 Les milliers de publications annuelles dans ce domaine qui désormais nourrit des milliers d'appétits de chercheurs à travers le monde, se suivent et se ressemblent un peu toutes... :confused:


## Principe Axiomatique de Réalisation

Il me semble qu'on perd souvent de vue que la plupart des algorithmes effectués par ces jolis papiers &mdash; si l'on voulait se rapprocher réellement d'une IA &mdash; devraient pouvoir être **implémentés**
 par les mécanismes biologiques présents dans le cerveau ! En tout temps, et quelle que soit la condition !

Donc quand on écrit un papier qui introduit la [distance de Wasserstein](https://fr.wikipedia.org/wiki/Distance_de_Wasserstein) pour réaliser un transport optimal de la distribution vers l'espace latent décorélé
 (je raconte n'importe quoi, ça se voit?), est-ce qu'on se rend compte à un moment que le cerveau ne fait probablement pas un truc pareil aux niveaux micro- ou mésoscopique où ces réseaux de neurones artificiels sont
 censés opérer ?


## Le bon niveau d'étude

Je distingue plusieurs niveaux et plusieurs types "d'*algorithmes*", que je classe du plus bas au plus haut :

1. Le niveau microscopique, où opèrent les réactions chimiques comme l'échange d'ions potassium au niveau des synapses.

2. Le niveau cellulaire, où les stimuli synaptiques sont traités et intégrés par les neurones.

3. Le niveau des assemblages de neurones et de l'organisation du réseau en un [connectome](https://en.wikipedia.org/wiki/Connectome) utilisé comme une mémoire associative de concepts statiques, d'actions, de relations, de situations, d'événements, etc.

4. Le niveau des mécanismes encore mystérieux à mes yeux où l'optimisation neuronale se produit et où les neurones se reconfigurent (neuroplasticité) pour obéir à différentes critères : économie d'énergie, apprentissage, optimisation du traitement l'information, etc.

5. Le niveau du raisonnement où l'on va "piloter" plus ou moins consciemment et séquentiellement les algorithmes que notre cerveau a appris pour faire des opérations complexes (compter, lire une carte, résoudre une problème, etc.).

6. Le niveau de la décision et de la conscience qui va décider de mobiliser tel ou tel algorithme en fonction de l'environnement et des besoins


Les niveaux 1 et 2 sont clairement au niveau **microscopique**, les niveaux 3 et 4 peuvent être qualifiés de **mésoscopiques** tandis que les niveaux 5 et 6 seront les niveaux **macroscopiques**.

>:bulb: On notera qu'à partir du niveau macroscopique, le traitement devient séquentiel et on perd le côté "multitâches" des niveaux inférieurs.<br>
C'est ce niveau que [Daniel Kahneman](https://en.wikipedia.org/wiki/Daniel_Kahneman) appelle "System 2", par opposition au "System 1" qui fonctionne de manière rapide, inconsciente et sans effort.


### Les approches standard

La plupart des études portent...

* soit sur le micro, comme par exemple le projet [Blue Brain](https://www.epfl.ch/research/domains/bluebrain) de l'EPFL

	> Mon opinion est que c'est à la fois une perte de temps si l'on espère voir émerger un comportement aussi complexe qu'une intelligence en modélisant uniquement des règles simples.<br>
	La seule issue pour obtenir un cerveau artificiel (si c'est le but des chercheurs qui emploient cette approche) serait de reproduire un cerveau biologique à l'identique.
	Outre le fait que ça me semble totalement impossible, je ne vois aucun intérêt à cette tâche !

* soit sur le macro comme la [Global Workspace Theory](https://en.wikipedia.org/wiki/Global_workspace_theory) qui s'attaque directement à la modélisation et simulation d'une entité consciente qui va soliciter et piloter des algorithmes;
 ou bien encore des études qui portent uniquement sur la partie "raisonnement" et résolution de problèmes logiques de haut niveau (systèmes experts)

	> Mon opinion est qu'il manque d'abord une base mésoscopique sur laquelle se reposer avant de tenter de modéliser une quelconque volonté : comment cette volonté pourrait savoir ce qu'elle veut si elle n'a
	 pas au préalable un modèle du monde dans lequel on veut la plonger ?<br>
	 Aborder le cerveau uniquement comme un moteur de raisonnement et de conscience me semble totalement prématuré.

* soit sur le méso mais avec une approche déconnectée du réel où les réseaux de neurones font des opérations bien trop compliquées pour être réalisables biologiquement;<br>
 Ces réseaux de neurones se contentent de résoudre des problèmes "étroits" comme par exemple la classification d'images, le repliement de protéines, jouer au jeu de Go, etc. mais sont incapables de sortir de leur domaine et de se généraliser.<br>
 Même le tout récent modèle [Gato](https://www.deepmind.com/publications/a-generalist-agent) ne semble être ni plus ni moins qu'un assemblage de plusieurs narrow AIs dans le but d'en faire une plus générale.

	> Mon opinion est que c'est le bon niveau d'étude mais qu'il y a une sorte d'aveuglement des scientifiques et ingénieurs qui ne l'abordent que par le prisme, certes très prometteur, du deep learning sans
	 voir la *big picture* et le besoin de reformuler le problème de manière plus globale que cette espèce de routine "big data &rarr; network modeling &rarr; training &rarr; testing" et recommencer avec chaque fois
	 plus de données, plus de paramètres, une meilleure fonction d'objectif, etc.


### L'approche manquante

A mon sens il faut d'abord se préoccuper de comment réussir à fournir à la machine :

1. Un modèle de notre monde, de notre environnement et de notre psyché (ce qu'on appelle "**le sens commun**" et la [Theory of Mind](https://en.wikipedia.org/wiki/Theory_of_mind))
2. Des moyens de raisonner de manière basique en exploitant ce "*sens commun*" afin de savoir quelle action/réponse a le plus de sens dans le contexte actuel et selon la question qui a été posée

Et pour ça, il faut aborder ce problème au niveau mésoscopique, celui des **mécanismes basiques** qui sont à l'oeuvre par exemple dans le recâblage des neurones (la neuroplasticité) et qui font qu'on va pouvoir appréhender un nouveau concept qu'on aura appris,
 ou bien une nouvelle technique de frappé de balle au tennis qu'on aura pratiquée et répétée longuement, ou bien une toute nouvelle procédure algorithmique comme quand on apprend à lire et à compter.

Il faut également réfléchir sur ce que représentent un neurone ou un groupe de neurones à cette échelle et dans le contexte de la réalisation d'une mémoire.<br>
Pour moi, il s'agit de considérer le cerveau à cette échelle comme un gigantesque manipulateur de **symboles** que j'appellerai par la suite des **concepts**.


## Nature de ces mécanismes basiques

Il est légitime de s'interroger sur la nature des mécanismes basiques que le cerveau parvient à mettre en oeuvre à l'échelle mésoscopique :

* Certains, de très bas niveau, sont "hardcodés"

	* Probablement au niveau génétique (c'est d'ailleurs à mon avis le seul endroit où "*nature*" pourrait primer sur "*nurture*" : notre capacité innée à former plus ou moins bien de nouvelles connexions).

	* C'est le cas du recâblage des neurones mémoriels pour renforcer ou détruire les liaisons qui constituent un souvenir.

* Mais d'autres semblent être des **algorithmes** pilotés de manière plus ou moins consciente !

	* Par exemple, apprendre à lire demande d'exécuter toute une séquence d'actions qui vont de la reconnaissance de lettres individuelles au groupement en syllabes,
		suivi d'une reconnaissance de certaines règles phonétiques ("gn" = ñ) et finalement la reconnaissance du mot lui-même.

>!!! Non! Trop haut niveau!	* Une opération de calcul mental demande d'effectuer toute une suite de tâches où il faudra peut-être se rappeler d'une retenue, ou d'un nombre calculé précédemment et qu'il
		faudra retrancher plus tard, etc.


### Des opcodes biologiques

On peut imaginer ces algorithmes sous la forme de petits automates cellulaires capables de réaliser des "*[opcodes](https://en.wikipedia.org/wiki/Opcode)*" limités.

Les neurones individuels (ou en tout petits groupes) vont probablement pouvoir :

* Faire des "sommes" (i.e. se compter)
* Faire des comparaisons de seuil en terme de fréquence ou d'intensité d'activation (c'est surtout la définition de ces seuils qui va importer)
* Faire et défaire des liens entre neurones à "volonté"

#### Ca va permettre de réaliser de petits circuits simples :

* Des filtres et détecteurs de fréquences et d'intensité qui vont se déclencher au-delà d'un seuil
* Des amplificateurs et repeaters : des neurones super sensibles qui vont répercuter un signal très faible
* Une mémoire d'activation 
* Des portes logiques :
	* Un neurone &mdash; dans son implémentation la plus simpliste &mdash; est une porte OU avec plein d'entrées
	* Tandis qu'une inhibition sur une entrée correspond simplement à une porte NON

#### Mais on peut aussi probablement rejeter la possibilité de réaliser des fonctions complexes comme :

* Les mesures de distance : spatiales, multidimensionnelles, entre des distributions (Wasserstein, Hellinger, Kullback–Leibler, etc.)
* Les intégrales, hormis peut-être l'intégration des potentiels qui a l'air de se produire naturellement dans un neurone :
	chaque stimulus qui arrive en entrée sature un peu plus un potentiel qui se déclenche tout à coup au-delà d'un certain seuil, sous la forme d'un [potentiel d'action](https://fr.wikipedia.org/wiki/Potentiel_d%27action) qui
	 va se propager le long de l'[axone](https://fr.wikipedia.org/wiki/Axone) avant de revenir à la normale (repolarisation) et d'entrer en période réfractaire
* Les opérations arithmétiques de base : multiplications, additions, etc.
* Les loss functions trop compliquées : entropy, cross entropy, etc.



>:bulb: **TODO**
> 
> Concepts difficiles: Compter, notion de temps, 
>
> Focus vision => disentangle foreground/backgorund avec lo/hi freq. filters
>
> Empirisme Hume
>
> Myélination = fine tuning pour des mémoires procédurales ? (ex. des prouesses athlétiques qui demandent un degré de coordination extrêmement élevé ?)
