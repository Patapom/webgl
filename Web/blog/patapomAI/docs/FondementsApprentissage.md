# Les fondements de l'apprentissage

Comment déchiffre-t-on une chose inconnue, un langage, un cryptage, un code secret ?

On commence par trouver des similitudes, des choses qui se ressemblent, des *patterns* réguliers (on pense à la pierre de Rosette de Champolion ou au *"heil Hitler"* des câbles nazis qui ont aidé à leur déchiffrement). Ou bien on cherche des fréquences de tokens qui sortent du lot, des ruptures dans les répétitions : un signal au milieu du bruit.



## Apprentissage Hebbien

Donald Hebb a introduit la règle bien connue "[*cells that fire together wire together*](https://fr.wikipedia.org/wiki/R%C3%A8gle_de_Hebb)".

C'est bien de cela dont il s'agit ici aussi : même au niveau macroscopique des symboles, bien au-dessus du niveau neuronal, les symboles qui s'activent ensemble vont se renforcer.

Pour commencer, on ne peut rien apprendre d'un seul élément : il nous faut forcément un moyen de *comparaison* avec un autre élément du même type.

Si l'on cherche à apprendre la [*qualia*](https://en.wikipedia.org/wiki/Qualia) &#11033;*Rouge*, il va nous falloir 2 choses rouges :

![Matching qualia](images\Learning\Qualia Matching.png)

!!! note
    Ici, le nuage désigne une chose qui possède divers *attributs* ou *qualités* représentés par les ellipses, les attributs sont généralement perçus par les sens (domaine concret, de la perception physique) ou conçus par le raisonnement (domaine abstrait, des idées).



Idéalement, les 2 choses à comparer devraient être *les plus orthogonales possibles* et ne se ressembler **que** par le critère qu'on cherche à mémoriser :

* Si les 2 choses sont strictement orthogonales dans **toutes** les dimensions possibles **sauf** la dimension particulière de la qualité qu'on cherche à discerner, alors on a effectivement appris la *qualia* : on a fait du *one-shot learning*.
* En pratique, il est impossible que 2 choses soient dissemblables en tout point sauf un; On doit toujours faire face à un ensemble de critères "parasites" qui vont nous induire en erreur : on va devoir comparer d'autres exemples de choses possédant la qualité à discerner afin départager les bonnes des mauvaises informations.



## En pratique

Voici ce qui se passe communément quand on apprend en examinant une suite d'exemples :

![image-20250114144222118](images\Learning\Qualia Typical Learning.png)



1. La tâche d'apprentissage débute avec l'exemple **(1)** : on ne peut rien apprendre en l'état, puisqu'on n'a aucun point de comparaison
2. On fournit à l'algorithme l'exemple **(2)** :
    * On peut éliminer les percepts **grand, petit, joyeux, méchant** car ils ne sont pas communs aux 2 exemples
    * Les 3 percepts communs entre les 2 exemples sont **chien, doux, rouge** → pour l'instant, la qualia &#11033;*Rouge* = **chien + doux + rouge**
3. On fournit ensuite l'exemple **(3)** :
    * Cette fois-ci, on peut éliminer les percepts **chien, chat**
        * :warning: Mais il est probable que l'algorithme ait appris le concept &#11033;Animal ! Or, **chien** et **chat** ont comme point commun d'être des animaux, ils héritent donc du concept &#11033;Animal.
        * Donc, on peut conserver la qualité d'**animal**, commune à **chien** et **chat**
    * Les percepts communs sont désormais &#11033;*Rouge* = **animal + doux + rouge**
4. On fournit finalement l'exemple **(4)** :
    * On peut enfin éliminer les percepts **doux** et **maison**, ainsi que le concept **animal** puisqu'on voit qu'une maison peut aussi bien faire l'affaire !
        * :warning: Mais il est probable que l'algorithme ait appris le concept &#11033;Objet ! Or **animal** et **maison** ont comme point commun d'être des objets (on notera qu'on peut difficilement remonter à un niveau plus générique et que ça n'est, finalement, pas un mauvais critère du tout pour qualifier &#11033;*Rouge*)
        * Donc, on peut conserver la qualité d'**objet**, commune à **chien, chat** et **maison**
    * Les percepts communs sont désormais &#11033;Rouge = **objet + rouge**



L'algorithme est terminé. Est-il pour autant complet ? Est-ce que la *qualia* &#11033;*Rouge* est effectivement bien représentée par les 2 attributs retenus ?



## L'expérience

Il faut bien comprendre que l'algorithme dépeint ci-dessus fonctionne en permanence chez les êtres vivants, il n'y a pas de fin à l'expérience vécue autre que par l'arrêt total de l'organisme.

On va donc affiner notre *croyance* de ce que représente un concept particulier au fur-et-à-mesure de notre expérience dans le monde et de nos rencontres avec les autres êtres vivants et leurs expériences propres.

### La *Confiance*

On s'aperçoit que, contrairement à l'apprentissage profond qui lisse tous les exemples et les agrège en une moyenne comprenant le bon comme le mauvais (les *biais*), notre algorithme ne requiert que très peu d'exemples pour être efficace : il fait du *few-shots learning*.

En contrepartie, il est extrêmement sujet aux **mauvais exemples** ! Surtout au début, où les erreurs de classification peuvent se révéler catastrophiques !

En effet, on ne s'est pas encore posé la question de **qui** (ou **quoi**) fournit les exemples à l'algorithme décrit ci-dessus ?

* Les exemples sont-ils fondés dans le réel ? Sont-ils reçus de notre environnement ? Les a-t-on perçus ou expérimentés nous-mêmes ?
    * Auquel cas, nous sommes forcés de les croire et notre **confiance** est maximale !
    * Les bébés n'ont pas d'autre choix que de croire leurs yeux, leurs oreilles et leur corps quand ils font l'expérience du monde
* Ou bien les exemples nous ont-ils été livrés par un **tuteur** ?
    * Auquel cas, nous ne pouvons leur accorder qu'une **crédence** égale à la **confiance** qu'on place dans le **tuteur**...
    * Les enfants font intrinsèquement confiance aux adultes pour leur communiquer des informations vraies (du moins, aussi vraies que les adultes puissent en juger)



Imaginons qu'un être fourbe ait décidé de nous induire en erreur en nous donnant cette suite d'exemple et en nous assurant qu'il s'agit bien de 2 choses **rouges** :

![](images\Learning\Qualia Misleading.PNG)

Catastrophe ! On ne peut plus se raccrocher à aucun point commun, au-delà de la caractéristique **objet** extrêmement générique, qui est vraisemblablement le seul point commun entre les 2 choses...

### Backtracking

Dans le cas d'un empoisonnement des exemples comme ci-dessus, notre unique chance est qu'on se rende compte qu'on possède **déjà** une qualification pour la classe **objet** et que ça n'aurait aucun sens de la requalifier comme **rouge** : un concept est <u>unique</u> ! On ne peut lui associer 2 sens ou 2 noms différents.

On se retrouve donc face à un non-sens. On n'a pas d'autre choix que de revenir en arrière et **réviser notre jugement**.

* Il faut ignorer le ou les exemples qui nous ont conduit à cette impasse

* Il faut également réviser la confiance qu'on a accordée au tuteur qui nous a fourni ces exemples moisis !

    * S'il persévère dans son entreprise de désinformation, on peut même aller jusqu'à ignorer totalement ses informations

        :warning: La pente de "*décrédibilisation*" d'une source doit être très rapide, tandis que la pente de "*re-crédibilisation*" doit être extrêmement lente : il va falloir bien se comporter et pendant très longtemps avant de retrouver le niveau de confiance original ! (certains ne font même plus jamais confiance après une trahison)



Ce genre d'erreurs peuvent en effet s'avérer cruciales dans les premiers temps de l'apprentissage, quand le concept n'est pas encore bien formé et se trouve fortement influencé par les aléas (*critical regime*). Par la suite, quand le concept est bien formé car étayé par de nombreux exemples fiables (*stable regime*), il devient plus aisé de rejeter les mauvais exemples qui s'éloigneraient trop (*outliers*) de notre moyenne d'expérience.

![](images\Learning\Noisy Convergence.png)



!!! note
    À noter qu'une pression trop forte et surtout persistante de nouveaux exemples proches mais suffisamment éloignés de notre moyenne pourrait signifier un besoin de devoir classifier une nouvelle variété de concept. Il s'agit de juger (sur quels critères ?) s'il est plus aisé d'étendre ou de généraliser notre concept pour accommoder les nouveaux exemples, ou bien s'il est préférable de créer une toute nouvelle catégorie...



### La notion de *prototype*

Cette fameuse *moyenne de nos expériences* s'apparente à la notion de *prototype* inspirée par [la prototype theory](https://en.wikipedia.org/wiki/Prototype_theory) qui a été proposée par [Eleanor Rosch](https://en.wikipedia.org/wiki/Eleanor_Rosch) en 1971.

En effet, contrairement à la spécification Kantienne des concepts qui impose des frontières très *dures* (binaires) d'appartenance ou non à un groupe si et seulement si la chose à apparenter obéit à des conditions nécessaires et suffisantes (par exemple, "une maison **doit** être carrée"), les prototypes permettent une notion floue, presque molle (biologique ?) d'appartenance, et les frontières qui distinguent un groupe d'un autre sont laissées à la subjectivité et au choix de l'observateur.

On renvoie à la note sur la représentativité neuro-symbolique des concepts pour une discussion plus approfondie sur les ["concepts moyens"](ApprocheNeuroSymbolique.md#).

!!! note
    On laissera donc de côté l'approche Kantienne trop rigide pour l'instant, tout en notant qu'elle est à la base de toute réflexion logique et mathématique.<br>On note par avance qu'il est tout à fait possible de construire un système de croyances et de règles extrêmement rigides et rigoureuses basées sur un apprentissage de concepts "mous" et subjectifs. Après tout, Kant était bien un enfant avant d'écrire ses oeuvres ! :grin:



!!! question
     Finalement, on délaisse Kant pour Hume ? :thinking:



### Pollution par des évènements de haute-fréquence

Outre la pollution par les mauvais exemples, on va également rencontrer de la pollution par des évènements qui se produisent fréquemment et qui vont par conséquent intervenir souvent dans notre apprentissage.

On pense par exemple au concept &#11033;**Objet** vu plus haut : on le rencontre fréquemment car tous les objets en dérivent, on y arrive donc assez naturellement en remontant la hiérarchie de concepts.

Mais cela arrive dans tous les domaines :

* la fréquence des lettres dans l'alphabet (les 'e' seront beaucoup plus souvent rencontrés que les 'w')
* la fréquence des mots dans une langue (les articles "le" et "la" sont peu significatifs mais extrêmement présents dans les textes)
* la fréquence des phonèmes dans les mots (le [r] dans "**r** ouge" est beaucoup plus prépondérant que [ɲ], dans "bor **gn** e")
* les auxiliaires "être" et "avoir" dans la langue, qui interviennent de manière disproportionnée par rapport aux autre verbes
* &lt;TODO un exemple dans la vision ?&gt;



#### Conséquence

La conséquence naturelle de cette pollution est que :

1. ces éléments fréquents vont souvent faire partie de la qualification de concepts qui n'ont rien à voir et il sera difficile de s'en débarrasser
2. il va être difficile de justement qualifier ces éléments fréquents, puisqu'ils font partie de tant de concepts : comment les définir ?

#### Comment y remédier ?

##### Pondérer l'effet des exemples

Si on peut avoir accès à la fréquence d'occurrence des éléments perturbateurs, on peut par exemple pondérer leur importance par la notion de *[surprise](https://en.wikipedia.org/wiki/Information_content)* 

$s(x)=log(\frac{1}{p(x)})$ où $p(x)$ représente la probabilité d'occurrence de l'élément $x$.



!!! note
    Il est assez facile d'obtenir $p(x)$ dans le cas d'un dataset figé : il suffit de compter les occurrences des éléments qu'on cherche à apprendre et de normaliser le tout.

On voit que le poids à accorder aux éléments sera inversement proportionnel à leur fréquence d'apparition : des éléments peu fréquents vont être très surprenants et apporter beaucoup d'information, tandis que les éléments très fréquents ne transporteront que peux d'information et peuvent donc être ignorés.

!!! remark "Dans la vraie vie..."
    J'ai pu remarquer un exemple assez intéressant quand mon fils a malheureusement appris un mot grossier lorsque j'ai juré après m'être fait mal. La coïncidence des évènements **bruit + papa qui crie + mot grossier** étant (idéalement) peu fréquente, elle a évidemment beaucoup plus d'intérêt que les situations habituelles. Comme l'enfant n'a jamais entendu ce mot auparavant (du moins l'espère-t-on), il va immédiatement y accorder beaucoup d'importance. Et la prochaine fois qu'il l'entendra dans un contexte légèrement différent, par exemple **personne énervée + même mot grossier**, il sera aisé de deviner que les gens disent ce mot dans un contexte d'énervement et qu'il revêt donc un caractère particulier, voire tabou...



##### Soustraire l'influence des éléments communs

Si tant est qu'on ait appris des combinaisons linéaires de notions discrètes, comme c'était le cas plus haut avec le concept &#11033;Rouge = **objet + rouge**, et que l'on soit "miraculeusement" parvenu à enfin isoler l'élément polluant (**objet**, dans le cas de &#11033;Rouge), alors il est tout à fait possible de revenir sur toutes les notions apprises précédemment et de leur **soustraire** l'influence de l'élément polluant : on n'aura alors plus que &#11033;Rouge = **rouge**.

Cela s'appelle simplement "réviser son jugement". Mais attention à la cascade d'évènements que ça peut entraîner ! Est-ce que ces croyances n'étaient pas elles-mêmes à la base d'un édifice plus grand ?



### Apprentissage supervisé

L'algorithme apprendra de manière optimale dans le cas où un <u>tuteur de confiance</u> va fournir des exemples bien choisis.

On a vu que l'important n'est pas spécialement le nombre d'exemples, mais surtout le fait qu'ils soient le plus discriminants et le plus représentatifs possibles.

!!! success "Avantages"
    Si le niveau de confiance dans le tuteur est élevé, l'apprentissage peut se faire de manière très rapide, et chaque information apprise aura un degré de confiance aussi élevé que celui du tuteur.

!!! danger "Inconvénients"
    L'apprentissage supervisé demande beaucoup de temps et d'énergie de la part du tuteur (on pense aux profs qui doivent préparer les cours et les exercices :sweat:).



On distingue plusieurs façons d'apprendre de manière supervisée à partir d'un jeu d'exemples donnés : l'apprentissage direct et l'apprentissage inverse.



#### Apprentissage Direct

On donne des exemples où tout est modifié **sauf** l'élément à apprendre.

On va prendre un exemple où l'on veut apprendre comment écrire le mot "chien" en chinois :

1. "Le **chien** est gentil" → **狗** 很好。
2. "Le **chien** mange son repas" → **狗** 吃他的饭。

On voit aisément que le mot "chien" est représenté par le symbole **狗** commun aux 2 exemples

C'est une façon robuste d'apprendre car si la confiance dans le tuteur est grande, il est probable qu'on fasse du *one-shot learning*.

!!! warning
    Dans le cas ci-dessus, il demeure toujours des incertitudes : on ne sait pas s'il y a des variations du symbole chien selon les contextes.<br>Est-ce que le genre et le nombre de chiens importent, comme dans les langues latines ? Est-ce que l'appartenance à un groupe social, ou des notions de politesse influent sur les symboles / mots employés, comme en japonais ?<br>Ce seront autant de leçons supplémentaires qui seront laissées à la charge du tuteur...



#### Apprentissage Inverse

Cette fois-ci, on donne des exemples où tout est identique **sauf** les éléments à apprendre.

Par exemple ici :

1. "**La** porte **est rouge**." → 门 **是红色的**。
2. "**La** maison **est rouge**." → 房子 **是红色的**。



On a cette fois-ci appris plus de choses :

* "être *rouge*" ou "avoir la propriété *rouge*" s'écrirait **是红色的**, car c'est la seule partie commune entre les 2 phrases (on a appliqué la méthode d'apprentissage direct).



Ensuite, par **inversion (ou masquage)** de la partie commune entre les 2 phrases ("____ est rouge." → ___ 是红色的。), on peut en déduire le mot et le symbole manquants :

* "porte" s'écrirait **门**, car c'est le mot et le symbole qui manquent, et c'est la seule partie qui change dans la 1ère phrase (on remarque au passage la forme intéressante du symbole pour la "porte")
* "maison" s'écrirait **房子**, car c'est le mot et le symbole qui manquent, et c'est la seule partie qui change dans la 2nde phrase



### Apprentissage non-supervisé

règles de l'environnement/du tuteur vs. règles arbitraires pré-existantes

==> on s'arrête quand on a "fait du sens" (état stable)



## Compter les occurrences

Il suffit de compter les évènements ==> on obtient des probabilités d'occurrences simplement en divisant par le nombre total d'évènements...



## Notion de certitude

qsd



## Plausibilité biologique

On a vu que la seule chose qui soit réellement nécessaire pour faire fonctionner cet algorithme est d'avoir un mécanisme qui va "compter" les occurrences d'un signal.

On sait que les neurones biologiques peuvent aisément réagir à des impulsions ou des fréquences d'activation. Il est donc assez aisé de concevoir que les neurones biologiques vont pouvoir réagir à une fréquence d'activation d'un capteur qui va détecter une propriété particulière de l'environnement.





### Peut-on tout apprendre avec cet algorithme ?

Vision ? Audio ? Planning ? Probablement.

Est-ce limité à des variables booléennes ? (propriétés / features d'un objet)

La question est : comment généralise-t-on ça aux actions et aux procédures ? À la planification (réentrance, récursion) ? À la structuration hiérarchique de concepts, et pas juste à des séquences ?



### Coût de l'algo

On voit bien qu'il n'y a pas besoin de grosses machines pour faire tourner un algo pareil ! Adieu les actions NVIDIA à 1000$ !



### Attention is all you need

Pour avoir observé mon fils de 4 ans apprendre de son environnement et de ses parents, je me suis rendu compte que s'ils n'avaient pas un *attention span* limité à 4.3 secondes et s'il ne manifestaient pas parfois la volonté la plus tenace à vouloir faire l'inverse de ce qu'on leur demande, les enfants seraient capables d'apprendre et maîtriser des concepts avancés très rapidement et aussi bien qu'une machine ! :sweat_smile:

Comment les objets tombent ? Pourquoi ils rebondissent ? Pourquoi ça fait ce bruit ? Est-ce que ça casse ? Comment ça se démonte ? Quel goût ça a ? Hé mais ça pique ! Oulah trop chaud ! Et si je fais ça, ça fait quoi ? Ouvrir, fermer, ouvrir, fermer, ... ? Bah bah bah bah mah mah mah ?

Les bébés et les jeunes enfants passent leur temps à *répéter* des actions encore et encore ! Ils testent des hypothèses en permanence et s'imprègnent du *feedback* de l'environnement constamment !

Ils font des corrélations action / réaction et éprouvent la physique et la communication sans arrêt !



Mais il faut aussi de la mémoire et une bonne plasticité synaptique ==> les machines ont un avantage considérable sur nous puisqu'elles peuvent mobiliser 100% de leur attention en permanence sur une tâche et mémoriser parfaitement les informations !
