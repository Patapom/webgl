# Apprentissage et résolution des problèmes de Bongard

Les problèmes de [Bongard](https://en.wikipedia.org/wiki/Bongard_problem) sont des sortes de puzzles inventés par l'informaticien Mikhail Moiseevich Bongard au milieu des années 60. Ils ont été répertoriés par Harry Foundalis[^1] pour ses travaux de thèse.

Pour résoudre ces problèmes, il faut trouver la différence entre la page de gauche et la page de droite, comme dans l'exemple ci-dessous (j'ai rajouté les chiffres et lettres rouges moi-même) :

![](images\Reasoning\Bongard Problem.png)

!!! tip " "
    Ici, la réponse est que les formes de gauche sont toutes convexes tandis que celles de droite sont toutes concaves.

On voit que pour parvenir à les résoudre, on a besoin de 2 choses :

1. un étage de "vision" qui analyse et décompose chaque image en structures de propriétés symboliques
2. un étage de "raisonnement" qui va tenter de trouver les points communs et les différences entre ces structures



## Résolution

Ignorons dans un premier temps la couche de vision —qui est plus du domaine neuronal que du domaine symbolique, cf. [note sur l'approche neuro-symbolique](ApprocheNeuroSymbolique.md)— et imaginons ici que cette couche soit capable de nous retourner une représentation symbolique de tous les éléments remarquables dans chaque image.

Une fois arrivé à l'étage symbolique, il n'y a rien de plus simple que de trouver les points communs et les différences entre 2 représentations et ainsi résoudre le problème !

On va utiliser un algorithme en 4 étapes :

1. **On demande à l'étage de vision de nous retrouver une description des éléments géométriques dans chaque image**

    ​	Ça peut être des lignes, des arcs, des formes connues, des textures, des couleurs...

2. **On va analyser la description de chaque image et tenter d'en extraire un maximum de structures possédant un maximum de propriétés** (cf. [note sur la représentation conceptuelle](StructureConcepts.md))

    ​	Ça peut être l'orientation (horizontal, vertical, diagonal), la forme, la couleur, la texture, l'*aspect ratio* (pointu, allongé, obtu), sa longueur, sa surface, un type de forme connue, est-ce que la forme est ouverte ou fermée ? si elle est fermée est-ce qu'elle est convexe ou concave ? si c'est une hiérarchie de structures alors comment sont connectés les enfants et combien y en a-t-il ? ...

3. **On va chercher toutes les propriétés communes aux structures de gauche, et toutes les propriétés communes aux structures de droite**

    ​	Ça peut vouloir dire remonter la hiérarchie des concepts pour chaque couple de propriétés jusqu'à ce qu'on trouve 2 concepts en commun (évidemment, on ne s'intéressera probablement pas au concepts trop génériques dont toutes les propriétés héritent, et on s'arrêtera aux traits communs les plus "importants", c-à-d les plus bas dans la hiérarchie de concepts et donc les plus proches de nos propriétés initiales)

4. **Pour finir, on va analyser la liste des propriétés restantes à gauche et à droite, et ne garder que la ou les propriétés qui sont différentes tout en étant liées entre elles (par exemple par une relation de contraire, ou d'appartenance à un même type)**

    ​	Par exemple, si toutes les formes de gauche et de droite ont les mêmes propriétés sauf leur couleur (par exemple "jaune" à gauche et "rouge" à droite), alors la réponse est que les formes diffèrent par leur couleur (qui est le type commun à "jaune" et "rouge").
    ​	Et si toutes les formes de gauche sont ouvertes et celles de droite sont fermées, elles diffèrent par ces 2 propriétés contraires l'une de l'autre.



## Exemple

Appliquons donc l'algorithme de résolution à l'exemple qu'on a déjà présenté plus haut :

![](images\Reasoning\Bongard Problem.png)

### Première étape

On obtient donc une représentation symbolique de tous les éléments remarquables dans chacune des images, qu'on va répertorier comme suit :

#### À gauche

1. Une liste de lignes connectées formant un triangle noir
2. Une liste d'arcs connectés dessinant une forme blanche
3. Une ellipse blanche décrite par son centre et ses 2 axes principaux
4. Une liste de lignes connectées dessinant une forme blanche
5. Un rectangle blanc décrit par son centre et ses 2 axes principaux
6. Un disque noir décrit par son centre et son rayon

#### À droite

&nbsp;&nbsp; A. Une liste d'arcs connectés dessinant une forme blanche

&nbsp;&nbsp; B. Une liste de lignes et d'arcs connectés dessinant une forme noire **ou bien** une polyline noire décrite par ses points de contrôle avec des, son épaisseur, des extrémités plates et un arc de connexion arrondi

&nbsp;&nbsp; C. Une liste de lignes connectées dessinant une forme noire

&nbsp;&nbsp; D. Une liste d'arcs connectés dessinant une forme blanche

&nbsp;&nbsp; E. Une liste d'arcs connectés dessinant une forme noire **ou bien** une courbe épaisse noire décrite par ses points de contrôle, son épaisseur et la forme de ses extrémités

&nbsp;&nbsp; F. Une liste de lignes connectées dessinant une croix blanche



### Deuxième étape

Ensuite, l'étage de raisonnement va tenter de déterminer le plus de propriétés possibles pour chacune des formes.

!!! remark "Les propriétés précédées d'un '#' sont des grandeurs numériques, les autres peuvent être considérées comme des booléens (présence de la propriété = *true*, absence = *false*)"

#### À gauche

1. Forme fermée, #aire, #périmètre, noir, angles aigu, etc. (et implicitement convexe, hérité des propriétés des triangles)
2. Forme fermée, #aire, #périmètre, blanc, forme obtuse, etc. → une procédure va déterminer la convexité
3. Forme fermée, #aire, #périmètre, blanc, forme allongée, forme horizontale, etc. (et implicitement convexe, hérité des propriétés des ellipses)
4. Forme fermée, #aire, #périmètre, blanc, forme diagonale, hexagone irrégulier, forme de diamant, etc. → une procédure va déterminer la convexité
5. Forme fermée, #aire, #périmètre, blanc, rectangle, forme diagonales, etc. (et implicitement convexe, hérité des propriétés des rectangles)
6. Forme fermée, #aire, #périmètre, noir, disque, etc. (et implicitement convexe, hérité des propriétés des cercles)

#### À droite

&nbsp;&nbsp; A. Forme fermée, #aire, #périmètre, blanc, sorte de haricot, etc. → une procédure va déterminer la concavité

&nbsp;&nbsp; B. C'est une forme qui pose problème ici, car on peut la considérer en effet comme une :

&nbsp;    B.1. Forme ouverte, monodimensionnelle, #longueur, #épaisseur, noire

&nbsp;    B.2. Forme fermée, #aire, #périmètre, blanc, sorte de V pointant vers la droite, etc. → une procédure va déterminer la concavité

&nbsp;&nbsp; C. Forme fermée, #aire, #périmètre, noir, intersection de 2 lignes, etc. → une procédure va déterminer la concavité

&nbsp;&nbsp; D. Forme fermée, #aire, #périmètre, blanc, forme obtuse, etc. → une procédure va déterminer la concavité

&nbsp;&nbsp; E.  C'est la seconde forme qui pose problème car on peut la considérer en effet comme une :

&nbsp;    E.1. Forme ouverte, monodimensionnelle, #longueur, #épaisseur, noire

&nbsp;    E.2. Forme fermée, #aire, #périmètre, noire, forme serpentine, etc. → une procédure va déterminer la concavité

&nbsp;&nbsp; F. Forme fermée, #aire, #périmètre, blanc, forme de croix, etc. → une procédure va déterminer la concavité



### Troisième étape

On va lister toutes les propriétés communes aux formes de chacune des 2 pages.

#### À gauche

* Formes fermées
* Aire moyenne (qu'on aura déterminé en comparant la moyenne et l'écart type entre toutes les aires pour décider que les formes avaient toutes à peu près la même taille moyenne par rapport au cadre)
* Périmètre moyen (idem aire)
* Convexité

Tandis que les formes diffèrent par :

* Leur couleur : on a du blanc ou du noir
* Leur orientation : pas d'orientation précise souvent, parfois aligné, parfois diagonale
* Leur type : on a des polylines, des arcs ou des primitives



#### À droite

* Formes fermées
* Aire moyenne (idem précédemment)
* Périmètre moyen
* Concavité

Tandis qu'elles diffèrent par :

* Leur couleur : on a du blanc ou du noir
* Leur orientation
* Leur type



### Quatrième étape

C'est dans cette dernière étape que l'on va enfin comparer les différences entre les propriétés de gauche et de droite :

* Les formes sont toutes fermées
* Elles sont toutes de "même" taille
* Elles ont toutes le "même" périmètre

On a bien résolu le problème, et la solution est :

* Les formes diffèrent par leurs propriétés de **convexité** et de **concavité** !



En effet :

* On a bien 2 propriétés différentes entre les formes de gauche et de droite
* Ces 2 propriétés sont liées l'une à l'autre par une relation de **contraire**



## Problèmes

On a vu dans l'exemple précédent qu'on peut considérer plusieurs hypothèses de construction structurelle, comme dans le cas des formes B et E qui ont 2 interprétations possibles.

On va devoir former des hypothèses avec chacune des possibilités :

* B1 + E1 → Les 2 formes sont monodimensionnelles, ce sont des lignes ou des courbes ouvertes dotées d'une épaisseur
* B2 + E1
* B1 + E2
* B2 + E2 → Les 2 formes sont bidimensionnelles, ce sont des formes fermées



Dans chaque cas on va avoir une liste de propriétés pour ces formes et on va tenter de résoudre le problème en poussant le raisonnement jusqu'au bout avec cette hypothèse.



### Hypothèses menant à une contradiction

Mais on va rapidement s'apercevoir qu'on ne débouche sur aucune solution dès lors qu'on fait intervenir un cas où les formes problématiques sont des *polylines* monodimensionnelles (B1 ou E1) :

* Dans chaque cas, on va comparer des formes bidimensionnelles fermées avec des courbes monodimensionnelles ouvertes.
* Il ne restera effectivement aucune propriété commune entre les formes de la même page, hormis peut-être la taille de la *bounding-box* des formes qui nous permettrait de dire que la seule qualité commune à toutes les formes seraient d'avoir une **taille moyenne**, ou bien une propriété extrêmement générique comme "forme géométrique"

Dans le cas où l'on déciderait de partir sur la seule propriété commune à droite qui serait la taille moyenne, alors quand on va comparer les propriétés communes entre la page de gauche et celle de droite, on s'apercevra qu'il n'y en a finalement aucune qui diffère puisqu'on a toujours affaire à des formes de taille moyenne : le problème ne pourra pas être résolu et l'hypothèse devra être abandonnée.



### Hypothèses menant à plusieurs solutions

Peut-on trouver plusieurs solutions ?

**TODO** essayer de trouver des problèmes où la procédure ne fonctionne pas et où l'on doit départager plusieurs solutions possibles.





## Tests

**TODO** essayer de transcrire plusieurs problèmes de manière symbolique pour tester la procédure....





[^1]: Foundalis H., ["Index of Bongard problems"](https://www.foundalis.com/res/bps/bpidx.htm)
