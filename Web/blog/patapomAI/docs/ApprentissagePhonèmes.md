# Les phonèmes de la langue française

![](images/WorkInProgress.png)

Les phonèmes de la langue française sont au nombre de 36[^1] :

**Voyelles**

[i] : <b>i</b>l ; [e] : bl<b>é</b> ; [ɛ] : col<b>è</b>re ; [a] : pl<b>a</b>tte ; [ɑ] : p<b>â</b>te ; [ɔ] : m<b>o</b>rt ; [o] : ch<b>au</b>d ; [u] : gen<b>ou</b>  [y] : r<b>u</b>e ; [ø] : p<b>eu</b> ; [œ] : p<b>eu</b>r ; [ə] : l<b>e</b> ; [ɛ̃] : pl<b>ein</b> ; [ɑ̃] : s<b>an</b>s ; [ɔ̃] : b<b>on</b> ; [œ̃] : br<b>un</b>.

**Semi-consonnes**

[j] : <b>y</b>eux ; [w] : <b>ou</b>i ; [ɥ] : l<b>u</b>i.

**Consonnes**

[p] : <b>p</b>ère ; [t] : <b>t</b>erre ; [k] : <b>c</b>ou ; [b] : <b>b</b>on ; [d] : <b>d</b>ans ; [ɡ] : <b>g</b>are ; [f] : <b>f</b>eu ; [s] : <b>s</b>ale ; [ʃ] : <b>ch</b>at ; [v] : <b>v</b>ous ; [z] : <b>z</b>éro ; [ʒ] : <b>j</b>e ; [l] : <b>l</b>ent ; [ʁ] : <b>r</b>ue ; [m] : <b>m</b>ain ; [n] : <b>n</b>ous ; [ɲ] : a<b>gn</b>eau.

**Consonnes parfois ajoutées mais relevant d'emprunts aux langues étrangères**

[h] : <b>h</b>op ; [ŋ] : campi<b>ng</b> ; [x] : jota espagnole, c'h breton et '*kh*, plutôt prononcés [χ] d'ailleurs.



## Problème

On dispose d'un ensemble de 50,000 mots français accompagnés de leur représentation phonétique, par exemple ***"agneau" [aɲo]***.

On cherche à apprendre de manière non-supervisée quels groupes de lettres correspondent à quels groupes de phonèmes, par exemple "a" = [a], "gn" = [ɲ], "eau" = [o].



Cela peut paraître un problème anodin à première vue mais cela va pourtant nous emmener à travers un fascinant voyage qui va éprouver notre algorithme d'apprentissage et nous amener à envisager de nombreux concepts centraux à un algorithme beaucoup plus généraliste, comme la notion de *confiance* et la notion de *règle*. Ça permet également de frôler la notion de méta-apprentissage, où l'on examine ses propres règles d'apprentissage pour les améliorer et les systématiser.



Comme pour chaque problème d'apprentissage, on essaie (1) de se placer dans un état où l'on ignorerait tout du résultat, (2) d'imaginer comment nous, humains, nous attaquerions à la résolution de ce problème et (3) comment on pourrait reproduire cet algorithme de résolution artificiellement.



## Règles d'Apprentissage

Prenons quelques exemples de mots au hasard :

"adverbial" [advɛʀbjal]<br>"colimaçon" [kɔlimasɔ̃]<br>
"lexicographie" [lɛksikɔgʀafi]<br>
"mangue" [mɑ̃g]<br>
"neuronale" [nøʀɔnal]<br>
"organisationnel" [ɔʀganizasjɔnɛl]<br>
"ouatée" ['wate]<br>
"pécore" [pekɔʀ]<br>
"polygénique" [pɔliʒenik]<br>
"quérulente" [keʀylɑ̃t]<br>
"radiogalaxie" [ʀadjogalaksi]<br>
"résistante" [ʀezistɑ̃t]<br>
"sarcophage" [saʀkɔfaʒ]<br>
"sordidité" [sɔʀdidite]<br>
"tamponnement" [tɑ̃pɔnmɑ̃]<br>
"trépanation" [tʀepanasjɔ̃]<br>
"vampiriser" [vɑ̃piʀize]<br>



On voit qu'on essaie de *mapper* 2 séquences ensemble :

!!! note "Règle 1"
	On sait qu'il y a autant de groupes de lettres que de groupes de phonèmes : c'est un mapping 1-1

	!!! tip "Remarque"
		Certaines lettres sont muettes mais ça ne nous gêne pas qu'elles soient agrégées par un phonème, ce qui donnera une configuration particulière qui ne se produira que dans un contexte qu'on déduira par la suite, dans la partie 2 de l'algorithme d'apprentissage



!!! note "Règle 2"
	Il y a un ordre à respecter : le groupe de lettres doit avoir le même index que le groupe de phonèmes correspondant, on peut pas intervertir l'ordre, par exemple le 2nd groupe de lettres qui serait attaché au 3ème groupe de phonèmes



!!! note "Règle 3"
	Les seules **certitudes** qu'on ait sur la position des groupes c'est que la 1ère lettre et le 1er phonème vont ensemble, ainsi que la dernière lettre et le dernier phonème.
	
	!!! tip "Remarque"
		Mais on peut utiliser une heuristique simple qui consiste à dire qu'une lettre à une position $l \in [1,L]$ donnée va probablement correspondre à un phonème à la position $p \in [1,P]$ où $p \approx l \cdot \frac{P}{L}$ : une lettre au milieu du mot va probablement correspondre à un phonème au milieu aussi.
	
		Cette heuristique va servir d'hypothèse de départ pour effectuer une première tentative de groupement, qu'on raffinera par la suite



# Première Étape

À l'aide de l'heuristique décrite ci-dessus, on va commencer par faire une expérience extrêmement simple : on va découper chacun des 50,000 mots en groupes de lettres / phonèmes qu'on va associer ensemble (par exemple [abc] = "abc"), puis pour chaque combinaison de ces groupes on va incrémenter un compteur (le *refcount*).

* Il y a bien entendu de nombreux couples faux, mais ceux-ci se perdront naturellement dans une "mer de bruit" avec un *refcount* bas ou moyen (ce sont les nuages de points violets en bas du graphique ci-dessous).
* Tandis que les vrais couples vont surnager à la surface de cette mer de bruit avec des *refcounts* très élevés quand on les compare relativement aux autres (ce sont les points jaunes et vert qu'on trouve en haut ou au milieu du graphique ci-dessous).

![.\Images\Phonemes Refcount.png](.\images\Learning\Phonemes Refcount.png)

On peut d'ores-et-déjà s'étonner que les groupes de lettres les plus souvent rencontrés associées aux phonèmes sont **presque tous corrects** et ressortent immédiatement à la suite d'une procédure statistique aussi simple !

!!! note
	On notera qu'au lieu des éléments couplés [ɛ̃], [ɑ̃], [ɔ̃] et [œ̃] composant les voyelles nasales classiques, dans notre application le tilde [~] est découplé des autres éléments phonétiques [ɑ], [ɛ], [ɔ] et [œ]. La raison principale est que c'est plus simple à gérer en code :grin:.<br>Quand j'ai découvert ça, je pensais que ça allait poser problème pour la suite mais je me suis rapidement rendu compte qu'on écrivait un algorithme d'apprentissage et, par conséquent, qu'il était capable d'apprendre ce qu'on voulait à partir des éléments qu'on lui donnait à partir du moment où l'algorithme suit les règles qu'on lui a imposées : 

	 * Si on lui donne les voyelles nasales couplées, alors il apprendra bien [ɑ̃]="en"
	 * Si on lui donne les voyelles nasales découplées, alors il apprendra [ɑ]="e" suivi de [~]="n". Et ça sera à notre charge ensuite, dans la partie 2 de l'algorithme dont on discutera dans un autre article, de déterminer que ces 2 groupes sont liés entre eux grâce à une règle qui dit que "e" suivi de "n" doit se prononcer [ɑ̃]



## Premiers écueuils

À la suite de ce premier succès, nous sommes néanmoins confrontés à de terribles interrogations : oui, nous parvenons effectivement à isoler des groupes corrects mais nous le savons uniquement parce que nous appliquons notre raisonnement et nos connaissances à cet histogramme.

Malheureusement, nous appliquons un biais de confirmation à ces données puisqu'on connaît déjà le résultat, mais qu'en est-il d'un organisme qui n'aurait aucune connaissance préalable ? Comment savoir si les groupes sont à classifier comme vrais ou faux ?

On commence déjà à entrevoir quelques obstacles :

* La fréquence des phonèmes, qui va rendre difficile la comparaison de *refcounts* <u>entre eux</u> puisqu'il n'y a pas réellement de sens à comparer un compteur de groupes faisant intervenir un phonème qui va apparaître 10 fois sur l'ensemble des 50,000 mots, à un compteur de groupes faisant intervenir un phonème qui va apparaître 10,000 fois
* Le besoin d'un méta paramètre qui va contrôler le seuil de *refcount* en-dessous duquel on devrait ignorer les groupes formés (en gros, le seuil qui détermine la transition entre signal et bruit)
    * On peut fixer un seuil arbitrairement haut —comme par exemple prendre uniquement le groupe avec le *refcount* le plus haut— mais alors l'algorithme convergera très lentement (qui plus est, une fois qu'on aura épuisé exhaustivement tous les groupes corrects possibles un par un, on finira quand-même par choisir des groupes incorrects)
    * Si au contraire on prend un seuil trop bas alors on prend le risque de valider trop de groupes, y compris des groupes incorrects, qu'il faudra alors supprimer par la suite — on note alors que dès la 1ère étape, on se doit d'envisager la possibilité d'une **correction** : un groupe n'est jamais définitivement validé, il peut être adopté pour une durée indéterminée puis être finalement abandonné au profit d'une meilleure hypothèse qu'on aura découverte plus tard (c'est le cas ici comme pour chacune de nos connaissances, les phonèmes n'échappent pas à la règle)



### Homogénéisation des *refcounts*

On commence par adresser le problème de la fréquence des phonèmes afin de trouver un moyen "d'homogénéiser" les *refcounts* et les comparer entre eux.

L'idée revient à attribuer un poids à chaque phonème en fonction de sa fréquence d'utilisation, or quoi de mieux que de faire intervenir la notion d'entropie chère à la théorie de l'information pour quantifier l'importance de chaque phonème ?

On commence par calculer le nombre d’occurrences $N_i$ de chaque phonème $i$ parmi notre échantillon de 50,000 mots ainsi que le nombre total d'occurrences de tous les phonèmes $N = \sum_i^P N_i$ où $P$ est l'ensemble des 36 phonèmes de la langue française.

La probabilité de trouver un phonème $i$ dans un mot est donc $p_i = \frac{N_i}{N}$ et la surprise associée à chaque phonème est donnée par $I_i = log_2\left(\frac{1}{p_i}\right)$ et s'exprime en bits.

On exprime la surprise d'une séquence de phonèmes $\left\{ a_0, a_1, \dots, a_n \right\}$ comme étant simplement l'entropie de la séquence $S = \sum_0^n p(a_i) I(a_i)$ normalisée par la somme des probabilités de chaque phonème :


$$
\begin{align}I &= \frac{\sum_0^n p(a_i) I(a_i)}{\sum_0^n p(a_i)} \\
&= \frac{S}{\sum_0^n p(a_i)}
\end{align}
$$



!!! note
	La normalisation de l'entropie permet de garantir l'indépendance vis-à-vis de la taille de la séquence, de plus on retrouve bien la surprise associée à un  seul phonème dans le cas particulier d'une séquence de longueur 1.

#### Pondération des *refcounts*

En pondérant les *refcounts* associés à une séquence de phonèmes par $I$, la surprise associée à la séquence, on va ainsi pouvoir remettre sur un pied d'égalité des phonèmes qui n'ont pas la même fréquence d'utilisation dans la langue :

* Les phonèmes très utilisés comme [i] ou [ʀ] auront un poids assez léger, aux alentours de 3 ou 4
* Tandis que les phonèmes très rares comme [ŋ] (comme dans "parki<strong>ng</strong>") auront un poids qui pourra monter jusqu'à 12



!!! question
	Pourquoi utiliser la surprise plutôt que de renormaliser directement par l'inverse de la fréquence ???



#### Intuition derrière cette pondération

On a déjà évoqué le côté parasite de certains événements haute fréquence dans les données d'entraînement qui vont mener à une sur-représentation de certaines features.

Il semblerait qu'il y ait un côté "naturellement hardcodé" au fait d'accorder <u>moins d'importance</u> à un événement qui se produit souvent ([phénomène d'habituation](https://en.wikipedia.org/wiki/Habituation)) et, au contraire, d'accorder une grande attention à un événement hors du commun : on parle alors de surprise.

C'est effectivement lorsqu'un événement hors du commun se produit qu'on va devoir mettre à jour notre modèle du monde, c'est là où l'on va devoir apprendre quelque chose de nouveau et potentiellement former de nouvelles connexions neuronales ou apprendre de nouveaux *patterns* et de nouvelles *règles*.



### Seuil d'acceptation

Armés de *refcounts* homogènes, on peut donc ensuite s'attaquer au problème de la classification des groupes de lettres/phonèmes.



**Notes:**

Prudence au début de l'algo : on n'accepte qu'un seul groupe de lettres par phonème.

Par la suite, on va pouvoir comparer combien de refs on avait pour les groupes précédents et s'en servir comme heuristique pour déterminer quel ratio on accepte (de plus, on arrêtera d'accepter des groupes tout pinés avec une seule occurrence dans tout le dataset) (ou alors on les accepte mais pour les discard aussitôt, auquel cas il faut garder un dico d'hypothèses rejetées définitivement pour pas tourner en boucle add/remove indéfiniment !)



!!! warning "Méta-Paramètre"
	Le ratio de confiance en-dessous duquel on rejette les hypothèses représente un méta-paramètre de la simulation !



## Résultats

Nous sommes désormais pourvus d'une liste d'**hypothèses**, chacune avec un certain niveau de confiance.

**TODO** Hypothèses toujours réfutables, jamais aucune certitude, on construit sur des bases faibles qu'on étaie au fur-et-à-mesure que les hypothèses se vérifient ou au contraire se voient rejetées



# Seconde Étape

On va ensuite supposer que les hypothèses relevées sont correctes et tenter des les mapper dans les mots du *dataset* :

* On va découper les séquences de phonèmes / lettres non mappées en un arbre de possibilités
* On va choisir la branche qui offre le plus d'hypothèses mappées
    * Si on a autant d'hypothèses mappées dans plusieurs branches alors on va choisir les hypothèses qui rapportent le plus : celles qui sont les plus probables
* Toute portion de branche non mappée avec des hypothèses sera redécoupée en groupes en utilisant la même heuristique de groupement qu'à l'étape 1



Par exemple, en utilisant uniquement les hypothèses émergeant de la 1ère étape (cf. graphique des premiers groupes de phonèmes tout en haut), on va pouvoir totalement mapper le mot **"adverbial" [advɛʀbjal]** grâce aux hypothèses suivantes :

* [a]="a"
* [d]="d"
* [v]="v"
* [ɛ]="e"
* [ʀ]="r"
* [b]="b"
* [j]="i"
* [a]="a"
* [l]="l"

Tandis qu'on aura quelques difficultés à mapper le mot **chouette [ʃwɛt]** :

* [ʃ]="c"
* "h" n'est pas mappé
* [w]="o"
* "u" n'est pas mappé
* [ɛ]="e"
* [t]="t"
* "te" n'est pas mappé



## Résultats

À la fin de cette étape, on aura donc mappé nos hypothèses de travail partout où on a pu établir des correspondances lettres / phonèmes (les **ancres**).

Les nouvelles séquences de lettres / phonèmes non mappées *entre* ces ancres  seront nécessairement de taille inférieure aux mots entiers qu'on a découpés à l'étape 1, ce qui amènera mécaniquement à un meilleur découpage ultérieur puisqu'on aura de moins en moins de phonèmes / lettres à mapper et donc moins d'incertitude (on a réduit la complexité du problème en le découpant en morceaux).



!!! danger "Note"

	Cependant, il se peut qu'une mauvaise assignation d'hypothèse nous entraîne vers un découpage catastrophique qui va mener par la suite à former de très mauvaises hypothèses : c'est le cas notamment des doubles consonnes qui vont généralement provoquer un décalage subtil d'une lettre vers la gauche ou vers la droite de tout le reste de la séquence.
	
	On verra que d'autres mécanismes très simples permettront de corriger ces erreurs au fur-et-à-mesure.



# Troisième Étape

À la suite de ce nouveau découpage et de ces nouvelles assignations d'hypothèses, on va souvent se retrouver avec des groupes de lettres ou de phonèmes vides :

* C'est le cas notamment des doubles consonnes où la 1ère consonne se trouve mappée sur une hypothèse mais la 2nde consonne n'est assignée à aucun phonème.
* Ou bien dans le cas où on a plusieurs phonèmes mappée sur une seule lettre, comme dans le cas [ks]="x" (comme dans "e<strong>x</strong>cuse") ou [gz]="x" (comme dans "e<strong>x</strong>istence") : seul le 1er phonème est mappé sur la lettre, le 2nd étant non-assigné.
* Ou simplement parce qu'on aura temporairement assigné une hypothèse fausse qui va embarquer une lettre ou un phonème qui auraient dus être assignés à une autre hypothèse, laissant ainsi un trou.
* Ou encore parce que ces lettres ou phonèmes non mappés vont faire partie d'hypothèses non encore déterminées, c'est le cas notamment des suffixes comme "ées" où seule la lettre **"é"=[e]** est mappée mais où "es" restent orphelines, l'hypothèse complète **[e]="ées"** n'existant pas encore.
* Mais parfois encore, c'est tout à fait légitime que des lettres ne soient pas mappées, on pense par exemple au "e" muet comme dans "remu<strong>e</strong>" [ʀəmy]



!!! tip "Soupçon"

	Ici, il semble "naturel" (encore une fois, biais de confirmation) de se dire qu'il n'est pas "normal" d'avoir des groupes vides car ça va à l'encontre d'une des règles d'apprentissage qu'on nous a fixées au départ : il doit y avoir une correspondance 1-1 entre la séquence de lettres et la séquence de phonèmes !
	
	Par conséquent, il est donc "naturel" de supposer qu'on a fait une erreur d'assignation quelque part et qu'on a utilisé une ou plusieurs mauvaises hypothèses.
	
	Les lettres ou les phonèmes non mappés doivent donc forcément faire partie d'un autre groupe : on va devoir les rattacher aux hypothèses à gauche ou à droite — ou les 2 !



## Redécoupage

Va falloir redécouper et réassigner ==> best partition wins !

Même algo ==> refcount + sélection des meilleures hypothèses avec un seuil d'acceptation.

NOTE : Ici on voit qu'il s'agit d'un mécanisme général dès qu'on va isoler une portion du mot où l'on va soupçonner une erreur : on va chercher à le redécouper en utilisant les hypothèses les plus probables. Le plus difficile va être de déterminer **où et quand** on soupçonne une erreur !



## Résultat

On a formé de nouvelles hypothèses qu'on va pouvoir utiliser pour mieux expliquer les groupes de lettres / phonèmes.

NOTE : On commence à voir poindre le besoin de revoir les assignations existantes pour voir si elles sont optimales, ou bien si on aurait pu faire de meilleures assignations et réduire le nombre d'hypothèses en supprimant celles qui puent.



# Quatrième Étape

Rechoucroutage des hypothèses existantes et simplifications.





# LOOP!

Et on retourne à l'étape 1 avec un nouveau set d'hypothèses qu'on va tenter d'appliquer aux mots qui ne sont toujours pas complets.

**TODO :** Graph de completeness à chaque étape → convergence

**TODO :** Graph de création / destruction d'hypothèses + "pouvoir explicatif" / énergie / coût de la solution à chaque étape





# Analyses des hypothèses

## Simplification des hypothèses

À chaque étape on va chercher à simplifier des hypothèses trop complexes si elles sont décomposables en hypothèses plus simples : c'est très facile à faire puisqu'il suffit de vérifier qu'une séquence de phonèmes associée à une séquence de lettres peut être découpées et remplacées par d'autres hypothèses plus courtes.

Par exemple si à un moment on a l'hypothèse complexe **[oʀ]="aur"** et qu'on a également les hypothèses simples **[o]="au"** et **[ʀ]="r"** alors on peut remplacer chaque occurrence de l'hypothèse complexe par les 2 plus simples et "le coût énergétique" d'explication des hypothèses s'en trouvera réduit (on retrouve ici le principe de parcimonie, ou rasoir d'Ockham).



## Hypothèses improbables

Au cours de l'exécution de la boucle d'apprentissage, on trouve parfois des hypothèses farfelues formées "par dépit", par manque d'autre explication à un instant *t*, comme par exemple **[]="???"**".

On peut calculer une mesure d'improbabilité de telles hypothèses d'après la taille moyenne des hypothèses : en effet, dans la langue française, la plupart des graphèmes (ce sont les différentes façons d'écrire un son lié à un phonème) ne comportent qu'une ou deux lettres, rarement trois.

On obtient donc un ratio de lettres par phonème entre 1 et 2, ce qu'on retrouve en général dans nos hypothèses puisqu'on les a créées en découpant des mots de la langue française et qui contiennent les graphèmes en question, obéissant donc à leur distribution en taille.

On va noter $\tilde{L}$ le nombre moyen de lettres par phonèmes pour notre ensemble d'hypothèses.

Puis on va établir la mesure d'équilibre $b(h)$ d'une hypothèse $h$ comme étant :
$$
b(h) = \log_2\left( \frac{l(h)}{p(h)} \right) - \log_2(\tilde{L})
$$
Où $l(h)$ et $p(h)$ représentent respectivement le nombre de lettres et de phonèmes de l'hypothèse $h$.

Cette mesure d'équilibre prendra une valeur de $-1$ si une hypothèse est 2 fois plus courte que la moyenne, et une valeur de $+1$ si une hypothèse est 2 fois plus longue que la moyenne.

On décidera par la suite de rejeter une hypothèse comme étant improbable dans le cas où $\left|b(h)\right| > B_{threshold}$.

!!! warning "Méta-Paramètre"
	$B_{threshold}$ représente ici un méta-paramètre de la simulation !



## Méta-Reflexion

On notera également qu'à mesure qu'on forme des hypothèses, on va pouvoir prendre du recul sur leur structure en appliquant l'algorithme d'apprentissage aux règles de formation des hypothèses elles-mêmes : on va faire une somme des *refcounts* des *features* qui forment les hypothèses afin de voir celles qui sont **caractéristiques** et pouvoir en déduire des **règles** de formation.

On fait donc du **méta-apprentissage** : on apprend des choses *sur* notre apprentissage !

!!! note
	Contrairement à l'imperfection du découpage des mots due à l'incertitude des informations qu'on cherche à apprendre, ici les paramètres des règles de formation des hypothèses sont très peu nombreuses (taille des séquences, doublement de lettres, quels types de lettres, etc.) et par conséquent l'apprentissage de ces règles est beaucoup moins sujet au *bruit* !





# Notion de certitude

**TODO**

* Notion de certitude et étaiement de la "confiance"
    * La certitude est une notion contextuelle, elle dépend de son environnement
* Définition de la notion de "avoir du sens" (on sent que quelque chose "clique" et s'emboîte parfaitement dans notre raisonnement : on a *compris* !)
    * ==> on s'arrête quand on a "fait du sens", comme disent les québécois (état stable)





# Notes de travail

Description sommaire de l'algorithme :

## Idée de base

Donc l'idée de base c'est de commencer à faire des "groupes simples" en divisant la séquence de lettres en autant de groupes qu'il y a de phonèmes, puis de compter le nombre d'occurrences de chaque groupe pour chaque phonème à travers les 47019 mots.

Ça ressort d'emblée des trucs intéressants avec une distribution façon loi de Zipf : énormément de matches [r]="r", puis ça tombe très vite, les groupes faux étant quasiment insignifiants.

> C'est évidemment souvent faux parce qu'à ce stade on n'a aucune certitude sur la position des groupes de lettres / phonèmes. Donc on sait qu'on va accorder peu d'importance à la position des groupes formés. Mais plus on va former d'hypothèses qui se vérifient, plus on va devenir certain des groupes qu'on va créer.



### Validation des hypothèses principales

On va donc valider la principale hypothèse pour chaque phonème (celle qui aura le plus grand nombre de matches) et l'assigner aux groupes, les validant de fait. Mais il va rester plein de groupes non validés, c-à-d sans hypothèse attachée.

## Idée suivante

On va prendre les sous-séquences non-mappées sur une hypothèse (donc les séquences de lettres et de phonèmes qui se trouvent **entre** 2 groupes mappés) et tenter de matcher le plus possible de nos hypothèses. Ça permet déjà de retrouver des "*anchors*" assez certaines au milieu de séquences incertaines.

On fait le matching des 2 côtés à la fois : de la gauche vers la droite, et de la droite vers la gauche.

* Les groupes qui n'ont toujours pas été matchés seront processés au "round suivant".
* Les groupes qui ont soit des lettres vides, soit des phonèmes vides vont être enregistrés pour être traités juste après (c'est le cas par exemple des doubles consonnes où seule l'une des 2 consonnes aura été mappée sur son phonème, la 2nde n'étant mappée sur rien ou sur un mauvais phonème)



### Extension des groupes vides

Une fois qu'on a tenté de trouver des hypothèses fortes pour mapper des bouts de séquences incertaines, on va tenter de rattacher les groupes vides à leurs voisins.

L'idée est simple : si on n'a pas réussi à matcher des lettres à un phonème, c'est qu'elles font partie du groupe d'à-côté, soit à gauche, soit à droite.

> Ça n'est pas toujours vrai cependant : on notera le cas du 'e' muet, par exemple dans "abatt**e**ment" [abatmɑ̃] qui n'est mappé sur rien du tout !

> Mais ça marche hyper bien pour former les doubles consonnes qui font tant dérailler l'algo de "groupement simple" initial ! Car si on est décalé d'une lettre à un moment, patatras ! Tous les groupes suivants sont décalés et on forme plein d'hypothèses absurdes (qu'on ne sélectionne évidemment pas à cause de leur faible ref count) dont on aura beaucoup de mal à se débarrasser !

Ça fonctionne assez bien car ça permet de faire ressortir énormément de nouvelles hypothèses intéressantes tout de suite, et de compléter les hypothèses existantes qui sont extrêmement strictes en comparaison : on ne choisit **qu'une seule** hypothèse à chaque round, la plus forte, pour chaque phonème. Tandis qu'ici dans cet algo, on valide toutes les hypothèses les plus probables entre celle de gauche ou celle de droite !

La "certitude" associée à chaque nouvelle hypothèse est calculée comme étant son ref count / ref count de l'hypothèse la plus référencée.

> Il faudrait rajouter un degré de certitude supplémentaire aux hypothèses en début / fin de mot car là, le choix est évident !



## Cas tordus et exceptions

### Abaisseur

Dans "abaisseur" on va se retrouver avec un groupe parfaitement valide [oe]="eu" qui va être changé en [r]="ur" simplement parce que [r]="ur" a 2283 matches, tandis que [oe]="eu" n'en a que 1800.

C'est essentiellement dû au fait que [r] est bien plus répandu, y compris dans les mauvaises hypothèses, que [oe] !

> Il faudrait pondérer chaque hypothèse de match par le nombre d'occurrences dans les exemples !
>
> ==> Utiliser la surprise associée au phonème ?

### Abattement

Ici, c'est le mapping [t]="te" qui va l'emporter sur le mapping correct [t]="tt" simplement parce qu'il y a énormément de cas de mots contenant [t]="te", notamment comme suffixe, par rapport au nombre de mots avec la double consonne "tt" !

**NOTE :** On notera ici qu'intuitivement un humain va former une sorte de **règle apprise** : « on a vu beaucoup de phonèmes être mappés sur des doubles consonnes et donc c'est probable que ça soit le cas ici aussi » et on préférera donc "tt" à "te"...

> C'est un peu flippant car ça veut dire que l'algo d'apprentissage doit également apprendre des règles d'associations de phonème en fonction du contexte **en même temps** qu'on essaie d'apprendre les phonèmes eux-mêmes ?!
>
> Or c'est précisément le but de la 2ème étape de mon test : mapper les phonèmes sur des mots inconnus. C'est là où le contexte des lettres va entrer en jeu pour sélectionner telle ou telle hypothèse. Mais j'avais prévu ça dans un 2nd temps, pas immédiatement à la 1ère étape !

> J'avais cependant déjà commencé à me poser cette question à cause d'un autre cas, justement. Est-ce que je dois encore écouter mon instinct et commencer à plancher sur un algo plus complexe encore ? :sweat_smile:



## Règles Apprises

Souvent doublement de consonnes

Pas plus de 2 consonnes identiques

Suffixes avec lettres muettes (ex: vite**sse**, haut**es**)

Préfixes et suffixes ont souvent des liens avec l'étymologie des mots

"t+eu", "r+eu", "l+eu"

[€]="et" n'est valable qu'en fin de mot



## Notes

Différence entre phonétique et phonologie : https://fr.wikipedia.org/wiki/Phonologie
Apparemment, la phonologie ne fait pas la distinction entre les sons trop proches, genre bien, brun, etc.

> :warning:  Qu'on cherche à patcher des groupes vides, mieux matcher dès le départ, construire des hypothèses plus longues à partir des plus courtes, ou réduire les hypothèses trop longues en des plus petites, on doit toujours arriver au même résultat !
>
> ==> Le résultat final de l'opération, la solution, devrait représenter une sorte de "minimum d'énergie" dans l'espace des solutions... Et a priori ça devrait être ce qu'on cherche à réaliser, quel que soit le problème !






[^1]: ["Les phonèmes du français"](https://fr.wikipedia.org/wiki/Phon%C3%A8me)
