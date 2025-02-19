# Structures Conceptuelles





## Notation

Les concepts seront représentés par le symbole ⬙ (0x2B19  U+11033  &#11033) suivi de leur nom, généralement en gras.

Par exemple :

&nbsp; ⬙**Oiseau**

&nbsp; ⬙**Rouge**

Les liens avec des concepts "enfants" seront quant à eux indiqués par le symbole ⤷ (&#10551).



### Signification des références entre concepts

On va structurer les concepts hiérarchiquement de cette manière :

⬙**Oiseau**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Rouge**



Mais que signifie l'assignation d'un concept à un autre ?

!!! danger " "
    Dans ma convention, "&#10551;⬙**A**" signifie "**possède la propriété ⬙A**".



Dans l'exemple ci-dessus on crée donc un **lien** ou une **référence bidirectionnelle** entre &#11033;**Oiseau** et &#11033;**Rouge** :

* ⬙**Oiseau** possède la propriété &#11033;**Rouge**
* ⬙**Rouge** est référencé par &#11033;**Oiseau**



Pour continuer en utilisant la langue de la programmation :

* On peut dire ici que ⬙**Oiseau** est une *réalisation*, une *instanciation* du concept **Oiseau** défini globalement "à la racine" : on crée *un exemple d'oiseau*.
* De la même manière, ⬙**Rouge**" est la *réalisation*, *l'instanciation* du concept **Rouge** défini globalement "à la racine" : on crée un exemple de chose rouge.
* Finalement, l'assignation d'une instance de "chose rouge" à une instance d'oiseau va bel et bien créer un exemple d'oiseau possédant la propriété rouge.



## Structures Fondamentales

Pour effectuer des descriptions et des raisonnements, on va avoir besoin de quelques notions fondamentales qu'on se propose d'ébaucher ici.

Ces ébauches n'ont évidemment rien de définitives et si jamais on laisse à un algorithme d'apprentissage la liberté d'apprendre les concepts et les liens en fonction de son expérience, il est probable que ça ne ressemble pas du tout à ce qu'on va tenter de faire ici manuellement. Mais peut-être que ce travail pourra malgré tout servir de base à une construction plus élaborée ?

!!! warning "Attention"
    L'importance et les conventions d'utilisation qu'on va décider d'appliquer aux structures conceptuelles décrites ci-après résident à l'étage du dessus : l'étage du raisonnement. C'est en effet à l'étage du raisonnement qu'on saura par exemple que le concept &#11033;**Contraire** définit un contrat de nature bidirectionnelle et opposée entre les 2 choses qui y sont sujettes, ou bien qu'une séquence ordonnée devra être lue de telle ou telle manière, et ainsi de suite.

!!! note
    Les notations qu'on va voir par la suite peuvent sembler lourdes et pénibles à écrire mais 1) mon langage de description de concepts offre de nombreux raccourcis qui ne nécessitent pas autant d'écriture, 2) on espère bien que la majeure partie des structures seront *apprises automatiquement* et non pas écrites manuellement et 3) tout cela est finalement transcrit en mémoire par un ensemble d'objets possédant des pointeurs sur leurs références, ce qui en fait une structure extrêmement compacte et rapide à traiter par un CPU ou un GPU !



### Notion de "*Type*"

C'est une notion fondamentale dès lors qu'on veut caractériser et classifier quelque chose.

On fait référence ici à ce groupe de définitions :

!!! quote "**⬙Type** ( [**Type.II.B**](https://usito.usherbrooke.ca/d%C3%A9finitions/type#E9E90cd18015e123) )"
    **1** Ensemble des caractères distinctifs de groupes de choses, d'individus, permettant leur classification.<br>**2** Ensemble des caractères (morphologiques, psychiques, ethniques, etc.) qui sont culturellement considérés comme distinguant des groupes humains.<br>**3** Ensemble de caractères, de propriétés, déterminés précisément, qui définissent une série d'objets fabriqués.<br>**4** inform. **type de donnée(s)** ou **type** : en programmation informatique, élément d'une classification de données (entier, chaîne de caractère, tableau, booléen, etc.) qui définit les valeurs que peut prendre une donnée, la manière dont elle est stockée ainsi que les opérateurs qui lui sont applicables.



### Notion "d'*Être*"

C'est une notion complémentaire à la notion de Type puisqu'elle permet *d'attribuer un type* aux choses — en programmation, on parlerait d'*héritage de type*.

On fait ici référence à cette définition du dictionnaire : 

!!! quote "**⬙Être** ( **[Être.II.1](https://usito.usherbrooke.ca/d%C3%A9finitions/%C3%AAtre_1#C736C29d7338e597)** )"
    **II** V. attributif **1** (qualification) Élément verbal liant un sujet à un attribut. ex: *Être paysanne, boucher.*

Ce qui est "amusant" c'est qu'on peut considérer le lien &#10551; comme la propriété "**avoir**". Tandis qu'ici, on vient de définir la qualité "**d'être**".<br>
Et donc écrire :

⬙**Moineau**<br>&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Oiseau**

signifie littéralement "moineau **a** la propriété d'**être** un oiseau".

!!! note
    On notera qu'on peut bien entendu **être** de nombreuses choses à la fois, si tant est qu'elles ne soient pas contradictoires — à la charge de l'algorithme d'apprentissage ou de raisonnement de s'en assurer.<br>De plus, aussitôt qu'un concept **est** quelque chose, il possède automatiquement tous les attributs de cette chose (il en *hérite*).



### Notions de "**questionnement**"

Il est souvent utile de préciser les "**acteurs**" de certains concepts et permettre de répondre à certaines interrogations comme qui ? quoi ? quand ? où ? comment ? pourquoi ?

On va donc créer les concepts suivants :

#### ⬙**Qui**

!!! quote "⬙**Qui** ( **[Qui.I.A, Qui.II](https://usito.usherbrooke.ca/d%C3%A9finitions/qui#A2Ab6Cbd21157e47)** )"
    **I** Pron. interr. (généralement masculin singulier) Sert à représenter une personne. **A** (dans l'interrogative directe)<br>**II** Pron. rel. **1** (sujet) Sert à représenter une personne ou une chose.<br>**II** Pron. rel. **2** (complément) Sert à représenter une personne.



#### ⬙**Quoi**

!!! quote "⬙**Quoi** ( **[Quoi.I.A, Quoi.II.A](https://usito.usherbrooke.ca/d%C3%A9finitions/quoi#ce8c99bd27052e53)** )"
    **I** Pron. interr. m. sing. Sert à représenter une chose. **A** (dans l'interrogative directe)<br>**II** Pron. rel. m. sing. **1** (complément introduit par une préposition) Sert à représenter une chose.



#### ⬙**Où**

!!! quote "⬙**Où** ( **[Où.I.1, Où.II](https://usito.usherbrooke.ca/d%C3%A9finitions/où#ff413fEd19686e50)** )"
    **I** Pron. rel. (avec une valeur adverbiale) **1** Sert à marquer le lieu.<br>**II** Adv. (lieu)



#### ⬙**Quand**

!!! quote "⬙**Quand** ( **[Quand.II.2](https://usito.usherbrooke.ca/d%C3%A9finitions/quand#ff8ABbd42410e286)** )"
    **II** Adv. (temps) **1** À quel moment.



#### ⬙**Comment**

!!! quote "⬙**Comment** ( **[Comment.I.1](https://usito.usherbrooke.ca/d%C3%A9finitions/comment#F6F8F31d53692e61)** )"
    **I** Adv. **A** De quelle manière, par quel moyen.



#### ⬙**Pourquoi**

!!! quote "⬙**Pourquoi** ( **[pourquoi.I.A, pourquoi.II](https://usito.usherbrooke.ca/d%C3%A9finitions/pourquoi#fff9FEcd36166e45)** )"
    **I** Adv. **A** Pour quelle raison.<br>**II** N. m. inv. **1** Cause, motif.<br>**II** N. m. inv. **2** Interrogation sur les causes, sur les motifs de qqch.





### Notion **d'Ensemble**

On manipule très souvent des **groupes** ou des **ensembles** de choses, ou bien des **parties** de ces ensembles.

On va donc définir :

!!! quote "&#11033;**Ensemble** ( **[Ensemble.3](https://usito.usherbrooke.ca/d%C3%A9finitions/ensemble_2#E9f0Eed53083e239)** )"
      **3** Groupe d'éléments assemblés.



!!! note
    Il s'agit ici d'ensembles **non ordonnés**. On verra juste après comment traduire le concept d'**Ordre**.



Et on va définir :

!!! quote "&#11033;**Partie** ( **[Partie.1](https://usito.usherbrooke.ca/d%C3%A9finitions/partie#dc1D0dFd54914e37)** )"
      **1** Élément, portion d'un tout, considéré dans ses rapports avec ce tout.



Si l'on veut utiliser la notion de partie, on va généralement écrire :

 &#11033;**Partie**<br>&nbsp;&nbsp;&nbsp;⤷&#11033;**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033; &lt; *la chose dont on fait partie* &gt;



#### Exemples

Par exemple, on peut établir qu'un doigt est une partie de la main comme ceci :

&#11033;**Doigt**<br>&nbsp;&nbsp;&nbsp;⤷&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Partie**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033;**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033;**Main**

Et on aura automatiquement — *en miroir* — la construction d'un ensemble :

&#11033;**Main**<br>&nbsp;&nbsp;&nbsp;⤷&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Ensemble**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;⬙**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033;**Doigt**



!!! note
    Il est probable que certaines constructions puissent être *inférées* automatiquement et qu'on n'ait pas à les entrer péniblement à la main ou à les stocker où que ce soit : elles peuvent être générées *procéduralement*. Ici, il est évident de déduire implicitement qu'un doigt fait partie d'une main si on a préalablement décrit qu'une main est un ensemble de doigts...

Mais on peut également écrire :

&#11033;**Main**<br>&nbsp;&nbsp;&nbsp;⤷&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Ensemble**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033;**Pouce**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033;**Index**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10551;⬙**Majeur**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Annulaire**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷&#11033;**Auriculaire**&nbsp;

Avec :

&#11033;**Index**<br>&nbsp;&nbsp;&nbsp;⤷&#11033;**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Doigt**<br>

(idem pour les autres doigts)

On voit donc que selon le degré d'information dont on dispose (connaît-on le nom individuel des doigts ou non ?), on va agencer notre structure différemment, sans pour autant que le sens change : on aura toujours 5 doigts à une main.



### Notion **d'*Ordre***

Dès lors qu'on a besoin de comparer et de trier les choses, on doit définir la notion d'ordre : Avant &lt; Après ; Inférieur &lt; Supérieur ; Moins &lt; Plus ; Petit &lt; Grand ; Léger &lt; Lourd ; Près &lt; Loin ; Lent &lt; Rapide, etc.

On remarque immédiatement que le point commun de tous ces exemples est qu'on est capable de les représenter le long d'un **axe** : le temps, la taille, la force, le poids, la distance, la vitesse, etc. — Par exemple, *Petit* et *Grand* auront des *valeurs*, des *positions* le long de l'axe de la taille.

Pour pouvoir ordonner des *positions* le long d'un axe, on va commencer par définir les notions suivantes :

!!! quote "⬙**Précédent** ( **[Précédent.I](https://usito.usherbrooke.ca/d%C3%A9finitions/précédent#BE4Bebfcd8057e46)** )"
     **I** Adj. Qui est situé immédiatement avant qqch. d'autre.



!!! quote "⬙**Suivant** ( **[Suivant.I.A](https://usito.usherbrooke.ca/d%C3%A9finitions/suivant#A7CA0AFd48464e43)** )"
      **I** **A** Adj. Qui se trouve, qui vient, qui se produit immédiatement après, derrière, à la suite de qqch.



On va ainsi pouvoir définir le concept de **séquence** :

!!! quote "⬙**Séquence** ( **[Séquence.1](https://usito.usherbrooke.ca/d%C3%A9finitions/séquence#FF069ABd29502e34)** )"
      **1** Suite ordonnée d'éléments, d'opérations, de phases.



On notera que la séquence est un cas particulier d'ensemble où les éléments qui composent la séquence ne seront pas stockés au même niveau hiérarchique :

⬙**Séquence**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Ensemble**



#### Exemples

On peut définir une phrase comme une séquence de mots (cf. [le paragraphe où l'on va définir les symboles](#notion-de-lettres-mots-et-phrases)) :

⬙**Phrase**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Séquence**

Puis construire la phrase particulière "**mon exemple de phrase**" de cette manière :

⬙**"mon exemple de phrase"**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Phrase**<br>&nbsp;&nbsp;&nbsp;⤷⬙**"mon"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"exemple"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"de"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"phrase"**<br>



!!! note
    On note ici que les concepts entre guillemets comme ⬙**"mon"** sont des *instances de mots*. C'est-à-dire que le concept du mot **"mon"** est défini ailleurs et qu'on y fait simplement référence pour l'employer dans cette instance de phrase...



### Notion de "**Contraire**"

On vient de voir la notion d'ordre et les grandeurs représentables le long d'un axe.

Bien souvent, en plus d'être ordonnées, ces grandeurs peuvent également avoir des **contraires** — petit est le contraire de grand ; maigre est le contraire de gros ; précédent est le contraire de suivant, etc.

On va donc définir :

!!! quote "⬙**Contraire** ( **[Contraire.II](https://usito.usherbrooke.ca/d%C3%A9finitions/contraire#F8B8dFad6203e114)** )"
      **II** N. m. **1** Ce qui s'oppose par le plus grand écart possible à une chose.<br>**II** N. m. **2** Mot qui s'oppose à un autre par le sens.



#### Exemples

C'est une *relation bidirectionnelle non ordonnée* qu'on va pouvoir utiliser comme ceci :

⬙**A**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Contraire**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**B**

Ou bien comme cela :

⬙**Contraire**<br>&nbsp;&nbsp;&nbsp;⤷⬙**A**<br>&nbsp;&nbsp;&nbsp;⤷⬙**B**

Par exemple :

⬙**Contraire**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Petit**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Grand**



#### Contraires complexes

Comme on l'a déjà fait remarquer dans la notion d'ensemble et de partie, les 2 notions sont contraires l'une de l'autre et donc :

⬙**Contraire**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Ensemble**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Partie**

Mais ici il ne s'agit pas seulement d'une grandeur "miroir" le long d'un axe : les 2 notions étant *complémentaires*, c'est l'entièreté de la structure d'*ensemble* et de *partie* qui sont en miroir l'une de l'autre !

De fait, dès lors que l'une des 2 structures existe, il est possible de *créer automatiquement l'autre*.

Le doigt fait partie de la main ? → La main est un ensemble de doigts !



### Notion de **Quantité**

Dès lors qu'un ensemble de choses est **dénombrable**, on doit pouvoir spécifier une **quantité** :

!!! quote "**⬙Quantité** ( **[Quantité.1, Quantité.3](https://usito.usherbrooke.ca/d%C3%A9finitions/quantité#E224EC4d51250e40)** )"
       **1** Nombre ou mesure déterminant des choses considérées dans un ensemble homogène ou dans une portion de matière.<br>**3** Caractéristique mesurable ou nombrable; tout ce qui est susceptible de plus ou de moins.



Avec la notion de quantité, on utilise souvent la notion de **nombre** qui permet d'indiquer une grandeur, une valeur qu'on va pouvoir assigner à cette propriété de quantité :

!!! quote "**⬙Nombre** ( **[Nombre.1](https://usito.usherbrooke.ca/d%C3%A9finitions/nombre#e65BebDd29708e37)** )"
       **1** Concept de base des mathématiques et notion fondamentale de l’entendement qui sert à compter, classer et mesurer.<br>(on pourrait aussi se référer à **Valeur.II.1** *Mesure d'une grandeur, d'une quantité variable.* ?)



#### Exemples

Pour décrire le fait qu'une main possède 5 doigts :

⬙**Main**<br>&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Ensemble**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Doigt**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quantité**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"5"**<br>

Ici on voit que ⬙**"5"** représente une instance du nombre 5 défini quelque part ailleurs, un peu à la manière des mots d'une phrase qu'on va référencer :

⬙**5**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Nombre**

Mais on peut représenter aussi d'autres notations comme des constantes bien connues :

⬙**$\pi$**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Nombre**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Irrationnel**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Transcendantal**<br>



Ou bien la notation scientifique :

⬙**$1.75e^{-4}$**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Nombre**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Mantisse**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"1.75"**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Exposant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"-4"**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Base**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"10"**<br>



### Notion de "**Contexte d'Existence**"

Comme évoqué rapidement [dans une autre note](ReprésentationSymbolique.md#changement-abrupt-de-sens), une instance de concept ne peut exister que dans un contexte donné.

Par exemple :

* Dans la réalité
* Dans notre imagination ou dans un rêve
* Dans une histoire racontée

J'ai arbitrairement décidé d'appeler ⬙**Histoire** le concept qui servira de base aux contextes d'existence :

!!! quote "⬙**Histoire** ( **[Histoire.II.1](https://usito.usherbrooke.ca/d%C3%A9finitions/histoire#E713Edd49018e364)** )"
    **II** **1** Récit concernant un fait historique ou ordinaire; narration d'événements fictifs ou non.



#### Exemples

Par défaut, les événements se passent dans la réalité :

!!! quote "⬙Réalité ( [**Réalité.3**](https://usito.usherbrooke.ca/d%C3%A9finitions/r%C3%A9alit%C3%A9#EE2C8a9d12051e77) )"
    **3** Chose, fait, événement qui constitue le monde de l'être humain.

⬙**Réalité**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Histoire**<br>

On peut définir un livre qui va raconter une histoire de cette manière :

⬙**"Le père Goriot"**<br>&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Livre**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Histoire**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Eugène de Rastignac**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Personnage**<br>

On voit ici qu'on a défini un personnage, *Eugène de Rastignac*, dont l'existence ne dépassera pas celle du livre.



### Notion de **Temps**

En plus de la notion de contexte d'existence, et pour répondre à la question "quand ?", on a besoin de définir la notion de **Temps** :

!!! quote "⬙**Temps** ( [**Temps.I.A, Temps.I.B**](https://usito.usherbrooke.ca/d%C3%A9finitions/temps#ff5a3eBd15327e49) )"
    **I** Milieu indéfini et homogène dans lequel se situent les êtres et les choses et qui est caractérisé par sa double nature, à la fois continuité et succession.<br>**I** **A** Durée indéterminée et continue; fragment de cette durée.<br>**I** **B** Succession.

#### Instant et Moment

Pour mesurer une *position* sur l'axe du temps, on va avoir besoin de définir la notion d'**instant** :

⬙**Instant**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Temps**<br>

!!! quote "⬙**Instant** ( [**Instant.1, Instant.2**](https://usito.usherbrooke.ca/d%C3%A9finitions/instant_2#E63FC2Ed42864e36) )"
    **1** Petit espace de temps, moment très court.<br>**2** Espace de temps précis, généralement considéré par rapport à ce qui le caractérise.

A noter que "[moment](https://usito.usherbrooke.ca/d%C3%A9finitions/moment)" possède presque exactement les mêmes définitions et pourrait tout aussi bien convenir.



#### Durée

Pour mesurer un *intervalle* sur l'axe du temps, on va avoir besoin de définir la notion de **durée** :

!!! quote "⬙**Durée** ( [**Durée.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/durée#eed8603d11853e33) )"
    **1** Intervalle de temps déterminé pendant lequel se produit une action, un état, un phénomène, du début à sa fin.

⬙**Durée**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Temps**<br>



#### Dates

Même si on se sert des dates et des heures de la journée pour indiquer des *positions* ou des *instants* dans le temps, ces notions sont à mon sens toutes basées sur des durées : un mois dure 31 jours, un jour dure 24 heures, une heure dure 3600 secondes, etc.

Par conséquent on va définir un jour  de cette manière :

⬙**Jour**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Durée**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Heure**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quantité**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"24"**

!!! warning " "
    On voit ici un bel exemple de l'ambiguïté et de l'interchangeabilité de nos concepts où instant et durée semblent parfois revêtir un usage ou l'autre selon les besoins. Choisir une définition particulière semble un choix arbitraire et rigide qui colle peu avec le côté mouvant de la pensée humaine...



### Relation

Une notion extrêmement importante est la notion de *relation* entre 2 choses.

!!! quote "⬙**Relation** ( [**relation.II.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/relation#ddA3b2ad25086e74) )"
     **II** **1** Lien, rapport entre deux choses.



Il s'agit toujours de définir la position relative de 2 choses l'une par rapport à l'autre :

* elle peut être spatiale
    * collé, devant, en haut, par-dessus, à travers, posé sur, etc.
* ou bien sociale
    * frère, cousin, épouse, enfant, ami, patron, président, etc.



Certaines relations sont bidirectionnelles, non-ordonnées et/ou *symétriques* :

* cousin, frère, père, ami, attaché, contraire, aligné, etc.

Tandis que d'autres impliquent une notion d'ordre et sont donc implicitement comparables et souvent munies de contraires :

* devant / derrière, au-dessus / en-dessous, supérieur hiérarchique / subordonné, etc.



### Notion de lettres, mots et phrases

Pour traiter le langage, on va avoir besoin de définir :

!!! quote "⬙**Caractère** ( [**caractère.I.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/caractère#AB3d4DAd22389e46) )"
       **I** **1** Signe appartenant à un système d'écriture.

!!! quote "⬙**Phonème** ( [**phonème**](https://usito.usherbrooke.ca/d%C3%A9finitions/phonème) )"
       Son du langage intégré au système des sons d’une langue.

!!! quote "⬙**Lettre** ( [**lettre.I.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/lettre#EE6cB7Fd19806e49) )"
       **I** **1** Chacun des signes graphiques dont l'ensemble constitue un alphabet servant à transcrire une langue.

!!! quote "⬙**Mot** ( [**mot.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/mot#bde68C7d43679e37) )"
      **1** Son ou groupe de sons articulés ou figurés graphiquement, constituant une unité porteuse de signification.

!!! quote "⬙**Phrase** ( [**phrase.I.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/phrase#DDCE60FDd5026e37) )"
       **I** **1** Assemblage, oral ou écrit, de mots dont la construction présente un sens complet.



Qui seront structurés de cette manière :

⬙**Lettre**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Caractère**

⬙**Mot**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Séquence**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Lettre**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Phonème**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Sens**<br>

⬙**Phrase**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Séquence**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Mot**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Sens**<br>



#### Exemples

On a déjà vu [plus haut](#exemples_1) comment on écrivait un exemple de phrase.

Sur le même modèle, on peut écrire un exemple de mot :

⬙**"toi"**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Mot**<br>&nbsp;&nbsp;&nbsp;⤷⬙**"t"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"o"**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Suivant**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"i"**<br>



#### Alphabets

Pour les langues munies d'un alphabet, il est assez simple de le définir de cette manière :

!!! quote "⬙**Alphabet** ( [**alphabet.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/alphabet#aa344FBd30002e43) )"
    **1** Ensemble de signes disposés selon un ordre conventionnel et qui servent à transcrire les sons d’une langue.



⬙**Alphabet**<br>&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Ensemble**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Quoi**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Lettres**<br>

Puis d'en instancier un exemplaire comme ceci :

⬙**"Alphabet Latin"**<br>&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Alphabet**<br>&nbsp;&nbsp;&nbsp;⤷⬙**A**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Lettre**<br>&nbsp;&nbsp;&nbsp;⤷⬙**B**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Lettre**<br>&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**C**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Lettre**<br>&nbsp;&nbsp;&nbsp;*(etc.)*



#### Idéogrammes

Pour les écritures idéographiques (chinois, japonais), on peut les définir comme suit :

⬙**剑**<br>&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Caractère**<br>&nbsp;&nbsp;⤷⬙**Sens**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Épée**<br>&nbsp;&nbsp;⤷⬙**Prononciation**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**"jian"**<br>



#### Chiffres

La représentation des nombres se fait à l'aide de chiffres définis comme suit :

!!! quote "⬙**Chiffre** ( [**chiffre.1**](https://usito.usherbrooke.ca/d%C3%A9finitions/chiffre#cc9eAa7d53959e42) )"
    **1** Caractère servant à représenter un nombre.

⬙**Chiffre**<br>&nbsp;&nbsp;⤷⬙**Être**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⤷⬙**Caractère**<br>



## Utilisation des structures

On verra dans d'autres notes comment utiliser ces structures :

* Comme base pour le [raisonnement](RaisonnementSymbolique.md).
* Comme un simple graphe relationnel pour réaliser une [mémoire associative](MémoireAssociative.md).



??? note "**TODO**"
    • Une comparaison ?<br>• La multitude ou la singularité ?<br>• Les exclusions ? La négation ?<br>
