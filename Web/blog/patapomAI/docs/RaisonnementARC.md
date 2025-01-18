# Apprentissage et résolution du challenge ARC

**ARC** signifie *Abstraction and Reasoning Corpus*. Les problèmes du [ARC-Prize](https://arcprize.org/) ont été imaginés et créés par François Chollet[^1] afin de tester les capacités d'un système automatisé à effectuer un raisonnement et s'adapter à de nouveaux problèmes. De tels systèmes pourraient être qualifiés d'AGIs (*Artificial General Intelligence*), par opposition aux systèmes de *narrow AI* qui opèrent dans des domaines limités.

!!! quote "Chollet's prefered definition of AGI"
     AGI is a system that can efficiently acquire new skills and solve open-ended problems.



Voici à quoi ressemble un problème type :

![](images\Reasoning\ARC Problem.png)

Pour résoudre ces problèmes, on examine d'abord 3 exemples de question/réponse visuelles, et on doit répondre à la 4ème question.
Dans l'exemple ci-dessus, il faut *évidemment* remplir les formes closes en jaune.

On voit que ces exemples sont (généralement) simples pour les humains mais extrêmement compliqués pour les machines !
Là où des *humains moyens* font un score de 85% de problèmes résolus, les modèles d'IA font à peine 50%.

!!! note
    Récemment, OpenAI a fait la démonstration d'un modèle O3 qui est parvenu à faire 85% sur le challenge ARC ! Même si pour l'instant le coût de réponse à chaque problème est prohibitif (on parle de $10,000 par problème !), cela laisse tout de même présager un bond qualitatif dans le design des algorithmes de type LLMs !

Chollet a ainsi designé 1000 problèmes de ce type :

* Un ensemble public de 400 problèmes pour l'entraînement du modèle
* Un ensemble public de 400 problèmes pour tester le modèle
* Un ensemble **privé** de 200 problèmes pour tester le modèle et vérifier qu'il est réellement capable d'adaptation en le confrontant à des problèmes jamais vus auparavant





## Préambule

Comme pour les [problèmes de Bongard](RaisonnementBongard.md), on remarque que pour résoudre ces puzzles on va avoir besoin de 2 choses :

1. un étage de "vision" qui analyse et décompose chaque image en structures de propriétés symboliques
2. un étage de "raisonnement" qui va tenter de trouver les points communs et les différences entre ces structures



Cependant, même si certains puzzles offrent des formes géométriques aussi simples que celles des problèmes de Bongard, la plupart du temps ils offrent un réel challenge de par leur nature "pixelisée" : il y a beaucoup de pixels "polluants" qui rendent la vision difficile et empêchent la résolution en des formes simples.

De plus, beaucoup de puzzles sont basés sur la symétrie, l'inversion, l'extension, le remplissage ou l'évidement, etc.

Ce ne sont plus seulement des propriétés à comparer mais également des **tâches à accomplir** !



## Analyse et classification

On va donc procéder à une analyse et une classification de toutes les tâches demandées par les puzzles de l'ensemble d'entraînement.

**TODO**



## Résolution

Ignorons dans un premier temps la couche de vision —qui est plus du domaine neuronal que du domaine symbolique, cf. [note sur l'approche neuro-symbolique](ApprocheNeuroSymbolique.md)— et imaginons ici que cette couche soit capable de nous retourner une représentation symbolique de tous les éléments remarquables dans chaque image.

**TODO**



## Tests

**TODO** essayer de transcrire plusieurs problèmes de manière symbolique pour tester la procédure....



## Ressources

Repository Kaggle ==> https://www.kaggle.com/competitions/arc-prize-2024/data

GitHub ==> https://github.com/fchollet/ARC-AGI





[^1]: Chollet F., ["On the Measure of Intelligence"](https://arxiv.org/abs/1911.01547)
