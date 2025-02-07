# Structures et Opérations sur les Concepts

![](images\WorkInProgress.png)



## Notation

Les concepts seront représentés par le symbole ⬙ (0x2B19  U+11033  &#11033) suivi de leur nom, généralement en gras.

Par exemple :

&nbsp;&nbsp;&#11033; **Oiseau**

&nbsp;&nbsp;&#11033; **Rouge**

Les liens avec des concepts "enfants" seront quant à eux indiqués par le symbole &#10551; (&#10551).



### Signification des références entre concepts

On va structurer les concepts hiérarchiquement de cette manière :

&#11033;**Oiseau**<br>&nbsp;&nbsp;&nbsp;&nbsp;⤷ &#11033;**Rouge**



Mais que signifie l'assignation d'un concept à un autre ?

!!! danger " "
    Dans ma convention, "&#10551; ⬙**A**" signifie "**possède la propriété ⬙A**".



Dans l'exemple ci-dessus on crée donc un **lien** ou une **référence bidirectionnelle** entre &#11033;**Oiseau** et &#11033;**Rouge** :

* &#11033;**Oiseau** possède la propriété &#11033;**Rouge**
* &#11033;**Rouge** est référencé par &#11033;**Oiseau**



Pour continuer en utilisant la langue de la programmation :

* On peut dire ici que &#11033;**Oiseau** est une *réalisation*, une *instanciation* du concept **Oiseau** défini globalement "à la racine" : on crée *un exemple d'oiseau*.
* De la même manière, &#11033;**Rouge**" est la *réalisation*, *l'instanciation* du concept **Rouge** défini globalement "à la racine" : on crée un exemple de chose rouge.
* Finalement, l'assignation d'une instance de "chose rouge" à une instance d'oiseau va bel et bien créer un exemple d'oiseau possédant la propriété rouge.



## Structures Fondamentales

Pour effectuer des descriptions et des raisonnements, on va avoir besoin de quelques notions fondamentales qu'on se propose d'ébaucher ici.

Ces ébauches n'ont évidemment rien de définitives et si jamais on laisse à un algorithme d'apprentissage la liberté d'apprendre les concepts et les liens en fonction de son expérience, il est probable que ça ne ressemble pas du tout à ce qu'on va tenter de faire ici manuellement. Mais peut-être que ce travail pourra malgré tout servir de base à une construction plus élaborée ?

!!! warning "Attention"
    L'importance et les conventions d'utilisation qu'on va décider d'appliquer aux structures conceptuelles décrites ci-après résident à l'étage du dessus : l'étage du raisonnement. C'est en effet à l'étage du raisonnement qu'on saura par exemple que le concept &#11033;**Contraire** définit un contrat de nature bidirectionnelle et opposée entre les 2 choses qui y sont sujettes, ou bien qu'une séquence ordonnée devra être lue de telle ou telle manière, et ainsi de suite.



### Notion de "*Type*"

C'est une notion fondamentale dès lors qu'on veut caractériser et classifier quelque chose.

On fait référence ici à ce groupe de définitions :

!!! quote "[**Type.II.B**](https://usito.usherbrooke.ca/d%C3%A9finitions/type#E9E90cd18015e123)"
    **1** Ensemble des caractères distinctifs de groupes de choses, d'individus, permettant leur classification.<br>**2** Ensemble des caractères (morphologiques, psychiques, ethniques, etc.) qui sont culturellement considérés comme distinguant des groupes humains.<br>**3** Ensemble de caractères, de propriétés, déterminés précisément, qui définissent une série d'objets fabriqués.<br>**4** inform. **type de donnée(s)** ou **type** : en programmation informatique, élément d'une classification de données (entier, chaîne de caractère, tableau, booléen, etc.) qui définit les valeurs que peut prendre une donnée, la manière dont elle est stockée ainsi que les opérateurs qui lui sont applicables.



### Notion "d'*Être*"

C'est une notion complémentaire à la notion de Type puisqu'elle permet *d'attribuer un type* aux choses — en programmation, on parlerait d'*héritage de type*.

On fait ici référence à cette définition du dictionnaire : 

!!! quote "**[Être.II.1](https://usito.usherbrooke.ca/d%C3%A9finitions/%C3%AAtre_1#C736C29d7338e597)**"
    **II** V. attributif **1** (qualification) Élément verbal liant un sujet à un attribut. ex: *Être paysanne, boucher.*

Ce qui est "amusant" c'est qu'on peut considérer le lien &#10551; comme la propriété "**avoir**". Tandis qu'ici, on vient de définir la qualité "**d'être**".<br>
Et donc écrire :

&#11033;**Moineau**<br>&nbsp;&nbsp;&nbsp;&nbsp;⤷ &#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷ &#11033;**Oiseau**

signifie littéralement "moineau **a** la propriété d'**être** un oiseau".

!!! note
    On notera qu'on peut bien entendu **être** de nombreuses choses à la fois, si tant est qu'elles ne soient pas contradictoires — à la charge de l'algorithme d'apprentissage ou de raisonnement de s'en assurer.<br>De plus, aussitôt qu'un concept **est** quelque chose, il possède automatiquement tous les attributs de cette chose (il en *hérite*).



### Notions de ???

Il est souvent utile de préciser les "**acteurs**" de certains concepts et permettre de répondre à certaines interrogations comme qui ? quoi ? quand ? où ? comment ? pourquoi ?

On va donc créer les concepts suivants :

#### &#11033;**Qui**

!!! quote "**[Qui.I.A, Qui.II](https://usito.usherbrooke.ca/d%C3%A9finitions/qui#A2Ab6Cbd21157e47)**"
    **I** Pron. interr. (généralement masculin singulier) Sert à représenter une personne. **A** (dans l'interrogative directe)<br>**II** Pron. rel. **1** (sujet) Sert à représenter une personne ou une chose.<br>**II** Pron. rel. **2** (complément) Sert à représenter une personne.



#### &#11033;**Quoi**

!!! quote "**[Quoi.I.A, Quoi.II.A](https://usito.usherbrooke.ca/d%C3%A9finitions/quoi#ce8c99bd27052e53)**"
    **I** Pron. interr. m. sing. Sert à représenter une chose. **A** (dans l'interrogative directe)<br>**II** Pron. rel. m. sing. **1** (complément introduit par une préposition) Sert à représenter une chose.



#### &#11033;**Où**

!!! quote "**[Où.I.1, Où.II](https://usito.usherbrooke.ca/d%C3%A9finitions/où#ff413fEd19686e50)**"
    **I** Pron. rel. (avec une valeur adverbiale) **1** Sert à marquer le lieu.<br>**II** Adv. (lieu)



#### &#11033;**Quand**

!!! quote "**[Quand.II.2](https://usito.usherbrooke.ca/d%C3%A9finitions/quand#ff8ABbd42410e286)**"
    **II** Adv. (temps) **1** À quel moment.



#### &#11033;**Comment**

!!! quote "**[Comment.I.1](https://usito.usherbrooke.ca/d%C3%A9finitions/comment#F6F8F31d53692e61)**"
    **I** Adv. **A** De quelle manière, par quel moyen.



#### &#11033;**Pourquoi**

!!! quote "**[pourquoi.I.A, pourquoi.II](https://usito.usherbrooke.ca/d%C3%A9finitions/pourquoi#fff9FEcd36166e45)**"
    **I** Adv. **A** Pour quelle raison.<br>**II** N. m. inv. **1** Cause, motif.<br>**II** N. m. inv. **2** Interrogation sur les causes, sur les motifs de qqch.



### Notion "d'*Ordre*"

Dès lors qu'on a besoin de comparer et de trier les choses, on doit définir la notion d'ordre : Avant &lt; Après, Inférieur &lt; Supérieur, Moins &lt; Plus, Petit &lt; Grand, Léger &lt; Lourd, Près &lt; Loin, Lent &lt; Rapide, etc.

On commence par remarquer que le point commun de tous ces exemples est qu'on est capable de les représenter sur un **axe** : le temps, la taille, la force, le poids, la distance, la vitesse, etc. — Par exemple, Petit et Grand auront des *valeurs*, des *positions* le long de l'axe de la taille.

Pour pouvoir ordonner des *positions* le long d'un axe, on va commencer par définir les notions suivantes :

&#11033;**Précédent**

!!! quote "**[Précédent.I](https://usito.usherbrooke.ca/d%C3%A9finitions/précédent#BE4Bebfcd8057e46)**"
     **I** Adj. Qui est situé immédiatement avant qqch. d'autre.



&#11033;**Suivant**

!!! quote "**[Suivant.I.A](https://usito.usherbrooke.ca/d%C3%A9finitions/suivant#A7CA0AFd48464e43)**"
      **I** **A** Adj. Qui se trouve, qui vient, qui se produit immédiatement après, derrière, à la suite de qqch.



On va ainsi pouvoir définir le concept de **séquence** :

&#11033;**Séquence**<br>

!!! quote "**[Séquence.1](https://usito.usherbrooke.ca/d%C3%A9finitions/séquence#FF069ABd29502e34)**"
      **1** Suite ordonnée d'éléments, d'opérations, de phases.



#### Exemple

On peut définir une phrase comme une séquence de mots (cf. [le paragraphe où l'on va définir les symboles](#notion-de-lettres-mots-et-phrases)) :

&#11033;**Phrase**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Séquence**

Puis construire la phrase particulière "mon exemple de phrase" de cette manière :

&#11033;**"Mon exemple de phrase"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Phrase**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**"mon"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**"exemple"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**"de"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**"phrase"**<br>



!!! note
    On note ici que les concepts entre guillemets comme **&#11033;"mon"** sont des instances de *mots*. C'est-à-dire que le concept du mot **"mon"** est défini ailleurs et qu'on y fait simplement référence pour l'employer dans cette instance de phrase...



### Notion de contraire

On vient de voir la notion d'ordre et les grandeurs représentables sur un axe.

Souvent, en plus d'être ordonnées, ces grandeurs peuvent également avoir des **contraires** — Petit est le contraire de grand. Maigre est le contraire de gros. Précédent est le contraire de suivant.

!!! quote "**[Contraire.II](https://usito.usherbrooke.ca/d%C3%A9finitions/contraire#F8B8dFad6203e114)**"
      **II** N. m. **1** Ce qui s'oppose par le plus grand écart possible à une chose.<br>**II** N. m. **2** Mot qui s'oppose à un autre par le sens.

#### Exemple

C'est une relation bidirectionnelle non ordonnée qu'on va pouvoir utiliser comme ceci :

&#11033;**A**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Contraire**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**B**

Ou bien comme cela :

&#11033;**Contraire**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**A**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**B**



### Notion **d'Ensemble**

On manipule très souvent des **groupes** ou des **ensembles** de choses, ou bien des **parties** de ces ensembles.

On va donc définir &#11033;**Ensemble** :

!!! quote "**[Ensemble.3](https://usito.usherbrooke.ca/d%C3%A9finitions/ensemble_2#E9f0Eed53083e239)**"
      **3** Groupe d'éléments assemblés.

Ainsi que &#11033;**Partie** :

!!! quote "**[Partie.1](https://usito.usherbrooke.ca/d%C3%A9finitions/partie#dc1D0dFd54914e37)**"
      **1** Élément, portion d'un tout, considéré dans ses rapports avec ce tout.



#### Exemples

La séquence qu'on a définie précédemment est un ensemble d'éléments qui se suivent :

&#11033;**Séquence**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Ensemble**



Si l'on veut utiliser la notion de partie, on va généralement écrire :

 &#11033;**Partie**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033; &lt; la chose dont on fait partie &gt;

Par exemple, on peut établir qu'un doigt est une partie de la main comme ceci :

&#11033;**Doigt**<br>&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Partie**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;&#11033;**Main**



### Contexte d'existence

Histoire(histoire.II.1)			// Ref sur la définition II.1 de "Histoire" en utilisant la hiérarchie de définitions (Macro sens.Méso sens.Sens)

// L'histoire de toute chose, par défaut
Réalité(réalité.3)	// Déf Réalité.3 = Chose, fait, événement qui constitue le monde de l'être humain.
	est
		Histoire



### Temps

Temps(temps.I,.B)	// Def I:   Milieu indéfini et homogène dans lequel se situent les êtres et les choses et qui est caractérisé par sa double nature, à la fois continuité et succession.
					// Def I.A: Durée indéterminée et continue; fragment de cette durée.
					// Def I.B: Succession.
	est Abstrait

	// Nuage de mots
	"Séquence d'événements, suite, déroulement"

// instant_2.1: Petit espace de temps, moment très court.
// instant_2.2: Espace de temps précis, généralement considéré par rapport à ce qui le caractérise.
// moment.I.1: (Petit) espace de temps.
// moment.I.2: Espace de temps précis, situé dans une durée et généralement considéré par rapport à ce qui le caractérise.
Instant, Moment	// L'idée étant de décrire l'équivalent de "Position" pour l'espace
	est Temps

Durée			// durée.1: Intervalle de temps déterminé pendant lequel se produit une action, un état, un phénomène, du début à sa fin.
				// L'idée étant de décrire l'équivalent de "Taille" pour l'espace
	est Temps



### Relation

// Par défaut bidirectionnelle, non-ordonnée, symétrique (cousin, frère, père, attaché, contraire, aligné, etc.)
Relation(relation.II.1)	// Lien, rapport entre deux choses.



### Notion de lettres, mots et phrases

Caractère(caractère.I.1)	// Signe appartenant à un système d'écriture.

// C'est le terme utilisé en linguistique, peut-être un peu trop spécifique pour nos besoins...
//Signe(signe.II.4)			// Graphème ou caractère ayant une valeur donnée dans un système d'écriture.

Chiffre(chiffre.1)			// Caractère servant à représenter un nombre.
	est Caractère
Lettre(lettre.I.1)			// Chacun des signes graphiques dont l'ensemble constitue un alphabet servant à transcrire une langue
	est Caractère
Symbole(symbole.II.3)		// Signe choisi par convention pour désigner qqch.
	est Caractère

Mot(mot.1)	// Son ou groupe de sons articulés ou figurés graphiquement, constituant une unité porteuse de signification.
	Séquence
		de
			Lettre
			Phonème
	Sens

Phrase(phrase.I.1)	// Assemblage, oral ou écrit, de mots dont la construction présente un sens complet.
	Séquence
		de Mot
	Sens



!!! warning
    Il faut bien distinguer le concept de lettre, de celui de signe dessiné : &#11033;**A** et &#11033;**"A"** sont 2 choses différentes !



### **TODO**

- Une grandeur ? Une comparaison ? Une relation d'ordre ?
- La multitude ou la singularité ?
- Les exclusions ? Les contraires ? La négation ?
- Un contexte d'existence ? (réalité / histoire / rêve)
- Un lien ? Une relation ?
- Un tag de temps ? Une durée ?
- Un symbole (lettre, chiffre) ? Une collection de symboles (mots, nombres) ? ==> A distinguer de la valeur réelle ! On parle ici de représentation symbolique (càd de l'écriture) d'une valeur !



## Mémoire Associative

La création de nombreuses structures conceptuelles va implicitement mener à une utilisation, et donc à des **références** des concepts entre eux.

Ces références peuvent être vues comme des liens, des connexions entre les concepts. Ces connexions ont la même signification et la même teneur que 2 neurones connectés entre eux par leur axones et leur synapses :

<img src="..\images\Concepts\Neuron.png" style="zoom:33%;" />

On va donc rapidement obtenir un **graphe conceptuel** — qu'on appelle souvent un *knowledge graph* — où les concepts vont représenter les *nœuds* du graphe, tandis que les références vont représenter les *arêtes* du graphe.

<img src="..\images\Concepts\Connectome.jpg" style="zoom:40%;" />



### Activation des neurones conceptuels

À l'instar de leurs homologues biologiques, nos "neurones conceptuels" vont pouvoir être activés et activer leurs voisins à leur tour. Mais de quelle manière ?

En effet, si un neurone active tous ses voisins, qui a leur tour activent tous leurs voisins, on va rapidement se retrouver avec une réaction en chaîne exponentielle et un réseau "épileptique" où tous les nœuds seront activés en même temps !

On notera déjà que la notion de temps est fondamentale dans les cycles d'activation des neurones biologiques : tous les neurones ne peuvent s'activer strictement "en même temps", il y a un délai de propagation minimal :

<img src="..\images\Concepts\Neuron Timing.jpg" style="zoom:60%;" />

!!! remark "Remarque"
    Il faut bien comprendre que le potentiel d'action issu du coeur du neurone (le *soma*) ne va pas se propager comme dans un fil électrique mais sauter de proche en proche, comme une onde le long d'une corde. Par conséquent, la longueur de l'axone et d'autre facteurs qu'on va voir ci-dessous vont déterminer la vitesse de propagation de ce potentiel d'action.



#### Neurones biologiques

Le neurone biologique va pouvoir jouer sur plusieurs facteurs pour intégrer les stimuli et les propager à ses voisins :

* **Le temps de la période réfractaire**
    * C'est le temps pendant lequel un 2nd potentiel d'action ne peut se produire
    * À noter qu'il y a 2 type de périodes réfractaires :
        * Absolue : aucun pic d'action, quelle que soit la force du stimulus
        * Relative : un pic d'action peut se produire, à condition d'un stimulus bien plus fort que le seuil normal
    * C'est la raison principale pour laquelle on n'est pas en crise épileptique permanente !
    * C'est un mécanisme assez rigide qui n'a pas l'air d'être pilotable au niveau cellulaire individuel
    * :white_check_mark: C'est probablement quelque chose dont on va vouloir s'inspirer dans notre implémentation !
* **Le seuil d'activation**
    * C'est la quantité de charges nécessaire pour déclencher le pic de potentiel d'action
    * C'est un mécanisme assez souple qui est facilement pilotable au niveau cellulaire individuel et qui confère une grande plasticité au cerveau
    * :white_check_mark: C'est aussi quelque chose qu'on va vouloir émuler dans notre graphe
* **Une mécanique interne d'intégration des stimuli**
    * Les neurones ne sont pas simplement des détecteurs de dépassement de seuils mais peuvent comporter un mécanisme interne bien plus complexe[^1] pour déterminer s'il doivent s'activer ou non
    * :no_entry: On va s'arrêter à une notion binaire d'activation pour nos concepts, on ne veut pas pousser le mimétisme trop loin et en faire de véritables petits processeurs
* **La longueur de la connexion aux voisins via l'axone et la vitesse de propagation aux voisins**
    * Cela va dépendre du taux de myélinisation de l'axone (une sorte de gangue qui entoure plus ou moins l'axone et lui permet de réguler la vitesse de transmission des potentiels d'action)
        * Un axone fortement myélinisé de 10µm de diamètre va conduire le potentiel d'action à 100m/s et provoquera des pics d'activation de 0.5ms
        * Un axone moyennement myélinisé de 5µm de diamètre va conduire le potentiel d'action à 10m/s et provoquera des pics d'activation de 1ms
        * Un axone faiblement myélinisé < 1µm de diamètre va conduire le potentiel d'action à 1m/s et provoquera des pics d'activation de 2ms
    * En gros, la myélinisation consiste à faire "sauter" les potentiels d'action de proche en proche et ainsi accélérer leur propagation
    * C'est un mécanisme assez souple qui est facilement pilotable au niveau cellulaire individuel et qui confère une grande plasticité au cerveau
    * :no_entry: Je peux sans doute me tromper mais pour l'instant on va ignorer cette propriété qui joue sur la vitesse de transmission des stimuli
* **La connexion elle-même**
    * Les neurones vont "choisir" vers quels autres neurones se connecter en guidant leurs appendices qui vont chercher une cible ([vidéo](https://www.youtube.com/watch?v=Rvmvt7gscIM&ab_channel=DrLilaLandowski))
        * On suppose que la recherche de la "cible" est probablement guidée par un suivi de gradient chimique ?
    * C'est un mécanisme relativement souple qui s'étalent sur une échelle de temps de plusieurs dizaines d'heures
    * :ok: Ici on va évidemment modifier notre graphe régulièrement et donc bien entendu qu'on s'inspirera de ce mécanisme...



#### Neurones conceptuels

Comme pour les autres sujets (approche neuro-symbolique et apprentissage), on ne va pas reproduire les mécanismes chimiques microscopiques qui se passent dans le cerveau mais on va rester au niveau macroscopique :

* On va propager les activations par vagues et lever des *flags* dans chaque concept pour empêcher plusieurs pics
    * Comme la vague d'activation se propage de manière exponentielle, il est aisé de calculer le nombre de vagues de propagation nécessaires pour couvrir tout le graphe : $N_{vagues} \approx log( nodes ) / log( \hat{N}_{edges} )$ où $\hat{N}_{edges} = edges / nodes$ donne le nombre moyen d'arêtes par nœud du graphe
    * En pratique, on va utiliser un *timestamp* indiquant le numéro de *round* d'activation plutôt qu'un *flag*. Ce *timestamp* sera incrémenté à la fin du round, quand on aura fini de propager $N_{vagues}$ d'activation. Un nœud qui aura déjà été visité par une vague du même *round* ne pourra plus être activé à nouveau (période réfractaire)
        
* On va probablement vouloir propager des activations en *floats* pour pouvoir émuler le fait que les noeuds n'ont pas tous la même "puissance de stimulation"
    * En effet, un nœud central qui possède beaucoup de références aura de fortes chances d'être activé souvent, on voudra donc probablement pondérer ses activations par $1/N_{références}$
        * On pense par exemple au cas d'une structure hiérarchique où la direction ***enfant → parent*** doit avoir moins de poids que la direction ***parent → enfant***, sinon on va se retrouver très rapidement à activer l'intégralité du graphe...
            
* :warning: Contrairement aux réseaux de neurones artificiels classiques, on ne vas **pas** faire varier le poids des connexions du graphe
    * On pourrait en effet imaginer qu'on pourrait simuler le seuil d'activation ou la myélinisation des connexions à l'aide de poids variables qu'on va pouvoir apprendre au fur-et-à-mesure de l'utilisation du graphe
        * Mais comme le graphe va être amené à évoluer en permanence, ça impliquerait de devoir revoir l'évaluation des poids du graphe à chaque instant
    * Je préfère que les poids d'activation soient fixes et qu'on travaille à partir des *valeurs d'activations relatives* d'un concept par rapport à un autre
        * Typiquement si l'on active un concept avec une valeur de $10$ et qu'on propage cette activation avec un facteur d'atténuation de 50% alors son voisin aura une valeur de $10/2$ , le suivant une valeur de $10/4$, etc.
            * On pourra donc calculer l'importance d'un concept en la rapportant à la valeur maximale de $10$ : le voisin aura donc une importance de 50%, le suivant 25%, etc.
        * C'est à la charge de l'algorithme de [raisonnement](RaisonnementSymbolique.md) d'accorder de l'importance aux concepts en fonction de leur valeur d'activation relative



### Fonctionnement de la mémoire associative

Une fois les détails techniques d'activation du graphe réglés, on peut enfin se pencher sur le fonctionnement de cette mémoire associative.

Cette mémoire va nous permettre de réaliser facilement un mécanisme d'attention en activant des concepts particuliers qui, en retour, activeront les concepts connexes.

J'aime me représenter ce mécanisme comme un paysage de haute dimension dans lequel on va isoler un *domaine* (en jaune, ci-dessous) où les activations des 3 concepts illustrés seront maximales :

![](images\Concepts\Associative Memory Highlighting.jpg)



!!! warning ""
    Ici il ne faut pas confondre l'algorithme de propagation de vagues d'activation avec celui de *gradient descent* : même si les activations seront maximales au niveau des concepts "source" (c-à-d les mots-clés de notre recherche), on ne cherche pas à suivre un gradient d'activation !



En réalité, le *manifold* sur lequel l'algorithme va fonctionner n'a rien d'un paysage et on va simplement faire monter les poids d'activation de chaque concept en fonction de ses connexions. Ces poids représenteront ensuite le niveau d'attention qu'on doit porter aux autres concepts et serviront donc d'entrée à des algorithmes de [raisonnement](RaisonnementSymbolique.md) qui pourront ensuite prendre des décisions sur le déroulement de leurs procédures et les décisions à prendre.



### Exemple de la désambiguïsation sémantique

Prenons un exemple très important : celui de résoudre l'ambiguïté d'un mot dans une phrase.

#### De multiples sens

Prenons le mot "*nucléaire*", on trouve 3 définitions dans le [dictionnaire Usito](https://usito.usherbrooke.ca/d%C3%A9finitions/nucl%C3%A9aire) :

1. Relatif au noyau de la cellule. (biologie)
2. Relatif au noyau de l'atome. (physique)
3. Famille *nucléaire*. (sociologie)

On [se rappelle](ReprésentationSymbolique.md#un-concept-est-unique) qu'un concept correspond grosso modo à une définition du dictionnaire. Donc si on lit le mot "*nucléaire*" dans un texte, il est important de savoir à quelle définition on fait référence.

#### Activation des mots du texte

1. Si l'on active chacune des 3 définitions dans le graphe, on va également activer dans une moindre mesure tous les termes connexes dans les 3 domaines listés : biologie, physique et sociologie.
2. Imaginons que dans le même texte on rencontre par la suite le mot "*centrale*", il est alors probable que les termes connexes dans le domaine de la physique prennent encore un peu plus d'importance puisque les mots "*centrale*" et "*nucléaire*" sont souvent proches l'un de l'autre.
3. Finalement, si on rencontre le mot "*combustible*" alors on va commencer à avoir de sérieux indices qu'il s'agit là d'un texte sur l'énergie nucléaire.

Il est probable qu'on arrive ainsi très vite à déterminer la définition correcte du mot "*nucléaire*" à employer.

De même que la désambiguïsation du mot nucléaire servira à son tour pour qualifier correctement les définitions d'autres mots ambigus.



!!! remark "Remarque"
     Ça ressemble aux modèles [*bag-of-words*]() et [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) mais en beaucoup moins naïf puisqu'on ne fait pas que compter des occurrences de mots de manière indéterminée et désordonnée.<br>On construit nos ***éléments de preuve*** au fur-et-à-mesure qu'on lit le texte, les activations jouent également un rôle dans la compréhension et la construction de la structure grammaticale de la phrase.



#### Le choix des mots

Doit-on activer tous les mots de la même manière ? Il est évident que certains mots sont plus porteurs de sens que d'autres.

Au fur-et-à-mesure qu'on va apprendre les mots du vocabulaire de la langue française, on va pouvoir également dresser un bilan de leur **fréquence d'apparition** dans les textes qui sera indicative de l'importance qu'on doit leur accorder.

On retrouve encore une fois cette notion de *self-information* ou de *surprise* dont on a déjà parlé dans [l'algorithme d'apprentissage](FondementsApprentissage.md#ponderer-leffet-des-exemples) :

$$s(x)=log\left(\frac{1}{p(x)}\right)$$

Où $p(x)$ est la probabilité d'occurrence de l'événement $x$.

Dans ce cas, on pose :

$$p(x)= \frac{ \left| \{w \in W | w = x \} \right| }{ \left| W \right| }$$

Où $W$ représente l'ensemble des mots qu'on a lus — pas seulement dans ce texte-ci mais depuis qu'on a commencé à apprendre à lire.

!!! example "Exemple"
     Dans la langue française, sur 700,000 mots étudiés on relève 26,541 occurrences du verbe "*être*", ce qui impliquerait que $p(\text{"être"})=0.038$ et la surprise serait de $s(\text{"être"})=4.72$.<br><br>Tandis que le mot nucléaire apparaîtrait environ 426 fois sur un total de 12,561,968 mots étudiés, ce qui impliquerait que $p(\text{"nucléaire"}) = 0.000034$ et la surprise serait de $s(\text{"nucléaire"}) = 14.8$ soit environ 3 fois plus importante que "*être*" !



On voit donc qu'un mot peu fréquent portera plus de sens et se verra accordé plus d'importance qu'un mot utilisé fréquemment.



### Multi-Head Attention

Les LLMs possèdent plusieurs "*têtes d'attention*" (*attention heads*) par *layer* de *transformer* (cf. cette [note](PolysémieLLM.md#features-observees) sur les LLMs). Chaque tête d'attention sera chargée de différentes tâches :

* Des tâches de bas-niveau dans les premières couches, comme : détecter des sommes d'argent, des morceaux de code, des titres honorifiques, des séquences d'ADN, des caractères hébreux, cyrilliques ou arabes, etc.
* Des tâches de niveau intermédiaire dans les couches suivantes, comme détecter des attributs grammaticaux et les regrouper pour décorer les mots centraux de la phrases (c-à-d ceux qui portent le plus de sens)
* Des tâches de haut-niveau dans les couches finales (juste avant la re-tokenization) qui vont effectuer les combinaisons de l'équivalent de nos concepts dans le but de simuler un semblant de "raisonnement" (le fait que les LLMs sont doués de raisonnement fait encore débat au moment où j'écris)

Chaque tête d'attention va donc travailler dans son propre contexte et former son propre *vecteur d'attention* qui sera ensuite combiné avec celui des autres têtes via un *multilayer perceptron* (MLP) avant d'être finalement envoyé au *layer* suivant.

Sur le même modèle, on va probablement vouloir lancer les activations de notre mémoire sémantique **dans leurs propres contextes**, chaque contexte d'activation servant à effectuer une tâche particulière, comme la désambiguïsation de différents mots, la recherche de synonymes, la recherche associative itérative (ou chaque résultat retourné sera raffiné à chaque fois avec un nouveau critère de recherche), etc.





## Causes et effets

**TODO!**



# Plan

* Raisonnement à partir des structures de concepts
    * Comment lire une question et y répondre ?
* Peut-on comprendre de manière non ambiguë même si l'on attache les concepts n'importe comment ? Ou doit-on respecter une hiérarchie particulière ?
* La question est : comment généralise-t-on ça aux actions et aux procédures ? À la planification (réentrance, récursion) ? À la structuration hiérarchique de concepts, et pas juste à des séquences ?
* Opérations sur les concepts
    * Y a-t-il une algèbre de manipulation de concepts ?

* Plausibilité biologique
    * On sait que les neurones sont facilement excitables par des impulsions ou des patterns de fréquences particuliers [^100][^101]
    * Il est donc aisé pour le cerveau de créer des hiérarchies de neurones activés par la présence ou l'absence de certain attributs / features



###### Stuff

?Parler de JollyFiche ?

Backpropagation : https://en.wikipedia.org/wiki/Neural_backpropagation
"On average, a backpropagating spike loses about half its voltage after traveling nearly 500 micrometres."

Site bien foutu pour les symboles unicode : https://symbl.cc/



[^1]:  2021, Beniaguev et al., ["Single cortical neurons as deep artificial neural networks"](https://www.sciencedirect.com/science/article/pii/S0896627321005018)
[^100]: 2024, Kirsanov A., ["How your brain chooses to remember"](https://www.youtube.com/watch?v=ceFFEmkxTLg&ab_channel=ArtemKirsanov)
[^101]: 2024, Yang W. et al. ["Selection of experience for memory by hippocampal sharp wave ripples"](https://www.science.org/doi/10.1126/science.adk8261) ([site](https://winnieyangwannan.github.io/RippleTagging/projects/1_project/)) ([notebook](https://colab.research.google.com/drive/1qwruNxqS20xIl7sXYwjUA5zXKLTMWuTz?usp=drive_link))

[^102]: 2016 https://www.researchgate.net/publication/292978016_Somato-dendritic_Synaptic_Plasticity_and_Error-backpropagation_in_Active_Dendrites
