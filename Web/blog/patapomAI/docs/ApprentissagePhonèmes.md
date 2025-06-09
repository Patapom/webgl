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

On dispose d'un ensemble de 50000 mots français et leur représentation phonétique, par exemple "agneau" [aɲo].

On cherche à apprendre de manière automatisée quels groupes de lettres correspondent à quels groupes de phonèmes, par exemple "a" = [a], "gn" = [ɲ], "eau" = [o].



Comme pour chaque problème, on essaie (1) de se placer dans un état où l'on ignorerait tout du résultat, (2) d'imaginer comment nous, humains, nous attaquerions à la résolution de ce problème et (3) comment on pourrait reproduire cet algorithme de résolution artificiellement.

### Intuition

Prenons quelques exemples de mots au hasard :

"adverbial" [advɛʀbjal]
"colimaçon" [kɔlimasɔ̃]
"lexicographie" [lɛksikɔgʀafi]
"mangue" [mɑ̃g]
"neuronale" [nøʀɔnal]
"organisationnel" [ɔʀganizasjɔnɛl]
"ouatée" ['wate]
"pécore" [pekɔʀ]
"polygénique" [pɔliʒenik]
"quérulente" [keʀylɑ̃t]
"radiogalaxie" [ʀadjogalaksi]
"résistante" [ʀezistɑ̃t]
"sarcophage" [saʀkɔfaʒ]
"sordidité" [sɔʀdidite]
"tamponnement" [tɑ̃pɔnmɑ̃]
"trépanation" [tʀepanasjɔ̃]
"vampiriser" [vɑ̃piʀize]

On voit qu'on essaie de *mapper* 2 séquences ensemble :

* On sait qu'il y a autant de groupes de lettres que de groupes de phonèmes : c'est un mapping 1-1
    * NOTE : certaines lettres sont muettes mais ça ne nous gêne pas qu'elles soient agrégées par un phonème, ce qui donnera une configuration particulière qui ne se produira que dans un contexte qu'on déduira par la suite, dans la partie 2 de l'algorithme d'apprentissage

* Il y a un ordre à respecter : le groupe de lettres doit avoir le même index que le groupe de phonèmes correspondant, on peut pas intervertir l'ordre, par exemple le 2nd groupe de lettres qui serait attaché au 3ème groupe de phonèmes
* Les seules **certitudes** qu'on ait sur la position des groupes c'est que la 1ère lettre et le 1er phonème vont ensemble, ainsi que la dernière lettre et le dernier phonème.
* Mais on peut utiliser une heuristique simple qui consiste à dire qu'une lettre à une position $l \in [1,L]$ donnée va probablement correspondre à un phonème à la position $p \in [1,P]$ où $p \approx l \cdot \frac{P}{L}$ : une lettre au milieu du mot va probablement correspondre à un phonème au milieu aussi.
    * NOTE : cette heuristique va servir d'hypothèse de départ pour effectuer une première tentative de groupement, qu'on raffinera par la suite




# Première Tentative

À l'aide de l'heuristique décrite ci-dessus, on va commencer par faire une expérience extrêmement simple : on va découper chacun des 50,000 mots en groupes de lettres / phonèmes qu'on va associer ensemble (par exemple [abc] = "abc"), puis pour chaque combinaison de ces groupes on va incrémenter un compteur (le *refcount*).

* Il y a bien entendu de nombreux faux couples, mais ceux-ci se perdront naturellement dans une "mer de bruit" avec un *refcount* bas ou moyen.
* Tandis que les vrais couples vont surnager à la surface de cette mer de bruit avec des *refcounts* très élevés quand on les compare relativement aux autres.

**TODO** Histogramme de refcounts ?



## Premiers écueuils

À la suite de ce premier succès, nous sommes néanmoins confrontés à des interrogations terribles : oui, nous parvenons effectivement à isoler des groupes corrects mais nous le savons uniquement parce que nous appliquons notre raisonnement et nos connaissances à cet histogramme.

Malheureusement, nous appliquons un biais de confirmation à ces données puisqu'on connaît déjà le résultat, mais qu'en est-il d'un organisme qui n'aurait aucune connaissance préalable ? Comment savoir si les groupes sont à classifier comme vrais ou faux ?

On commence déjà à entrevoir quelques obstacles :

* La fréquence des phonèmes, qui va rendre difficile la comparaison de *refcounts* puisqu'il n'y a pas réellement de sens à comparer un compteur de groupes faisant intervenir un phonème qui va apparaître 10 fois sur l'ensemble des 50,000 mots, à un compteur de groupes faisant intervenir un phonème qui va apparaître 10,000 fois
* Le besoin d'un méta paramètre qui va contrôler le seuil de *refcount* en-dessous duquel on devrait ignorer les groupes formés (en gros, le seuil qui détermine la transition entre signal et bruit)
    * On peut fixer un seuil arbitrairement haut —comme par exemple prendre uniquement le groupe avec le *refcount* le plus haut— mais alors l'algorithme convergera très lentement
    * Si au contraire on prend un seuil trop bas alors on prend le risque de valider trop de groupes, y compris des groupes "parasites", qu'il faudra alors supprimer par la suite — on note alors que dès la 1ère étape, on se doit d'envisager la possibilité d'une *correction : un groupe n'est jamais définitivement validé, il peut être adopté pour une durée indéterminée puis être finalement abandonné au profit d'une meilleure hypothèse qu'on aura découverte plus tard (c'est le cas ici comme pour chacune de nos connaissances, les phonèmes n'échappent pas à la règle)



### Normalisation des *refcounts*

On commence par adresser le problème de la fréquence des phonèmes afin de trouver un moyen de "normaliser" les *refcounts*.

L'idée revient à attribuer un poids à chaque phonème en fonction de sa fréquence d'utilisation, or quoi de mieux que de faire intervenir la notion d'entropie chère à la théorie de l'information pour quantifier l'importance de chaque phonème ?

On commence par calculer le nombre d’occurrences $N_i$ de chaque phonème $i$ parmi notre échantillon de 50,000 mots ainsi que le nombre total d'occurrences de tous les phonèmes $N = \sum_i^P N_i$ où $P$ est l'ensemble des 36 phonèmes de la langue française.

La probabilité de trouver un phonème $i$ dans un mot est donc $p_i = \frac{N_i}{N}$ et la surprise associée à chaque phonème est donnée par $I_i = log_2\left(\frac{1}{p_i}\right)$ et s'exprime en bits.

On exprime la surprise d'une séquence de phonèmes $\left\{ a_0, a_1, \dots, a_n \right\}$ comme étant simplement l'entropie $S = \sum_0^n p(a_i) I(a_i)$ de la séquence normalisée par la somme des probabilités de chaque phonème :
$$
I = \frac{\sum_0^n p(a_i) I(a_i)}{\sum_0^n p(a_i)} = \frac{S}{\sum_0^n p(a_i)}
$$
!!! note
	La normalisation de l'entropie permet de garantir l'indépendance vis-à-vis de la taille de la séquence, de plus on retrouve bien la surprise associée à un  seul phonème dans le cas particulier d'une séquence de longueur 1.

#### Pondération des *refcounts*

En pondérant les *refcounts* associés à une séquence de phonèmes par $I$, la surprise associée à la séquence, on va ainsi pouvoir remettre sur un pied d'égalité des phonèmes qui n'ont pas la même fréquence d'utilisation dans la langue :

* Les phonèmes très utilisés comme [i] ou [ʀ] auront un poids assez léger, aux alentours de 3 ou 4
* Tandis que les phonèmes très rares comme [] auront un poids qui pourra monter jusqu'à 17



???
	Pourquoi utiliser la surprise plutôt que de renormaliser directement par l'inverse de la fréquence ???



#### Intuition derrière cette pondération

On a déjà évoqué le côté parasite de certains événements haute fréquence dans les données d'entraînement qui vont mener à une sur-représentation de certaines features.

Il semblerait qu'il y ait un côté "naturellement hardcodé" au fait d'accorder <u>moins d'importance</u> à un événement qui se produit souvent ([phénomène d'habituation](https://en.wikipedia.org/wiki/Habituation)) et, au contraire, d'accorder une grande attention à un événement hors du commun : on parle alors de surprise.

C'est effectivement lorsqu'un événement hors du commun se produit qu'on va devoir mettre à jour notre modèle du monde, c'est là où l'on va devoir apprendre quelque chose de nouveau et potentiellement former de nouvelles connexions neuronales ou apprendre de nouveaux *patterns* et de nouvelles *règles*.



### Notion de certitude

**TODO**

* Notion de certitude et étaiement de la "confiance"
    * La certitude est une notion contextuelle, elle dépend de son environnement
* Définition de la notion de "avoir du sens" (on sent que quelque chose "clique" et s'emboîte parfaitement dans notre raisonnement : on a *compris* !)
    * ==> on s'arrête quand on a "fait du sens" (état stable)





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
