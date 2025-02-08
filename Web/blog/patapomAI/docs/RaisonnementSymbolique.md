# Raisonnement Symbolique



## Raisonnement à base de concepts

**TODO**

* Raisonnement à partir des structures de concepts
    * Comment lire une question et y répondre ?
* Peut-on comprendre de manière non ambiguë même si l'on attache les concepts n'importe comment ? Ou doit-on respecter une hiérarchie particulière ?
* La question est : comment généralise-t-on ça aux actions et aux procédures ? À la planification (réentrance, récursion) ? À la structuration hiérarchique de concepts, et pas juste à des séquences ?
* Opérations sur les concepts
    * Y a-t-il une algèbre de manipulation de concepts ?



**Notes** :

* Parler du fait que contrairement au code qui est fortement typé, ici le typage est vraiment très "loose"
    * Par exemple quand on répond à la question "quand ?" on va vouloir résoudre une notion de temps qui ne va pas forcément être de type "Temps" mais on peut dire "aujourd'hui" ou "pendant toutes les grandes vacances" ou "au milieu de mon entraînement de foot" ou n'importe quelle tournure alambiquée qui se traduira finalement par un instant ou une durée !
* En général, l'être humain "raisonne mou" : quand on parle de quelque chose qu'on a fait tel jour, on ne veut pas évidemment dire qu'on a commencé à 0h00 pour finir à 23h59
    * Il va falloir vraiment "lâcher du lest" au niveau de la logique quand on va manipuler des concepts humains...



### Procédures et tâches

**TODO** Briques de raisonnement

* Notion de suite logique
* Notion de symétrie
* Notion d'opposés
* Notion de comptage
* Notion d'accélération



### Analogies et métaphores

**TODO** Analogies / métaphores : on va pouvoir transposer certaines situations à d'autres parce qu'une certaine hiérarchie de propriétés sont "allumées" dans les 2 cas



### Causes et effets

**TODO!**



### World Model / Theory of Mind

**TODO**





## Des problèmes "simples"



### Les problèmes de Bongard

On pense par exemple aux problèmes de Bongard, répertoriés par Harry Foundalis.

![](images\Reasoning\Bongard Problem.png)

Pour résoudre ces problèmes, il faut trouver la différence entre la page de gauche et la page de droite. Dans l'exemple ci-dessus (problème numéro ?), les formes de gauche sont toutes convexes tandis que celles de droite sont toutes concaves.

J'ai écrit une [note](RaisonnementBongard.md) à ce sujet.



### ARC Prize

On pense aussi au [ARC Prize](https://arcprize.org/) mis au point par François Chollet.

![](images\Reasoning\ARC Problem.png)

Pour résoudre ces problèmes, on nous donne 3 exemples de question/réponse et il faut trouver la procédure à appliquer pour trouver la 4ème réponse.

J'ai également écrit une [note](RaisonnementARC.md) à ce sujet.



### Unicode Analogies

Alors celui-là, même moi j'arrive pas à résoudre les problèmes. Ça m'a l'air infiniment trop vague et complexe pour être utilisé comme benchmark...

https://openaccess.thecvf.com/content/CVPR2023/papers/Spratley_Unicode_Analogies_An_Anti-Objectivist_Visual_Reasoning_Challenge_CVPR_2023_paper.pdf



## Comment généraliser ?

On a vu qu'il était aisé de faire résoudre des problèmes soi-disant complexes à la machine en spécifiant des algorithmes très simples. Mais comment généraliser cette capacité de raisonnement ? Comment peut-on doter la machine d'un "algorithme à trouver des algorithmes" ?

**TODO** (lol)



