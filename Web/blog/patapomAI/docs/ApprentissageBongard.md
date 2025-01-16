# Apprentissage et Résolution des problèmes de Bongard

##### 

On pense par exemple aux problèmes de [Bongard](https://en.wikipedia.org/wiki/Bongard_problem) répertoriés par Harry Foundalis[^1].

![](images\Learning\Bongard Problem.png)

Pour résoudre ces problèmes, il faut trouver la différence entre la page de gauche et la page de droite. Dans l'exemple ci-dessus (problème numéro ?), les formes de gauche sont toutes convexes tandis que celles de droite sont toutes concaves (les chiffres et lettres rouges ont été rajoutées).

On voit que pour parvenir à les résoudre, on a besoin de 2 choses : un étage de "vision" qui analyse et décompose les images, et un étage de "raisonnement" qui va tenter de trouver les différences.

Or, rien de plus simple pour une représentation symbolique du problème de trouver les points communs et les différences entre 2 représentations !

###### Première étape

Imaginons ici qu'on ait une couche de vision fonctionnelle qui soit capable de nous retourner, pour chacune des images :

1. Une liste de lignes connectées formant un triangle noir
2. Une liste d'arcs connectés et fermés dessinant une forme blanche
3. Une ellipse blanche décrite par son centre et ses 2 axes principaux
4. Une liste de lignes connectées et fermées dessinant une forme blanche
5. Un rectangle blanc décrit par son centre et ses 2 axes principaux
6. Un disque noir décrit par son centre et son rayon

Et pour les images de droite :

A. Une liste d'arcs connectés et fermés dessinant une forme blanche

B. Une liste de lignes et d'arcs connectés et fermés dessinant une forme noire / une polyline épaisse noire décrite par ses points de contrôle avec des extrémités plates et un arc de connexion

C. Une liste de lignes connectées et fermées dessinant une forme noire

D. Une liste d'arcs connectés et fermés dessinant une forme blanche

E. Une ligne épaisse noire décrite par ses points de contrôle, son épaisseur et la forme de ses extrémités

F. Une liste de lignes connectées et fermées dessinant une croix blanche

###### Deuxième étape

Ensuite, l'étage de raisonnement va tenter de déterminer le plus de propriétés possibles pour chacune de ces formes :

1. Forme fermée, aire, périmètre, noir, angles aigu, etc. (et implicitement convexe, hérité des propriétés des triangles)
2. Forme fermée, aire, périmètre, blanc, forme obtuse, etc. → une procédure va déterminer la convexité
3. Forme fermée, aire, périmètre, blanc, forme allongée, forme horizontale, etc. (et implicitement convexe, hérité des propriétés des ellipses)
4. Forme fermée, aire, périmètre, blanc, forme diagonale, hexagone irrégulier, forme de diamant, etc. → une procédure va déterminer la convexité
5. Forme fermée, aire, périmètre, blanc, rectangle, forme diagonales, etc. (et implicitement convexe, hérité des propriétés des rectangles)
6. Forme fermée, aire, périmètre, noir, disque, etc. (et implicitement convexe, hérité des propriétés des cercles)

Et pour les images de droites :

A. Forme fermée, aire, périmètre, blanc, sorte de haricot, etc. → une procédure va déterminer la concavité

B. C'est une forme qui pose problème ici, car on peut la considérer en effet comme une :

&nbsp;    B.1. Forme ouverte, monodimensionnelle, longueur, épaisseur, noire

&nbsp;    B.2. Forme fermée, aire, périmètre, blanc, sorte de V pointant vers la droite, etc. → une procédure va déterminer la concavité

C. Forme fermée, aire, périmètre, blanc, sorte de haricot, etc. → une procédure va déterminer la concavité

D. Forme fermée, aire, périmètre, blanc, sorte de haricot, etc. → une procédure va déterminer la concavité

E.  C'est la seconde forme qui pose problème car on peut la considérer en effet comme une :

&nbsp;    E.1. Forme ouverte, monodimensionnelle, longueur, épaisseur, noire

&nbsp;    E.2. Forme fermée, aire, périmètre, noire, forme serpentine, etc. → une procédure va déterminer la concavité

F. Forme fermée, aire, périmètre, blanc, sorte de haricot, etc. → une procédure va déterminer la concavité

###### Troisième étape

On va lister toutes les propriétés communes aux formes de la page de gauche :

* Formes fermées
* Aire moyenne (qu'on aura déterminé en comparant la moyenne et l'écart type entre toutes les aires pour décider que les formes avaient toutes à peu près la même taille moyenne par rapport au cadre)
* Périmètre moyen (idem que pour l'aire)
* Convexité

Tandis qu'elles diffèrent par :

* Leur couleur : on a du blanc ou du noir
* Leur orientation : pas d'orientation précise souvent, parfois aligné, parfois diagonale
* Leur type : on a des polylines, des arcs ou des primitives



Puis toutes les propriétés communes aux formes de la page de droite :

Tandis qu'elles diffèrent par :



###### Quatrième étape

C'est la dernière étape où l'on va comparer cette fois-ci les différences entre les propriétés communes de gauche et de droite :



##### ARC Prize

On pense aussi au [ARC Prize](https://arcprize.org/) mis au point par François Chollet.





[^1]: Foundalis H., ["Index of Bongard problems"](https://www.foundalis.com/res/bps/bpidx.htm)
